jest.mock("expo-sqlite", () => ({
  __esModule: true,
  openDatabaseAsync: jest.fn(),
}));

jest.mock("@react-native-async-storage/async-storage", () => ({
  __esModule: true,
  default: {
    getItem: jest.fn(),
    setItem: jest.fn(),
  },
}));

import type { ClassroomSQLiteDatabaseLike } from "../../services/classroom/sqlite/classroomSqliteStorage";
import { SyncQueueSQLiteStorage } from "../../sync/services/syncQueueSqliteStorage";
import type { GenericPendingOp } from "../../sync/services/syncEngine";

class FakeSQLiteDatabase implements ClassroomSQLiteDatabaseLike {
  execStatements: string[] = [];
  runCalls: Array<{ source: string; params: Record<string, string | number | null> }> = [];
  rowsByQuery: Record<string, Array<{ payload_json: string }>> = {};

  async execAsync(source: string): Promise<void> {
    this.execStatements.push(source);
  }

  async runAsync(source: string, params: Record<string, string | number | null>): Promise<void> {
    this.runCalls.push({ source, params });
  }

  async getAllAsync<T>(source: string): Promise<T[]> {
    return (this.rowsByQuery[source] ?? []) as T[];
  }
}

const pendingOp: GenericPendingOp<{ id: number; nombre: string }> = {
  opId: "op_1",
  entity: "alumnos",
  type: "create",
  endpoint: "/api/alumnos",
  payload: { id: 1, nombre: "Ana" },
  createdAt: "2026-06-11T10:00:00.000Z",
  retries: 0,
  failed: false,
};

const failedOp: GenericPendingOp = {
  ...pendingOp,
  opId: "op_failed_1",
  retries: 5,
  failed: true,
};

describe("SyncQueueSQLiteStorage", () => {
  it("escribe operaciones pendientes por entidad en sync_queue", async () => {
    const db = new FakeSQLiteDatabase();
    const storage = new SyncQueueSQLiteStorage(db);

    await storage.writePendingOps("alumnos", [pendingOp]);

    expect(db.execStatements).toHaveLength(1);
    expect(db.runCalls).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          source: "DELETE FROM sync_queue WHERE entity = $entity",
          params: { $entity: "alumnos" },
        }),
        expect.objectContaining({
          source: expect.stringContaining("INSERT OR REPLACE INTO sync_queue"),
          params: expect.objectContaining({
            $id: "op_1",
            $entity: "alumnos",
            $operation: "create",
          }),
        }),
      ]),
    );
  });

  it("lee operaciones pendientes desde payload_json", async () => {
    const db = new FakeSQLiteDatabase();
    db.rowsByQuery[
      "SELECT payload_json FROM sync_queue WHERE entity = $entity ORDER BY created_at ASC"
    ] = [{ payload_json: JSON.stringify(pendingOp) }];
    const storage = new SyncQueueSQLiteStorage(db);

    const result = await storage.readPendingOps("alumnos");

    expect(result).toEqual([pendingOp]);
  });

  it("escribe y lee operaciones fallidas", async () => {
    const db = new FakeSQLiteDatabase();
    db.rowsByQuery["SELECT payload_json FROM failed_sync_ops ORDER BY failed_at ASC"] = [
      { payload_json: JSON.stringify(failedOp) },
    ];
    const storage = new SyncQueueSQLiteStorage(db);

    await storage.writeFailedOps([failedOp]);
    const result = await storage.readFailedOps();

    expect(db.runCalls).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          source: "DELETE FROM failed_sync_ops",
        }),
        expect.objectContaining({
          source: expect.stringContaining("INSERT OR REPLACE INTO failed_sync_ops"),
          params: expect.objectContaining({ $id: "op_failed_1", $entity: "alumnos" }),
        }),
      ]),
    );
    expect(result).toEqual([failedOp]);
  });
});
