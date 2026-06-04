import { useCallback, useEffect, useMemo, useState } from "react";
import { classroomFacade, type ClassroomFacade } from "../../services/classroom/classroomFacade";
import type { BuildClassroomModelResult } from "../../services/classroom/classroomModel";
import type { Alumno, Asistencia, Calificacion, EntregaTarea, Recurso, Tarea } from "../../../types";
import type { UnidadClassroom } from "../../../types/unidadClassroom";

export type ClassroomContentKind = "actividad" | "material";

export interface ClassroomContentItem {
  id: string;
  kind: ClassroomContentKind;
  rawId: number;
  unidadId?: string;
  titulo: string;
  descripcion?: string;
  tipo: string;
  fecha: string;
  fechaEntrega?: string;
  icon: string;
  raw: Tarea | Recurso;
}

export interface ClassroomContentSection {
  id: string;
  nombre: string;
  colapsada: boolean;
  actividadesCount: number;
  materialesCount: number;
  items: ClassroomContentItem[];
}

export interface ClassroomGroupViewModel {
  model: BuildClassroomModelResult | null;
  unidades: UnidadClassroom[];
  contentSections: ClassroomContentSection[];
  feedItems: ClassroomContentItem[];
  alumnos: Alumno[];
  actividades: Tarea[];
  entregas: EntregaTarea[];
  asistencias: Asistencia[];
  calificaciones: Calificacion[];
  materiales: Recurso[];
  isLoading: boolean;
  error: string | null;
  crearUnidad: (nombre: string) => Promise<void>;
  renombrarUnidad: (id: string, nombre: string) => Promise<void>;
  toggleUnidad: (id: string) => Promise<void>;
  eliminarUnidad: (id: string) => Promise<void>;
  reload: () => Promise<void>;
}

export function useClassroomGroupViewModel(
  grupoId: number,
  facade: ClassroomFacade = classroomFacade,
): ClassroomGroupViewModel {
  const [model, setModel] = useState<BuildClassroomModelResult | null>(null);
  const [unidades, setUnidades] = useState<UnidadClassroom[]>([]);
  const [alumnos, setAlumnos] = useState<Alumno[]>([]);
  const [actividades, setActividades] = useState<Tarea[]>([]);
  const [entregas, setEntregas] = useState<EntregaTarea[]>([]);
  const [asistencias, setAsistencias] = useState<Asistencia[]>([]);
  const [calificaciones, setCalificaciones] = useState<Calificacion[]>([]);
  const [materiales, setMateriales] = useState<Recurso[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const reload = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const [
        data,
        unidadesData,
        alumnosData,
        actividadesData,
        entregasData,
        asistenciasData,
        calificacionesData,
        materialesData,
      ] = await Promise.all([
        facade.getClassroomModel(grupoId),
        facade.getUnidadesByGrupoId(grupoId),
        facade.getAlumnosByGrupoId(grupoId),
        facade.getActividadesByGrupoId(grupoId),
        facade.getEntregasByGrupoId(grupoId),
        facade.getAsistenciasByGrupoId(grupoId),
        facade.getCalificacionesByGrupoId(grupoId),
        facade.getMaterialesByGrupoId(grupoId),
      ]);
      setModel(data);
      setUnidades(unidadesData);
      setAlumnos(alumnosData);
      setActividades(actividadesData);
      setEntregas(entregasData);
      setAsistencias(asistenciasData);
      setCalificaciones(calificacionesData);
      setMateriales(materialesData);
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se pudo cargar el grupo");
    } finally {
      setIsLoading(false);
    }
  }, [facade, grupoId]);

  const crearUnidad = useCallback(
    async (nombre: string) => {
      const trimmed = nombre.trim();
      if (!trimmed) return;
      await facade.createUnidad(grupoId, trimmed);
      await reload();
    },
    [facade, grupoId, reload],
  );

  const renombrarUnidad = useCallback(
    async (id: string, nombre: string) => {
      const trimmed = nombre.trim();
      if (!trimmed) return;
      await facade.updateUnidad(id, { nombre: trimmed });
      await reload();
    },
    [facade, reload],
  );

  const toggleUnidad = useCallback(
    async (id: string) => {
      const unidad = unidades.find((item) => item.id === id);
      if (!unidad) return;
      await facade.updateUnidad(id, { colapsada: !unidad.colapsada });
      await reload();
    },
    [facade, reload, unidades],
  );

  const eliminarUnidad = useCallback(
    async (id: string) => {
      await facade.deleteUnidad(id);
      await reload();
    },
    [facade, reload],
  );

  const contentItems = useMemo<ClassroomContentItem[]>(
    () => [
      ...actividades.map((actividad) => ({
        id: `actividad-${actividad.id}`,
        kind: "actividad" as const,
        rawId: actividad.id,
        unidadId: actividad.unidadId,
        titulo: actividad.titulo,
        descripcion: actividad.descripcion,
        tipo: actividad.tipo,
        fecha: toIso(actividad.fechaAsignacion),
        fechaEntrega: toIso(actividad.fechaEntrega),
        icon: "assignment",
        raw: actividad,
      })),
      ...materiales.map((material) => ({
        id: `material-${material.id}`,
        kind: "material" as const,
        rawId: material.id,
        unidadId: material.unidadId,
        titulo: material.titulo,
        descripcion: material.descripcion,
        tipo: material.tipo,
        fecha: toIso(material.fechaModificacion ?? material.fechaCreacion),
        icon: resolveMaterialIcon(material),
        raw: material,
      })),
    ],
    [actividades, materiales],
  );

  const contentSections = useMemo<ClassroomContentSection[]>(() => {
    const sections = unidades.map((unidad) => {
      const items = contentItems
        .filter((item) => item.unidadId === unidad.id)
        .sort(sortContentItems);
      return buildSection(unidad.id, unidad.nombre, unidad.colapsada, items);
    });

    return sections;
  }, [contentItems, unidades]);

  const feedItems = useMemo(
    () =>
      contentSections
        .flatMap((section) => section.items)
        .sort((a, b) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime())
        .slice(0, 10),
    [contentSections],
  );

  useEffect(() => {
    void reload();
  }, [reload]);

  return {
    model,
    unidades,
    contentSections,
    feedItems,
    alumnos,
    actividades,
    entregas,
    asistencias,
    calificaciones,
    materiales,
    isLoading,
    error,
    crearUnidad,
    renombrarUnidad,
    toggleUnidad,
    eliminarUnidad,
    reload,
  };
}

function buildSection(
  id: string,
  nombre: string,
  colapsada: boolean,
  items: ClassroomContentItem[],
): ClassroomContentSection {
  return {
    id,
    nombre,
    colapsada,
    actividadesCount: items.filter((item) => item.kind === "actividad").length,
    materialesCount: items.filter((item) => item.kind === "material").length,
    items,
  };
}

function sortContentItems(a: ClassroomContentItem, b: ClassroomContentItem): number {
  const byKind = Number(a.kind === "material") - Number(b.kind === "material");
  if (byKind !== 0) return byKind;
  return new Date(b.fecha).getTime() - new Date(a.fecha).getTime();
}

function toIso(value: Date | string | undefined): string {
  const date = value ? new Date(value) : new Date();
  return Number.isFinite(date.getTime()) ? date.toISOString() : new Date().toISOString();
}

function resolveMaterialIcon(material: Recurso): string {
  if (material.tipo === "video") return "smart-display";
  if (material.tipo === "audio") return "audiotrack";
  if (material.tipo === "imagen") return "image";
  if (material.tipo === "enlace") return "link";
  if (material.tipo === "presentacion") return "slideshow";
  return "description";
}
