import { openDatabaseAsync, type SQLiteDatabase } from "expo-sqlite";
import type { ClassroomStoragePort } from "../classroomStorage";
import {
  CLASSROOM_SQLITE_SCHEMA,
  CLASSROOM_SQLITE_TABLE_BY_KEY,
  PLANEARIA_CLASSROOM_DB_NAME,
  type ClassroomSqliteTable,
} from "./classroomSqliteSchema";

type SQLiteBindParams = Record<string, string | number | null>;

export interface ClassroomSQLiteDatabaseLike {
  execAsync(source: string): Promise<void>;
  runAsync(source: string, params: SQLiteBindParams): Promise<unknown>;
  getAllAsync<T>(source: string, params?: SQLiteBindParams): Promise<T[]>;
}

interface SqlitePayloadRow {
  payload_json: string;
}

interface PersistableClassroomItem {
  id?: string | number;
  grupoId?: number;
  groupId?: number;
  nombre?: string;
  titulo?: string;
  posicion?: number;
  fechaEntrega?: string | Date;
  fecha?: string | Date;
  alumnoId?: number;
  tareaId?: number;
}

export class ExpoSQLiteClassroomStorage implements ClassroomStoragePort {
  private schemaReady = false;

  constructor(private readonly database: ClassroomSQLiteDatabaseLike) {}

  async readArray<T>(key: string): Promise<T[]> {
    const config = CLASSROOM_SQLITE_TABLE_BY_KEY[key];
    if (!config) {
      return [];
    }

    await this.ensureSchema();
    const rows = await this.database.getAllAsync<SqlitePayloadRow>(
      `SELECT payload_json FROM ${config.table} ORDER BY updated_at ASC`,
    );
    return rows.map((row) => JSON.parse(row.payload_json) as T);
  }

  async writeArray<T>(key: string, data: T[]): Promise<void> {
    const config = CLASSROOM_SQLITE_TABLE_BY_KEY[key];
    if (!config) {
      return;
    }

    await this.ensureSchema();
    await this.database.runAsync(`DELETE FROM ${config.table}`, {});

    await Promise.all(
      data.map((item) => this.upsertItem(config.table, item as PersistableClassroomItem))
    );
  }

  async ensureSchema(): Promise<void> {
    if (this.schemaReady) {
      return;
    }

    await this.database.execAsync(CLASSROOM_SQLITE_SCHEMA);
    this.schemaReady = true;
  }

  private async upsertItem(table: ClassroomSqliteTable, item: PersistableClassroomItem): Promise<void> {
    const id = item.id;
    if (id === undefined || id === null) {
      return;
    }

    const payload = JSON.stringify(item);
    const updatedAt = new Date().toISOString();

    if (table === "groups") {
      await this.database.runAsync(
        "INSERT OR REPLACE INTO groups (id, name, payload_json, updated_at) VALUES ($id, $name, $payload, $updatedAt)",
        { $id: Number(id), $name: item.nombre ?? null, $payload: payload, $updatedAt: updatedAt },
      );
      return;
    }

    if (table === "classroom_units") {
      await this.database.runAsync(
        "INSERT OR REPLACE INTO classroom_units (id, group_id, position, payload_json, updated_at) VALUES ($id, $groupId, $position, $payload, $updatedAt)",
        {
          $id: String(id),
          $groupId: item.grupoId ?? item.groupId ?? null,
          $position: item.posicion ?? null,
          $payload: payload,
          $updatedAt: updatedAt,
        },
      );
      return;
    }

    if (table === "students") {
      await this.database.runAsync(
        "INSERT OR REPLACE INTO students (id, group_id, payload_json, updated_at) VALUES ($id, $groupId, $payload, $updatedAt)",
        { $id: Number(id), $groupId: item.grupoId ?? item.groupId ?? null, $payload: payload, $updatedAt: updatedAt },
      );
      return;
    }

    if (table === "tasks") {
      await this.database.runAsync(
        "INSERT OR REPLACE INTO tasks (id, group_id, due_date, payload_json, updated_at) VALUES ($id, $groupId, $dueDate, $payload, $updatedAt)",
        {
          $id: Number(id),
          $groupId: item.grupoId ?? item.groupId ?? null,
          $dueDate: serializeDate(item.fechaEntrega),
          $payload: payload,
          $updatedAt: updatedAt,
        },
      );
      return;
    }

    if (table === "resources") {
      await this.database.runAsync(
        "INSERT OR REPLACE INTO resources (id, group_id, payload_json, updated_at) VALUES ($id, $groupId, $payload, $updatedAt)",
        { $id: Number(id), $groupId: item.grupoId ?? item.groupId ?? null, $payload: payload, $updatedAt: updatedAt },
      );
      return;
    }

    if (table === "attendance") {
      await this.database.runAsync(
        "INSERT OR REPLACE INTO attendance (id, group_id, student_id, date, payload_json, updated_at) VALUES ($id, $groupId, $studentId, $date, $payload, $updatedAt)",
        {
          $id: Number(id),
          $groupId: item.grupoId ?? item.groupId ?? null,
          $studentId: item.alumnoId ?? null,
          $date: serializeDate(item.fecha),
          $payload: payload,
          $updatedAt: updatedAt,
        },
      );
      return;
    }

    if (table === "grades") {
      await this.database.runAsync(
        "INSERT OR REPLACE INTO grades (id, group_id, student_id, task_id, payload_json, updated_at) VALUES ($id, $groupId, $studentId, $taskId, $payload, $updatedAt)",
        {
          $id: Number(id),
          $groupId: item.grupoId ?? item.groupId ?? null,
          $studentId: item.alumnoId ?? null,
          $taskId: item.tareaId ?? null,
          $payload: payload,
          $updatedAt: updatedAt,
        },
      );
      return;
    }

    await this.database.runAsync(
      "INSERT OR REPLACE INTO submissions (id, task_id, student_id, payload_json, updated_at) VALUES ($id, $taskId, $studentId, $payload, $updatedAt)",
      {
        $id: Number(id),
        $taskId: item.tareaId ?? null,
        $studentId: item.alumnoId ?? null,
        $payload: payload,
        $updatedAt: updatedAt,
      },
    );
  }
}

export async function openClassroomSQLiteStorage(
  databaseName = PLANEARIA_CLASSROOM_DB_NAME,
): Promise<ExpoSQLiteClassroomStorage> {
  const database = await openDatabaseAsync(databaseName);
  const storage = new ExpoSQLiteClassroomStorage(database as SQLiteDatabase);
  await storage.ensureSchema();
  return storage;
}

function serializeDate(value?: string | Date): string | null {
  if (!value) {
    return null;
  }

  if (value instanceof Date) {
    return value.toISOString();
  }

  return value;
}
