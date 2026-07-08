import AsyncStorage from "@react-native-async-storage/async-storage";
import type { GenericPendingOp } from "./syncEngine";
import {
  SYNC_FAILED_OPS_STORAGE_KEY,
  SYNC_PENDING_OPS_STORAGE_PREFIX,
} from "./syncEngine";
import { openSyncQueueSQLiteStorage, type SyncQueueSQLiteStorage } from "./syncQueueSqliteStorage";

export interface SyncQueueMigrationSnapshot {
  version: "sync-queue-sqlite-migration-v1";
  createdAt: string;
  entities: string[];
  keys: Record<string, GenericPendingOp[]>;
}

export interface SyncQueueMigrationResult {
  migratedAt: string;
  snapshot: SyncQueueMigrationSnapshot;
  counts: {
    pending: number;
    failed: number;
  };
}

export interface SyncQueueMigrationOptions {
  entities: string[];
  targetStorage?: SyncQueueSQLiteStorage;
  now?: () => Date;
  getItem?: (key: string) => Promise<string | null>;
}

export async function migrateSyncQueueAsyncStorageToSQLite({
  entities,
  targetStorage,
  now = () => new Date(),
  getItem = AsyncStorage.getItem,
}: SyncQueueMigrationOptions): Promise<SyncQueueMigrationResult> {
  const target = targetStorage ?? (await openSyncQueueSQLiteStorage());
  const migratedAt = now().toISOString();
  const snapshot = await buildSyncQueueMigrationSnapshot({ entities, createdAt: migratedAt, getItem });
  let pendingCount = 0;

  await Promise.all(
    entities.map(async (entity) => {
      const key = getPendingOpsKey(entity);
      const ops = snapshot.keys[key] ?? [];
      await target.writePendingOps(entity, ops);
    })
  );
  pendingCount = entities.reduce((sum, entity) => {
    const ops = snapshot.keys[getPendingOpsKey(entity)] ?? [];
    return sum + ops.length;
  }, 0);

  const failed = snapshot.keys[SYNC_FAILED_OPS_STORAGE_KEY] ?? [];
  await target.writeFailedOps(failed);

  return {
    migratedAt,
    snapshot,
    counts: {
      pending: pendingCount,
      failed: failed.length,
    },
  };
}

export async function buildSyncQueueMigrationSnapshot({
  entities,
  createdAt = new Date().toISOString(),
  getItem = AsyncStorage.getItem,
}: {
  entities: string[];
  createdAt?: string;
  getItem?: (key: string) => Promise<string | null>;
}): Promise<SyncQueueMigrationSnapshot> {
  const keys: Record<string, GenericPendingOp[]> = {};

  const entries = await Promise.all(
    entities.map(async (entity) => {
      const key = getPendingOpsKey(entity);
      return [key, parseOps(await getItem(key))] as const;
    })
  );
  for (const [key, ops] of entries) {
    keys[key] = ops;
  }

  keys[SYNC_FAILED_OPS_STORAGE_KEY] = parseOps(await getItem(SYNC_FAILED_OPS_STORAGE_KEY));

  return {
    version: "sync-queue-sqlite-migration-v1",
    createdAt,
    entities,
    keys,
  };
}

export function serializeSyncQueueMigrationSnapshot(snapshot: SyncQueueMigrationSnapshot): string {
  return JSON.stringify(snapshot, null, 2);
}

function getPendingOpsKey(entity: string): string {
  return `${SYNC_PENDING_OPS_STORAGE_PREFIX}${entity}`;
}

function parseOps(raw: string | null): GenericPendingOp[] {
  if (!raw) {
    return [];
  }

  try {
    const parsed = JSON.parse(raw) as unknown;
    return Array.isArray(parsed) ? (parsed as GenericPendingOp[]) : [];
  } catch {
    return [];
  }
}
