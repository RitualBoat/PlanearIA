import { CLASSROOM_STORAGE_KEYS } from "../classroomStorage";

export const PLANEARIA_CLASSROOM_DB_NAME = "planearia_classroom.db";
const CLASSROOM_SCHEMA_VERSION = 1;

export const CLASSROOM_SQLITE_SCHEMA = `
PRAGMA foreign_keys = ON;

CREATE TABLE IF NOT EXISTS schema_migrations (
  version INTEGER PRIMARY KEY,
  name TEXT NOT NULL,
  applied_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS groups (
  id INTEGER PRIMARY KEY,
  name TEXT,
  payload_json TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS students (
  id INTEGER PRIMARY KEY,
  group_id INTEGER,
  payload_json TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS classroom_units (
  id TEXT PRIMARY KEY,
  group_id INTEGER,
  position INTEGER,
  payload_json TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS tasks (
  id INTEGER PRIMARY KEY,
  group_id INTEGER,
  due_date TEXT,
  payload_json TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS resources (
  id INTEGER PRIMARY KEY,
  group_id INTEGER,
  payload_json TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS attendance (
  id INTEGER PRIMARY KEY,
  group_id INTEGER,
  student_id INTEGER,
  date TEXT,
  payload_json TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS grades (
  id INTEGER PRIMARY KEY,
  group_id INTEGER,
  student_id INTEGER,
  task_id INTEGER,
  payload_json TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS submissions (
  id INTEGER PRIMARY KEY,
  task_id INTEGER,
  student_id INTEGER,
  payload_json TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS sync_queue (
  id TEXT PRIMARY KEY,
  entity TEXT NOT NULL,
  operation TEXT,
  payload_json TEXT NOT NULL,
  created_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS failed_sync_ops (
  id TEXT PRIMARY KEY,
  entity TEXT NOT NULL,
  operation TEXT,
  payload_json TEXT NOT NULL,
  failed_at TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_students_group_id ON students(group_id);
CREATE INDEX IF NOT EXISTS idx_classroom_units_group_position ON classroom_units(group_id, position);
CREATE INDEX IF NOT EXISTS idx_tasks_group_due_date ON tasks(group_id, due_date);
CREATE INDEX IF NOT EXISTS idx_resources_group_id ON resources(group_id);
CREATE INDEX IF NOT EXISTS idx_attendance_group_student_date ON attendance(group_id, student_id, date);
CREATE INDEX IF NOT EXISTS idx_grades_group_student_task ON grades(group_id, student_id, task_id);
CREATE INDEX IF NOT EXISTS idx_submissions_task_student ON submissions(task_id, student_id);
CREATE INDEX IF NOT EXISTS idx_sync_queue_entity_created_at ON sync_queue(entity, created_at);

INSERT OR IGNORE INTO schema_migrations (version, name, applied_at)
VALUES (1, 'classroom_initial', datetime('now'));
`;

export type ClassroomSqliteTable =
  | "groups"
  | "students"
  | "classroom_units"
  | "tasks"
  | "resources"
  | "attendance"
  | "grades"
  | "submissions";

export interface ClassroomSqliteTableConfig {
  table: ClassroomSqliteTable;
  idColumnType: "number" | "string";
}

export const CLASSROOM_SQLITE_TABLE_BY_KEY: Partial<
  Record<(typeof CLASSROOM_STORAGE_KEYS)[keyof typeof CLASSROOM_STORAGE_KEYS], ClassroomSqliteTableConfig>
> = {
  [CLASSROOM_STORAGE_KEYS.grupos]: { table: "groups", idColumnType: "number" },
  [CLASSROOM_STORAGE_KEYS.alumnos]: { table: "students", idColumnType: "number" },
  [CLASSROOM_STORAGE_KEYS.unidades]: { table: "classroom_units", idColumnType: "string" },
  [CLASSROOM_STORAGE_KEYS.tareas]: { table: "tasks", idColumnType: "number" },
  [CLASSROOM_STORAGE_KEYS.tareasLegacy]: { table: "tasks", idColumnType: "number" },
  [CLASSROOM_STORAGE_KEYS.recursos]: { table: "resources", idColumnType: "number" },
  [CLASSROOM_STORAGE_KEYS.asistencias]: { table: "attendance", idColumnType: "number" },
  [CLASSROOM_STORAGE_KEYS.calificaciones]: { table: "grades", idColumnType: "number" },
  [CLASSROOM_STORAGE_KEYS.entregas]: { table: "submissions", idColumnType: "number" },
};
