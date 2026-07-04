import readline from "node:readline";
import {
  inspectClassroomCounts,
  inspectDatabaseOverview,
  inspectSyncQueue,
  listKnownTables,
  listRecentRows,
  locatePlaneariaSqliteDatabase,
} from "./lib/planeariaSqliteTools.mjs";

const serverInfo = {
  name: "planearia-sqlite",
  version: "1.0.0",
};

const tools = [
  {
    name: "planearia_sqlite_locate",
    description: "Locate a PlanearIA SQLite database candidate. Read-only; no SQL execution.",
    inputSchema: objectSchema({
      databasePath: stringSchema("Optional explicit SQLite .db path. Also supported via PLANEARIA_SQLITE_DB."),
    }),
  },
  {
    name: "planearia_sqlite_overview",
    description: "Inspect schema version, table names and row counts for a PlanearIA SQLite database.",
    inputSchema: objectSchema({
      databasePath: stringSchema("Optional explicit SQLite .db path. Also supported via PLANEARIA_SQLITE_DB."),
    }),
  },
  {
    name: "planearia_sqlite_classroom_counts",
    description: "Return read-only counts and last updated timestamps for PlanearIA classroom SQLite tables.",
    inputSchema: objectSchema({
      databasePath: stringSchema("Optional explicit SQLite .db path. Also supported via PLANEARIA_SQLITE_DB."),
    }),
  },
  {
    name: "planearia_sqlite_sync_queue",
    description: "Inspect pending and failed sync queue summaries without mutating SQLite.",
    inputSchema: objectSchema({
      databasePath: stringSchema("Optional explicit SQLite .db path. Also supported via PLANEARIA_SQLITE_DB."),
      limit: numberSchema("Maximum recent queue rows to return, 1-50."),
      includePayload: booleanSchema("Include full parsed payload JSON. Defaults to false."),
    }),
  },
  {
    name: "planearia_sqlite_recent_rows",
    description: "List recent rows from an allowed PlanearIA SQLite table. No arbitrary SQL.",
    inputSchema: objectSchema({
      databasePath: stringSchema("Optional explicit SQLite .db path. Also supported via PLANEARIA_SQLITE_DB."),
      table: { ...stringSchema("Allowed table name."), enum: listKnownTables() },
      limit: numberSchema("Maximum rows to return, 1-50."),
      includePayload: booleanSchema("Include full parsed payload JSON. Defaults to false."),
    }, ["table"]),
  },
];

const rl = readline.createInterface({ input: process.stdin, crlfDelay: Infinity });

rl.on("line", async (line) => {
  if (!line.trim()) return;

  let request;
  try {
    request = JSON.parse(line);
  } catch (error) {
    sendError(null, -32700, `Parse error: ${error.message}`);
    return;
  }

  if (request.method?.startsWith("notifications/")) return;

  try {
    const result = await handleRequest(request);
    if (request.id !== undefined) send({ jsonrpc: "2.0", id: request.id, result });
  } catch (error) {
    sendError(request.id, -32603, error.message);
  }
});

async function handleRequest(request) {
  if (request.method === "initialize") {
    return {
      protocolVersion: request.params?.protocolVersion ?? "2024-11-05",
      capabilities: {
        tools: {},
      },
      serverInfo,
    };
  }

  if (request.method === "ping") {
    return {};
  }

  if (request.method === "tools/list") {
    return { tools };
  }

  if (request.method === "tools/call") {
    const name = request.params?.name;
    const args = request.params?.arguments ?? {};
    const output = await callTool(name, args);

    return {
      content: [
        {
          type: "text",
          text: JSON.stringify(output, null, 2),
        },
      ],
      isError: Boolean(output?.error),
    };
  }

  throw new Error(`Unsupported MCP method: ${request.method}`);
}

async function callTool(name, args) {
  if (name === "planearia_sqlite_locate") return locatePlaneariaSqliteDatabase(args);
  if (name === "planearia_sqlite_overview") return inspectDatabaseOverview(args);
  if (name === "planearia_sqlite_classroom_counts") return inspectClassroomCounts(args);
  if (name === "planearia_sqlite_sync_queue") return inspectSyncQueue(args);
  if (name === "planearia_sqlite_recent_rows") return listRecentRows(args);

  return {
    error: `Unknown tool '${name}'.`,
    availableTools: tools.map((tool) => tool.name),
  };
}

function send(message) {
  process.stdout.write(`${JSON.stringify(message)}\n`);
}

function sendError(id, code, message) {
  send({ jsonrpc: "2.0", id, error: { code, message } });
}

function objectSchema(properties, required = []) {
  return {
    type: "object",
    properties,
    required,
    additionalProperties: false,
  };
}

function stringSchema(description) {
  return { type: "string", description };
}

function numberSchema(description) {
  return { type: "number", description };
}

function booleanSchema(description) {
  return { type: "boolean", description };
}

