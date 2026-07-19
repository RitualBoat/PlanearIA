/**
 * ViewModel del selector transversal de asignar y adjuntar (change assign-sheet, #84).
 *
 * Existe porque asignar ocurria en cuatro superficies y tres de ellas perdian el trabajo
 * del docente: escribian el destino en almacenamiento sin encolar la operacion, asi que el
 * pull siguiente aplicaba `reconcileWithPending` y el remoto ganaba. Aqui la escritura pasa
 * por los contextos que ya llaman a `queueEntityOperation`, que es el unico camino sancionado.
 *
 * La hoja renderiza lo que este hook resuelve; no decide destinos ni ejecuta escrituras.
 */

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { Recurso, Tarea } from "../../types";
import type { UnidadClassroom } from "../../types/unidadClassroom";
import { useGruposContext } from "../context/GruposContext";
import { useRecursos } from "../context/RecursosContext";
import { useEntregables } from "../context/EntregablesContext";
import { classroomFacade } from "../services/classroom/classroomFacade";
import logger from "../utils/logger";

export type ElementoAsignableTipo = "recurso" | "entregable";

export interface ElementoAsignable {
  id: number;
  titulo: string;
  tipo: ElementoAsignableTipo;
}

export interface OpcionDestino {
  id: string;
  label: string;
}

export interface DestinoAsignacion {
  grupoId: number | null;
  unidadId: string | null;
  tareaId: number | null;
}

export interface ResultadoAsignacion {
  /** Elementos que el camino de escritura modifico de verdad. */
  asignados: number;
  /** True solo si la cola quedo drenada para todos: distingue sincronizado de encolado. */
  syncOk: boolean;
}

export interface AssignSheetViewModel {
  clases: OpcionDestino[];
  unidades: OpcionDestino[];
  actividades: OpcionDestino[];
  /** Falso cuando algun elemento no puede referenciar una actividad: el nivel no se ofrece. */
  admiteActividad: boolean;
  destino: DestinoAsignacion;
  elegirClase: (grupoId: number | null) => void;
  elegirUnidad: (unidadId: string | null) => void;
  elegirActividad: (tareaId: number | null) => void;
  /** Nombre legible del destino, para que la confirmacion no sea una formula generica. */
  resumenDestino: string | null;
  puedeConfirmar: boolean;
  cargando: boolean;
  error: string | null;
  reintentar: () => void;
  ejecutando: boolean;
  resultado: ResultadoAsignacion | null;
  asignar: () => Promise<void>;
  reiniciar: () => void;
}

const DESTINO_VACIO: DestinoAsignacion = { grupoId: null, unidadId: null, tareaId: null };

export function useAssignSheet(elementos: ElementoAsignable[]): AssignSheetViewModel {
  const { grupos, isLoading: cargandoClases } = useGruposContext();
  const { actualizarRecurso, obtenerRecursoPorId } = useRecursos();
  const { actualizarEntregable, obtenerEntregablePorId } = useEntregables();

  const [destino, setDestino] = useState<DestinoAsignacion>(DESTINO_VACIO);
  const [unidadesGrupo, setUnidadesGrupo] = useState<UnidadClassroom[]>([]);
  const [actividadesGrupo, setActividadesGrupo] = useState<Tarea[]>([]);
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [ejecutando, setEjecutando] = useState(false);
  const [resultado, setResultado] = useState<ResultadoAsignacion | null>(null);
  const [intento, setIntento] = useState(0);

  // Una respuesta lenta de un grupo abandonado no debe pisar la de su reemplazo.
  const grupoVigente = useRef<number | null>(null);

  useEffect(() => {
    const grupoId = destino.grupoId;
    grupoVigente.current = grupoId;

    if (grupoId === null) {
      setUnidadesGrupo([]);
      setActividadesGrupo([]);
      setCargando(false);
      setError(null);
      return;
    }

    let vigente = true;
    setCargando(true);
    setError(null);

    void (async () => {
      try {
        const [unidades, actividades] = await Promise.all([
          classroomFacade.getUnidadesByGrupoId(grupoId),
          classroomFacade.getActividadesByGrupoId(grupoId),
        ]);
        if (!vigente || grupoVigente.current !== grupoId) return;
        setUnidadesGrupo(unidades);
        setActividadesGrupo(actividades);
      } catch (err) {
        if (!vigente || grupoVigente.current !== grupoId) return;
        logger.error("[useAssignSheet] No se pudieron cargar los destinos:", err);
        setUnidadesGrupo([]);
        setActividadesGrupo([]);
        setError("No se pudieron cargar los destinos de esta clase.");
      } finally {
        if (vigente && grupoVigente.current === grupoId) setCargando(false);
      }
    })();

    return () => {
      vigente = false;
    };
  }, [destino.grupoId, intento]);

  const clases = useMemo<OpcionDestino[]>(
    () =>
      grupos
        .filter((grupo): grupo is typeof grupo & { id: number } => typeof grupo.id === "number")
        .map((grupo) => ({
          id: String(grupo.id),
          label: grupo.nombre ?? `Clase ${grupo.id}`,
        })),
    [grupos]
  );

  const unidades = useMemo<OpcionDestino[]>(
    () => unidadesGrupo.map((unidad) => ({ id: unidad.id, label: unidad.nombre })),
    [unidadesGrupo]
  );

  /**
   * La actividad como destino solo aplica a recursos.
   *
   * Un entregable no tiene campo para referenciar a otro entregable: `Tarea` no declara
   * `tareaId`. Ofrecer el nivel igualmente dejaria al docente eligiendo un destino que la
   * escritura descarta en silencio, y la confirmacion nombraria algo que no va a ocurrir.
   * Con un solo entregable en juego, el nivel desaparece.
   */
  const admiteActividad = useMemo(
    () => elementos.length > 0 && elementos.every((item) => item.tipo === "recurso"),
    [elementos]
  );

  const actividades = useMemo<OpcionDestino[]>(
    () =>
      admiteActividad
        ? actividadesGrupo.map((actividad) => ({
            id: String(actividad.id),
            label: actividad.titulo,
          }))
        : [],
    [actividadesGrupo, admiteActividad]
  );

  const elegirClase = useCallback((grupoId: number | null) => {
    // Cambiar de clase invalida los niveles inferiores: una unidad pertenece a una clase.
    setDestino({ grupoId, unidadId: null, tareaId: null });
    setResultado(null);
  }, []);

  const elegirUnidad = useCallback((unidadId: string | null) => {
    setDestino((prev) => ({ ...prev, unidadId, tareaId: null }));
    setResultado(null);
  }, []);

  const elegirActividad = useCallback((tareaId: number | null) => {
    setDestino((prev) => ({ ...prev, tareaId }));
    setResultado(null);
  }, []);

  const reintentar = useCallback(() => setIntento((valor) => valor + 1), []);

  const reiniciar = useCallback(() => {
    setDestino(DESTINO_VACIO);
    setResultado(null);
    setError(null);
  }, []);

  const resumenDestino = useMemo(() => {
    if (destino.grupoId === null) return null;
    const clase = clases.find((opcion) => opcion.id === String(destino.grupoId));
    if (!clase) return null;
    const partes = [clase.label];
    const unidad = unidades.find((opcion) => opcion.id === destino.unidadId);
    if (unidad) partes.push(unidad.label);
    const actividad = actividades.find((opcion) => opcion.id === String(destino.tareaId));
    if (actividad) partes.push(actividad.label);
    return partes.join(" - ");
  }, [destino, clases, unidades, actividades]);

  // `cargandoClases` cuenta como carga: sin el, un docente con clases ve "aun no tienes
  // clases" durante el arranque del contexto, que es una afirmacion falsa.
  const cargandoTodo = cargando || cargandoClases;

  const puedeConfirmar =
    destino.grupoId !== null && elementos.length > 0 && !ejecutando && !cargandoTodo;

  const asignar = useCallback(async () => {
    if (destino.grupoId === null || elementos.length === 0 || ejecutando) return;

    const grupoId = destino.grupoId;
    // `tareaId` y `asignadoComoTarea` viajan siempre juntos: un material marcado como tarea
    // sin tarea a la que pertenecer se anuncia como algo que no es.
    const tareaId = destino.tareaId ?? undefined;
    const asignadoComoTarea = destino.tareaId !== null;
    // El destino queda completamente especificado por la hoja: un `unidadId` heredado de
    // otra clase apuntaria a una unidad que ya no existe en este grupo.
    const unidadId = destino.unidadId ?? undefined;

    setEjecutando(true);
    setError(null);

    try {
      let asignados = 0;
      let syncOk = true;

      for (const elemento of elementos) {
        if (elemento.tipo === "recurso") {
          // Un id inexistente no se asigna: los contextos hacen upsert sobre el merge, asi
          // que escribir a ciegas crearia una entidad fantasma y despues se afirmaria que
          // se asigno algo que no existe.
          if (!obtenerRecursoPorId(elemento.id)) continue;
          const cambios: Partial<Recurso> = {
            grupoId,
            unidadId,
            tareaId,
            asignadoComoTarea,
          };
          const salida = await actualizarRecurso(elemento.id, cambios);
          if (!salida.syncOk) syncOk = false;
        } else {
          if (!obtenerEntregablePorId(elemento.id)) continue;
          const cambios: Partial<Tarea> = { grupoId, unidadId };
          const salida = await actualizarEntregable(elemento.id, cambios);
          if (!salida.syncOk) syncOk = false;
        }
        asignados += 1;
      }

      setResultado({ asignados, syncOk });
    } catch (err) {
      logger.error("[useAssignSheet] La asignacion fallo:", err);
      setError("No se pudo completar la asignacion.");
    } finally {
      setEjecutando(false);
    }
  }, [
    destino,
    elementos,
    ejecutando,
    actualizarRecurso,
    actualizarEntregable,
    obtenerRecursoPorId,
    obtenerEntregablePorId,
  ]);

  return {
    clases,
    unidades,
    actividades,
    admiteActividad,
    destino,
    elegirClase,
    elegirUnidad,
    elegirActividad,
    resumenDestino,
    puedeConfirmar,
    cargando: cargandoTodo,
    error,
    reintentar,
    ejecutando,
    resultado,
    asignar,
    reiniciar,
  };
}

export default useAssignSheet;
