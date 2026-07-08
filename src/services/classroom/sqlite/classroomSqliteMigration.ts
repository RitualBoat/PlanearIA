import type {
  Alumno,
  Asistencia,
  Calificacion,
  EntregaTarea,
  Grupo,
  Recurso,
  Tarea,
} from "../../../../types";
import type { UnidadClassroom } from "../../../../types/unidadClassroom";
import {
  CLASSROOM_STORAGE_KEYS,
  classroomStorage,
  type ClassroomStoragePort,
} from "../classroomStorage";
import { createClassroomRepository } from "../classroomRepository";
import { openClassroomSQLiteStorage } from "./classroomSqliteStorage";

export interface ClassroomMigrationSnapshot {
  version: "classroom-sqlite-migration-v1";
  createdAt: string;
  keys: Record<string, unknown[]>;
}

export interface ClassroomMigrationResult {
  migratedAt: string;
  snapshot: ClassroomMigrationSnapshot;
  counts: {
    grupos: number;
    alumnos: number;
    unidades: number;
    tareas: number;
    recursos: number;
    asistencias: number;
    calificaciones: number;
    entregas: number;
  };
}

export interface ClassroomMigrationOptions {
  sourceStorage?: ClassroomStoragePort;
  targetStorage?: ClassroomStoragePort;
  now?: () => Date;
}

const ACADEMIC_KEYS = [
  CLASSROOM_STORAGE_KEYS.grupos,
  CLASSROOM_STORAGE_KEYS.alumnos,
  CLASSROOM_STORAGE_KEYS.unidades,
  CLASSROOM_STORAGE_KEYS.tareas,
  CLASSROOM_STORAGE_KEYS.tareasLegacy,
  CLASSROOM_STORAGE_KEYS.recursos,
  CLASSROOM_STORAGE_KEYS.asistencias,
  CLASSROOM_STORAGE_KEYS.calificaciones,
  CLASSROOM_STORAGE_KEYS.entregas,
] as const;

export async function migrateClassroomAsyncStorageToSQLite({
  sourceStorage = classroomStorage,
  targetStorage,
  now = () => new Date(),
}: ClassroomMigrationOptions = {}): Promise<ClassroomMigrationResult> {
  const target = targetStorage ?? (await openClassroomSQLiteStorage());
  const migratedAt = now().toISOString();
  const snapshot = await buildClassroomMigrationSnapshot(sourceStorage, migratedAt);
  const repository = createClassroomRepository(sourceStorage);
  const dataset = await repository.readDataset();

  await target.writeArray<Partial<Grupo>>(CLASSROOM_STORAGE_KEYS.grupos, dataset.grupos);
  await target.writeArray<Alumno>(CLASSROOM_STORAGE_KEYS.alumnos, dataset.alumnos);
  await target.writeArray<UnidadClassroom>(CLASSROOM_STORAGE_KEYS.unidades, dataset.unidades);
  await target.writeArray<Tarea>(CLASSROOM_STORAGE_KEYS.tareasLegacy, dataset.actividades);
  await target.writeArray<Recurso>(CLASSROOM_STORAGE_KEYS.recursos, dataset.materiales);
  await target.writeArray<Asistencia>(CLASSROOM_STORAGE_KEYS.asistencias, dataset.asistencias);
  await target.writeArray<Calificacion>(CLASSROOM_STORAGE_KEYS.calificaciones, dataset.calificaciones);
  await target.writeArray<EntregaTarea>(CLASSROOM_STORAGE_KEYS.entregas, dataset.entregas);

  return {
    migratedAt,
    snapshot,
    counts: {
      grupos: dataset.grupos.length,
      alumnos: dataset.alumnos.length,
      unidades: dataset.unidades.length,
      tareas: dataset.actividades.length,
      recursos: dataset.materiales.length,
      asistencias: dataset.asistencias.length,
      calificaciones: dataset.calificaciones.length,
      entregas: dataset.entregas.length,
    },
  };
}

export async function buildClassroomMigrationSnapshot(
  sourceStorage: ClassroomStoragePort = classroomStorage,
  createdAt = new Date().toISOString(),
): Promise<ClassroomMigrationSnapshot> {
  const keys: Record<string, unknown[]> = {};

  const entries = await Promise.all(
    ACADEMIC_KEYS.map(async (key) => [key, await sourceStorage.readArray<unknown>(key)] as const)
  );
  for (const [key, data] of entries) {
    keys[key] = data;
  }

  return {
    version: "classroom-sqlite-migration-v1",
    createdAt,
    keys,
  };
}

export function serializeClassroomMigrationSnapshot(snapshot: ClassroomMigrationSnapshot): string {
  return JSON.stringify(snapshot, null, 2);
}
