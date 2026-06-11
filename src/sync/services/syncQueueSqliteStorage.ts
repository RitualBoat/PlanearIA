import { openDatabaseAsync, type SQLiteDatabase } from "expo-sqlite";
import type { ClassroomSQLiteDatabaseLike } from "../../services/classroom/sqlite/classroomSqliteStorage";
import { CLASSROOM_SQLITE_SCHEMA, PLANEARIA_CLASSROOM_DB_NAME } from "../../services/classroom/sqlite/classroomSqliteSchema";
import type { GenericPendingOp } from "./syncEngine";

type SQLiteBindParams = Record<string, string | number | null>;

interface SyncQueueRow {
  payload_json: string;
}

export class SyncQueueSQLiteStorage {
  private schemaReady = false;

  constructor(private readonly database: ClassroomSQLiteDatabaseLike) {}

  async ensureSchema(): Promise<void> {
    if (this.schemaReady) {
      return;
    }

    await this.database.execAsync(CLASSROOM_SQLITE_SCHEMA);
    this.schemaReady = true;
  }

  async writePendingOps(entity: string, ops: GenericPendingOp[]): Promise<void> {
    await this.ensureSchema();
    await this.database.runAsync("DELETE FROM sync_queue WHERE entity = $entity", { $entity: entity });

    for (const op of ops) {
      await this.database.runAsync(
        "INSERT OR REPLACE INTO sync_queue (id, entity, operation, payload_json, created_at) VALUES ($id, $entity, $operation, $payload, $createdAt)",
        bindSyncOp(op, op.createdAt),
      );
    }
  }

  async readPendingOps<T = unknown>(entity: string): Promise<GenericPendingOp<T>[]> {
    await this.ensureSchema();
    const rows = await this.database.getAllAsync<SyncQueueRow>(
      "SELECT payload_json FROM sync_queue WHERE entity = $entity ORDER BY created_at ASC",
      { $entity: entity },
    );
    return rows.map((row) => JSON.parse(row.payload_json) as GenericPendingOp<T>);
  }

  async writeFailedOps(ops: GenericPendingOp[]): Promise<void> {
    await this.ensureSchema();
    await this.database.runAsync("DELETE FROM failed_sync_ops", {});

    for (const op of ops) {
      await this.database.runAsync(
        "INSERT OR REPLACE INTO failed_sync_ops (id, entity, operation, payload_json, failed_at) VALUES ($id, $entity, $operation, $payload, $createdAt)",
        bindSyncOp(op, op.createdAt),
      );
    }
  }

  async readFailedOps(): Promise<GenericPendingOp[]> {
    await this.ensureSchema();
    const rows = await this.database.getAllAsync<SyncQueueRow>(
      "SELECT payload_json FROM failed_sync_ops ORDER BY failed_at ASC",
      {},
    );
    return rows.map((row) => JSON.parse(row.payload_json) as GenericPendingOp);
  }
}

export async function openSyncQueueSQLiteStorage(
  databaseName = PLANEARIA_CLASSROOM_DB_NAME,
): Promise<SyncQueueSQLiteStorage> {
  const database = await openDatabaseAsync(databaseName);
  const storage = new SyncQueueSQLiteStorage(database as SQLiteDatabase);
  await storage.ensureSchema();
  return storage;
}

function bindSyncOp(op: GenericPendingOp, createdAt: string): SQLiteBindParams {
  return {
    $id: op.opId,
    $entity: op.entity,
    $operation: op.type,
    $payload: JSON.stringify(op),
    $createdAt: createdAt,
  };
}
