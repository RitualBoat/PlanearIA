import { existsSync, readdirSync, statSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const DEFAULT_DB_NAME = "planearia_classroom.db";
const WORKSPACE_ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..", "..");

const CLASSROOM_TABLES = [
  "groups",
  "students",
  "classroom_units",
  "tasks",
  "resources",
  "attendance",
  "grades",
  "submissions",
];

const SYSTEM_TABLES = ["schema_migrations", "sync_queue", "failed_sync_ops"];
const SAFE_TABLES = [...CLASSROOM_TABLES, ...SYSTEM_TABLES];
const SKIP_DIRS = new Set([
  ".git",
  ".codegraph",
  "node_modules",
  "dist",
  "coverage",
  "android",
  "ios",
  "backend/node_modules",
]);

export function listKnownTables() {
  return [...SAFE_TABLES];
}

export function locatePlaneariaSqliteDatabase({ databasePath, cwd = WORKSPACE_ROOT } = {}) {
  const explicit = databasePath || process.env.PLANEARIA_SQLITE_DB;
  if (explicit) {
    const resolved = path.resolve(cwd, explicit);
    return {
      found: existsSync(resolved),
      path: resolved,
      source: databasePath ? "argument" : "PLANEARIA_SQLITE_DB",
      candidates: existsSync(resolved) ? [resolved] : [],
      note: existsSync(resolved) ? undefined : "The configured SQLite database path does not exist.",
    };
  }

  const candidates = discoverDatabaseCandidates(cwd);
  return {
    found: candidates.length > 0,
    path: candidates[0] ?? null,
    source: candidates.length > 0 ? "workspace-scan" : "not-found",
    candidates,
    note:
      candidates.length > 0
        ? undefined
        : "No PlanearIA SQLite database was found in the workspace. Pass --db <path> or set PLANEARIA_SQLITE_DB.",
  };
}

export async function inspectDatabaseOverview(options = {}) {
  return withDatabase(options, (db, resolved) => {
    const tables = db
      .prepare("SELECT name FROM sqlite_master WHERE type = 'table' AND name NOT LIKE 'sqlite_%' ORDER BY name")
      .all()
      .map((row) => row.name);

    return {
      databasePath: resolved.path,
      found: true,
      schemaVersion: readSchemaVersion(db),
      tables: tables.map((table) => ({
        name: table,
        rowCount: countRows(db, table),
        safeForSamples: SAFE_TABLES.includes(table),
      })),
      planeariaTablesPresent: SAFE_TABLES.filter((table) => tables.includes(table)),
      readOnly: true,
    };
  });
}

export async function inspectClassroomCounts(options = {}) {
  return withDatabase(options, (db, resolved) => ({
    databasePath: resolved.path,
    found: true,
    counts: CLASSROOM_TABLES.map((table) => ({
      table,
      rowCount: tableExists(db, table) ? countRows(db, table) : 0,
      lastUpdatedAt: tableExists(db, table) && hasColumn(db, table, "updated_at") ? maxColumn(db, table, "updated_at") : null,
    })),
    readOnly: true,
  }));
}

export async function inspectSyncQueue(options = {}) {
  const limit = clampLimit(options.limit);

  return withDatabase(options, (db, resolved) => {
    const pendingByEntity = tableExists(db, "sync_queue")
      ? db
          .prepare(
            "SELECT entity, operation, COUNT(*) AS count, MIN(created_at) AS oldestCreatedAt, MAX(created_at) AS newestCreatedAt FROM sync_queue GROUP BY entity, operation ORDER BY entity, operation",
          )
          .all()
      : [];

    const failedByEntity = tableExists(db, "failed_sync_ops")
      ? db
          .prepare(
            "SELECT entity, operation, COUNT(*) AS count, MIN(failed_at) AS oldestFailedAt, MAX(failed_at) AS newestFailedAt FROM failed_sync_ops GROUP BY entity, operation ORDER BY entity, operation",
          )
          .all()
      : [];

    const recentPending = tableExists(db, "sync_queue")
      ? db
          .prepare(
            "SELECT id, entity, operation, created_at, payload_json FROM sync_queue ORDER BY created_at DESC LIMIT ?",
          )
          .all(limit)
          .map((row) => formatQueueRow(row, "created_at", options.includePayload))
      : [];

    const recentFailed = tableExists(db, "failed_sync_ops")
      ? db
          .prepare(
            "SELECT id, entity, operation, failed_at, payload_json FROM failed_sync_ops ORDER BY failed_at DESC LIMIT ?",
          )
          .all(limit)
          .map((row) => formatQueueRow(row, "failed_at", options.includePayload))
      : [];

    return {
      databasePath: resolved.path,
      found: true,
      pendingTotal: tableExists(db, "sync_queue") ? countRows(db, "sync_queue") : 0,
      failedTotal: tableExists(db, "failed_sync_ops") ? countRows(db, "failed_sync_ops") : 0,
      pendingByEntity,
      failedByEntity,
      recentPending,
      recentFailed,
      readOnly: true,
    };
  });
}

export async function listRecentRows(options = {}) {
  const table = String(options.table ?? "");
  const limit = clampLimit(options.limit);

  if (!SAFE_TABLES.includes(table)) {
    return {
      found: false,
      error: `Table '${table}' is not exposed by this read-only inspector.`,
      allowedTables: SAFE_TABLES,
    };
  }

  return withDatabase(options, (db, resolved) => {
    if (!tableExists(db, table)) {
      return {
        databasePath: resolved.path,
        found: true,
        table,
        rows: [],
        note: `Table '${table}' does not exist in this database.`,
        readOnly: true,
      };
    }

    const orderColumn = chooseOrderColumn(db, table);
    const rows = db
      .prepare(`SELECT * FROM ${quoteIdentifier(table)} ORDER BY ${quoteIdentifier(orderColumn)} DESC LIMIT ?`)
      .all(limit)
      .map((row) => formatTableRow(row, options.includePayload));

    return {
      databasePath: resolved.path,
      found: true,
      table,
      orderColumn,
      rows,
      readOnly: true,
    };
  });
}

function discoverDatabaseCandidates(root) {
  const found = [];
  const maxDepth = 5;

  function visit(dir, depth) {
    if (depth > maxDepth || found.length >= 20) return;

    let entries;
    try {
      entries = readdirSync(dir, { withFileTypes: true });
    } catch {
      return;
    }

    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name);
      const relative = path.relative(root, fullPath).replaceAll("\\", "/");

      if (entry.isDirectory()) {
        if (SKIP_DIRS.has(entry.name) || SKIP_DIRS.has(relative)) continue;
        visit(fullPath, depth + 1);
        continue;
      }

      if (entry.isFile() && (entry.name === DEFAULT_DB_NAME || entry.name.endsWith(".db"))) {
        found.push(fullPath);
      }
    }
  }

  visit(root, 0);
  return found;
}

async function withDatabase(options, callback) {
  const resolved = locatePlaneariaSqliteDatabase(options);
  if (!resolved.found || !resolved.path) {
    return {
      found: false,
      databasePath: resolved.path,
      candidates: resolved.candidates,
      note: resolved.note,
      readOnly: true,
    };
  }

  const { DatabaseSync } = await import("node:sqlite");
  const db = new DatabaseSync(resolved.path, { readOnly: true });

  try {
    return callback(db, resolved);
  } finally {
    db.close();
  }
}

function readSchemaVersion(db) {
  if (!tableExists(db, "schema_migrations")) return null;
  const row = db.prepare("SELECT MAX(version) AS version FROM schema_migrations").get();
  return row?.version ?? null;
}

function tableExists(db, table) {
  const row = db
    .prepare("SELECT name FROM sqlite_master WHERE type = 'table' AND name = ?")
    .get(table);
  return Boolean(row);
}

function countRows(db, table) {
  if (!isSafeIdentifier(table)) return 0;
  return db.prepare(`SELECT COUNT(*) AS count FROM ${quoteIdentifier(table)}`).get().count;
}

function maxColumn(db, table, column) {
  if (!isSafeIdentifier(table) || !isSafeIdentifier(column)) return null;
  return db.prepare(`SELECT MAX(${quoteIdentifier(column)}) AS value FROM ${quoteIdentifier(table)}`).get().value ?? null;
}

function hasColumn(db, table, column) {
  return db.prepare(`PRAGMA table_info(${quoteIdentifier(table)})`).all().some((row) => row.name === column);
}

function chooseOrderColumn(db, table) {
  if (hasColumn(db, table, "updated_at")) return "updated_at";
  if (hasColumn(db, table, "created_at")) return "created_at";
  if (hasColumn(db, table, "failed_at")) return "failed_at";
  if (hasColumn(db, table, "id")) return "id";
  return "rowid";
}

function formatQueueRow(row, dateColumn, includePayload) {
  return {
    id: row.id,
    entity: row.entity,
    operation: row.operation,
    at: row[dateColumn],
    payload: includePayload ? parseJson(row.payload_json) : summarizePayload(row.payload_json),
  };
}

function formatTableRow(row, includePayload) {
  if (typeof row.payload_json === "string") {
    return {
      ...omit(row, ["payload_json"]),
      payload: includePayload ? parseJson(row.payload_json) : summarizePayload(row.payload_json),
    };
  }

  return row;
}

function summarizePayload(raw) {
  const payload = parseJson(raw);
  if (!payload || typeof payload !== "object") {
    return { parseable: false };
  }

  return {
    parseable: true,
    keys: Object.keys(payload).slice(0, 20),
    id: payload.id ?? payload.payload?.id ?? null,
    type: payload.type ?? payload.operation ?? null,
    entity: payload.entity ?? null,
  };
}

function parseJson(raw) {
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

function omit(object, keys) {
  const next = { ...object };
  for (const key of keys) delete next[key];
  return next;
}

function clampLimit(value) {
  const number = Number(value ?? 10);
  if (!Number.isFinite(number)) return 10;
  return Math.max(1, Math.min(50, Math.trunc(number)));
}

function quoteIdentifier(identifier) {
  if (!isSafeIdentifier(identifier)) {
    throw new Error(`Unsafe SQLite identifier: ${identifier}`);
  }

  return `"${identifier}"`;
}

function isSafeIdentifier(identifier) {
  return /^[A-Za-z_][A-Za-z0-9_]*$/.test(identifier);
}

function getWorkspaceRoot() {
  return WORKSPACE_ROOT;
}

