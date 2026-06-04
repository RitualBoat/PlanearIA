import AsyncStorage from "@react-native-async-storage/async-storage";

export interface ClassroomStoragePort {
  readArray<T>(key: string): Promise<T[]>;
  writeArray<T>(key: string, data: T[]): Promise<void>;
}

export const CLASSROOM_STORAGE_KEYS = {
  grupos: "@planearia:grupos",
  alumnos: "@planearia:alumnos",
  tareas: "@planearia:entregables",
  tareasLegacy: "@planearia:tareas",
  recursos: "@planearia:recursos",
  asistencias: "@planearia:asistencias",
  calificaciones: "@planearia:calificaciones",
  entregas: "@planearia:entregas",
  entregasLegacy: "@planearia:entregables",
} as const;

export class AsyncStorageClassroomStorage implements ClassroomStoragePort {
  async readArray<T>(key: string): Promise<T[]> {
    const raw = await AsyncStorage.getItem(key);
    if (!raw) {
      return [];
    }

    const parsed = JSON.parse(raw) as unknown;
    return Array.isArray(parsed) ? (parsed as T[]) : [];
  }

  async writeArray<T>(key: string, data: T[]): Promise<void> {
    await AsyncStorage.setItem(key, JSON.stringify(data));
  }
}

export class MemoryClassroomStorage implements ClassroomStoragePort {
  constructor(private readonly initialData: Record<string, unknown[]> = {}) {}

  async readArray<T>(key: string): Promise<T[]> {
    const value = this.initialData[key];
    return Array.isArray(value) ? (value as T[]) : [];
  }

  async writeArray<T>(key: string, data: T[]): Promise<void> {
    this.initialData[key] = data as unknown[];
  }
}

export const classroomStorage = new AsyncStorageClassroomStorage();

