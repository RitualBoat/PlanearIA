/**
 * Asignacion de recursos y entregables a un grupo, para las superficies que aun no montan
 * la hoja compartida (`AssignSheet`, change assign-sheet #84).
 *
 * Este modulo tenia dos defectos silenciosos que se corrigen aqui sin tocar la UI de sus
 * consumidores:
 *
 * 1. Escribia el destino en almacenamiento sin encolar la operacion. Sin trabajo en cola,
 *    `reconcileWithPending` deja ganar al remoto en el pull siguiente y la asignacion
 *    desaparecia sin aviso. Ahora cada mutacion pasa por `queueEntityOperation`.
 * 2. Leia y escribia `@planearia:tareas`, la clave legacy, mientras la app crea y lee
 *    entregables en `@planearia:entregables`. Sobre datos vigentes la asignacion recorria
 *    un array vacio y no modificaba nada. Ahora usa la clave del registro de sincronizacion.
 *
 * La lectura legacy no se toca: `classroomRepository` sigue fusionando `@planearia:tareas`
 * como `tareasLegacy`, asi que los entregables antiguos siguen siendo visibles. No se migra
 * ni se borra dato alguno; solo se deja de escribir en la clave equivocada.
 */

import AsyncStorage from "@react-native-async-storage/async-storage";
import type { Recurso, Tarea } from "../../types";
import { SYNC_ENTITIES, queueEntityOperation } from "../sync/services/entitySync";

const RECURSOS_KEY = SYNC_ENTITIES.recursos.storageKey;
const ENTREGABLES_KEY = SYNC_ENTITIES.entregables.storageKey;

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

/**
 * Encola cada documento modificado como `update` completo.
 *
 * El documento va entero y no como parche porque el backend hace upsert: un parche podria
 * dejar un documento incompleto si el `create` original nunca llego al servidor. Es el
 * mismo criterio que siguen los contextos de datos.
 */
const encolarActualizaciones = async <T extends { id?: unknown }>(
  config: (typeof SYNC_ENTITIES)[keyof typeof SYNC_ENTITIES],
  documentos: T[]
): Promise<void> => {
  for (const documento of documentos) {
    await queueEntityOperation(config, "update", documento);
  }
};

export const asignarRecursosAGrupo = async (
  grupoId: number,
  recursoIds: number[]
): Promise<number> => {
  if (recursoIds.length === 0) return 0;

  const recursos = await obtenerRecursos();
  const modificados: Recurso[] = [];

  const next = recursos.map((item) => {
    if (!recursoIds.includes(item.id)) return item;
    const actualizado = { ...item, grupoId };
    modificados.push(actualizado);
    return actualizado;
  });

  if (modificados.length === 0) return 0;

  await writeArray(RECURSOS_KEY, next);
  await encolarActualizaciones(SYNC_ENTITIES.recursos, modificados);
  return modificados.length;
};

export const asignarEntregablesAGrupo = async (
  grupoId: number,
  entregableIds: number[]
): Promise<number> => {
  if (entregableIds.length === 0) return 0;

  const entregables = await obtenerEntregables();
  const modificados: Tarea[] = [];

  const next = entregables.map((item) => {
    if (!entregableIds.includes(item.id)) return item;
    const actualizado = { ...item, grupoId };
    modificados.push(actualizado);
    return actualizado;
  });

  if (modificados.length === 0) return 0;

  await writeArray(ENTREGABLES_KEY, next);
  await encolarActualizaciones(SYNC_ENTITIES.entregables, modificados);
  return modificados.length;
};

export const desvincularRecursoDeGrupo = async (
  grupoId: number,
  recursoId: number
): Promise<boolean> => {
  const recursos = await obtenerRecursos();
  const modificados: Recurso[] = [];

  const next = recursos.map((item) => {
    if (item.id !== recursoId || item.grupoId !== grupoId) return item;
    const actualizado = { ...item, grupoId: undefined };
    modificados.push(actualizado);
    return actualizado;
  });

  if (modificados.length === 0) return false;

  await writeArray(RECURSOS_KEY, next);
  await encolarActualizaciones(SYNC_ENTITIES.recursos, modificados);
  return true;
};

export const desvincularEntregableDeGrupo = async (
  grupoId: number,
  entregableId: number
): Promise<boolean> => {
  const entregables = await obtenerEntregables();
  const modificados: Tarea[] = [];

  const next = entregables.map((item) => {
    if (item.id !== entregableId || item.grupoId !== grupoId) return item;
    const actualizado = { ...item, grupoId: undefined } as unknown as Tarea;
    modificados.push(actualizado);
    return actualizado;
  });

  if (modificados.length === 0) return false;

  await writeArray(ENTREGABLES_KEY, next);
  await encolarActualizaciones(SYNC_ENTITIES.entregables, modificados);
  return true;
};
