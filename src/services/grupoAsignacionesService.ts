import AsyncStorage from "@react-native-async-storage/async-storage";
import type { Recurso, Tarea } from "../../types";

const RECURSOS_KEY = "@planearia:recursos";
const ENTREGABLES_KEY = "@planearia:tareas";

type AsignableTipo = "recurso" | "entregable";

export interface AsignableItem {
  id: number;
  titulo: string;
  tipo: AsignableTipo;
  subtipo?: string;
  grupoId?: number;
}

const readArray = async <T>(key: string): Promise<T[]> => {
  const raw = await AsyncStorage.getItem(key);
  if (!raw) return [];

  const parsed = JSON.parse(raw);
  return Array.isArray(parsed) ? (parsed as T[]) : [];
};

const writeArray = async <T>(key: string, data: T[]): Promise<void> => {
  await AsyncStorage.setItem(key, JSON.stringify(data));
};

export const obtenerRecursos = async (): Promise<Recurso[]> => {
  return readArray<Recurso>(RECURSOS_KEY);
};

export const obtenerEntregables = async (): Promise<Tarea[]> => {
  return readArray<Tarea>(ENTREGABLES_KEY);
};

export const listarAsignadosGrupo = async (grupoId: number): Promise<AsignableItem[]> => {
  const [recursos, entregables] = await Promise.all([obtenerRecursos(), obtenerEntregables()]);

  const recursosAsignados: AsignableItem[] = recursos.reduce<AsignableItem[]>(
    (acc, item) => {
      if (item.grupoId === grupoId) {
        acc.push({
          id: item.id,
          titulo: item.titulo,
          tipo: "recurso",
          subtipo: item.tipo,
          grupoId: item.grupoId,
        });
      }
      return acc;
    },
    []
  );

  const entregablesAsignados: AsignableItem[] = entregables.reduce<AsignableItem[]>(
    (acc, item) => {
      if (item.grupoId === grupoId) {
        acc.push({
          id: item.id,
          titulo: item.titulo,
          tipo: "entregable",
          subtipo: item.tipo,
          grupoId: item.grupoId,
        });
      }
      return acc;
    },
    []
  );

  return [...entregablesAsignados, ...recursosAsignados];
};

export const asignarRecursosAGrupo = async (
  grupoId: number,
  recursoIds: number[]
): Promise<number> => {
  if (recursoIds.length === 0) return 0;

  const recursos = await obtenerRecursos();
  let updated = 0;

  const next = recursos.map((item) => {
    if (!recursoIds.includes(item.id)) return item;
    updated += 1;
    return { ...item, grupoId };
  });

  await writeArray(RECURSOS_KEY, next);
  return updated;
};

export const asignarEntregablesAGrupo = async (
  grupoId: number,
  entregableIds: number[]
): Promise<number> => {
  if (entregableIds.length === 0) return 0;

  const entregables = await obtenerEntregables();
  let updated = 0;

  const next = entregables.map((item) => {
    if (!entregableIds.includes(item.id)) return item;
    updated += 1;
    return { ...item, grupoId };
  });

  await writeArray(ENTREGABLES_KEY, next);
  return updated;
};

export const desvincularRecursoDeGrupo = async (
  grupoId: number,
  recursoId: number
): Promise<boolean> => {
  const recursos = await obtenerRecursos();
  let changed = false;

  const next = recursos.map((item) => {
    if (item.id !== recursoId || item.grupoId !== grupoId) return item;
    changed = true;
    return { ...item, grupoId: undefined };
  });

  if (changed) {
    await writeArray(RECURSOS_KEY, next);
  }

  return changed;
};

export const desvincularEntregableDeGrupo = async (
  grupoId: number,
  entregableId: number
): Promise<boolean> => {
  const entregables = await obtenerEntregables();
  let changed = false;

  const next = entregables.map((item) => {
    if (item.id !== entregableId || item.grupoId !== grupoId) return item;
    changed = true;
    return { ...item, grupoId: undefined };
  });

  if (changed) {
    await writeArray(ENTREGABLES_KEY, next);
  }

  return changed;
};
