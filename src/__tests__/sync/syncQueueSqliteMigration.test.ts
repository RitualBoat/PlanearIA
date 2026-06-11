jest.mock("@react-native-async-storage/async-storage", () => ({
  __esModule: true,
  default: {
    getItem: jest.fn(),
  },
}));

jest.mock("expo-sqlite", () => ({
  __esModule: true,
  openDatabaseAsync: jest.fn(),
}));

import {
  buildSyncQueueMigrationSnapshot,
  migrateSyncQueueAsyncStorageToSQLite,
  serializeSyncQueueMigrationSnapshot,
} from "../../sync/services/syncQueueSqliteMigration";
import {
  SYNC_FAILED_OPS_STORAGE_KEY,
  SYNC_PENDING_OPS_STORAGE_PREFIX,
  type GenericPendingOp,
} from "../../sync/services/syncEngine";
import { SyncQueueSQLiteStorage } from "../../sync/services/syncQueueSqliteStorage";
import type { ClassroomSQLiteDatabaseLike } from "../../services/classroom/sqlite/classroomSqliteStorage";

class FakeSQLiteDatabase implements ClassroomSQLiteDatabaseLike {
  execStatements: string[] = [];
  runCalls: Array<{ source: string; params: Record<string, string | number | null> }> = [];

  async execAsync(source: string): Promise<void> {
    this.execStatements.push(source);
  }

  async runAsync(source: string, params: Record<string, string | number | null>): Promise<void> {
    this.runCalls.push({ source, params });
  }

  async getAllAsync<T>(): Promise<T[]> {
    return [];
  }
}

const pendingOp: GenericPendingOp<{ id: number }> = {
  opId: "op_pending_1",
  entity: "alumnos",
  type: "create",
  endpoint: "/api/alumnos",
  payload: { id: 1 },
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

describe("syncQueueSqliteMigration", () => {
  it("crea snapshot de pending por entidad y failed ops", async () => {
    const getItem = jest.fn(async (key: string) => {
      if (key === `${SYNC_PENDING_OPS_STORAGE_PREFIX}alumnos`) {
        return JSON.stringify([pendingOp]);
      }
      if (key === SYNC_FAILED_OPS_STORAGE_KEY) {
        return JSON.stringify([failedOp]);
      }
      return null;
    });

    const snapshot = await buildSyncQueueMigrationSnapshot({
      entities: ["alumnos"],
      createdAt: "2026-06-11T10:00:00.000Z",
      getItem,
    });
    const serialized = serializeSyncQueueMigrationSnapshot(snapshot);

    expect(snapshot.keys[`${SYNC_PENDING_OPS_STORAGE_PREFIX}alumnos`]).toEqual([pendingOp]);
    expect(snapshot.keys[SYNC_FAILED_OPS_STORAGE_KEY]).toEqual([failedOp]);
    expect(serialized).toContain("sync-queue-sqlite-migration-v1");
  });

  it("migra pending y failed ops hacia SQLite sin borrar AsyncStorage", async () => {
    const getItem = jest.fn(async (key: string) => {
      if (key === `${SYNC_PENDING_OPS_STORAGE_PREFIX}alumnos`) {
        return JSON.stringify([pendingOp]);
      }
      if (key === SYNC_FAILED_OPS_STORAGE_KEY) {
        return JSON.stringify([failedOp]);
      }
      return null;
    });
    const targetStorage = new SyncQueueSQLiteStorage(new FakeSQLiteDatabase());

    const result = await migrateSyncQueueAsyncStorageToSQLite({
      entities: ["alumnos"],
      targetStorage,
      getItem,
      now: () => new Date("2026-06-11T10:00:00.000Z"),
    });

    expect(result.counts).toEqual({ pending: 1, failed: 1 });
    expect(getItem).toHaveBeenCalledWith(`${SYNC_PENDING_OPS_STORAGE_PREFIX}alumnos`);
    expect(getItem).toHaveBeenCalledWith(SYNC_FAILED_OPS_STORAGE_KEY);
  });
});
