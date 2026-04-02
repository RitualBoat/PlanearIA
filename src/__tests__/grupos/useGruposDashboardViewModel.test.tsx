import { renderHook } from "@testing-library/react-native";
import { useGruposDashboardViewModel } from "../../hooks/useGruposDashboardViewModel";

// ─── Mocks ───

let mockGrupos: any[] = [];
let mockAlumnos: any[] = [];
let mockCalificaciones: any[] = [];
let mockAsistencias: any[] = [];
let mockEntregables: any[] = [];
let mockGruposLoading = false;
let mockGruposError: string | null = null;
const mockReloadGrupos = jest.fn();

jest.mock("../../context/GruposContext", () => ({
  useGruposContext: () => ({
    grupos: mockGrupos,
    isLoading: mockGruposLoading,
    error: mockGruposError,
    reloadGrupos: mockReloadGrupos,
  }),
}));

jest.mock("../../context/AlumnosContext", () => ({
  useAlumnos: () => ({
    alumnos: mockAlumnos,
    isLoading: false,
  }),
}));

jest.mock("../../context/CalificacionesContext", () => ({
  useCalificaciones: () => ({
    calificaciones: mockCalificaciones,
    isLoading: false,
  }),
}));

jest.mock("../../context/AsistenciaContext", () => ({
  useAsistencias: () => ({
    asistencias: mockAsistencias,
    isLoading: false,
  }),
}));

jest.mock("../../context/EntregablesContext", () => ({
  useEntregables: () => ({
    entregables: mockEntregables,
    isLoading: false,
  }),
}));

// ─── Test Data Factories ───

const crearGrupo = (overrides: Partial<any> = {}) => ({
  id: 1,
  nombre: "7A Matemáticas",
  materia: "Matemáticas",
  carrera: "ISC",
  semestre: 7,
  periodo: "Ene-Jun 2026",
  cantidadAlumnos: 30,
  estado: "activo",
  ...overrides,
});

const crearAlumno = (overrides: Partial<any> = {}) => ({
  id: 1,
  nombre: "Ana",
  apellidos: "López",
  numeroControl: "A001",
  carrera: "ISC",
  grupoId: 1,
  estado: "activo",
  ...overrides,
});

const crearCalificacion = (overrides: Partial<any> = {}) => ({
  id: 1,
  alumnoId: 1,
  grupoId: 1,
  periodo: "P1",
  promedio: 8.5,
  estado: "aprobado",
  fechaRegistro: "2026-03-01T00:00:00.000Z",
  ...overrides,
});

const crearAsistencia = (overrides: Partial<any> = {}) => ({
  id: 1,
  alumnoId: 1,
  grupoId: 1,
  fecha: "2026-03-15T00:00:00.000Z",
  estado: "presente",
  ...overrides,
});

const crearEntregable = (overrides: Partial<any> = {}) => ({
  id: 1,
  titulo: "Tarea 1",
  grupoId: 1,
  estado: "asignada",
  ...overrides,
});

// ─── Tests ───

describe("useGruposDashboardViewModel", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockGrupos = [];
    mockAlumnos = [];
    mockCalificaciones = [];
    mockAsistencias = [];
    mockEntregables = [];
    mockGruposLoading = false;
    mockGruposError = null;
  });

  // ─── isEmpty ───

  describe("isEmpty", () => {
    it("es true cuando no hay grupos activos y no está cargando", () => {
      const { result } = renderHook(() => useGruposDashboardViewModel());
      expect(result.current.isEmpty).toBe(true);
    });

    it("es false cuando hay grupos activos", () => {
      mockGrupos = [crearGrupo()];
      const { result } = renderHook(() => useGruposDashboardViewModel());
      expect(result.current.isEmpty).toBe(false);
    });

    it("es false cuando solo hay grupos inactivos", () => {
      mockGrupos = [crearGrupo({ estado: "inactivo" })];
      const { result } = renderHook(() => useGruposDashboardViewModel());
      expect(result.current.isEmpty).toBe(true);
    });

    it("es false mientras está cargando (no muestra empty prematuramente)", () => {
      mockGruposLoading = true;
      const { result } = renderHook(() => useGruposDashboardViewModel());
      expect(result.current.isEmpty).toBe(false);
    });
  });

  // ─── isLoading ───

  describe("isLoading", () => {
    it("es true cuando gruposLoading es true", () => {
      mockGruposLoading = true;
      const { result } = renderHook(() => useGruposDashboardViewModel());
      expect(result.current.isLoading).toBe(true);
    });

    it("es false cuando todos los contextos terminaron de cargar", () => {
      const { result } = renderHook(() => useGruposDashboardViewModel());
      expect(result.current.isLoading).toBe(false);
    });
  });

  // ─── error ───

  describe("error", () => {
    it("devuelve null cuando no hay error", () => {
      const { result } = renderHook(() => useGruposDashboardViewModel());
      expect(result.current.error).toBeNull();
    });

    it("devuelve el error del contexto de grupos", () => {
      mockGruposError = "Fallo de conexión";
      const { result } = renderHook(() => useGruposDashboardViewModel());
      expect(result.current.error).toBe("Fallo de conexión");
    });
  });

  // ─── KPIs ───

  describe("kpis", () => {
    it("devuelve zeros cuando no hay datos", () => {
      mockGrupos = [crearGrupo()];
      const { result } = renderHook(() => useGruposDashboardViewModel());
      expect(result.current.kpis).toEqual({
        totalAlumnos: 30, // falls back to cantidadAlumnos
        promedioGeneral: 0,
        indiceAsistencia: 0,
        entregasPendientes: 0,
        gruposActivos: 1,
      });
    });

    it("calcula totalAlumnos desde alumnos del contexto cuando existen", () => {
      mockGrupos = [crearGrupo({ id: 1 }), crearGrupo({ id: 2, nombre: "3B" })];
      mockAlumnos = [
        crearAlumno({ id: 1, grupoId: 1 }),
        crearAlumno({ id: 2, grupoId: 1 }),
        crearAlumno({ id: 3, grupoId: 2 }),
      ];

      const { result } = renderHook(() => useGruposDashboardViewModel());
      expect(result.current.kpis.totalAlumnos).toBe(3);
    });

    it("usa cantidadAlumnos como fallback si no hay alumnos en contexto", () => {
      mockGrupos = [
        crearGrupo({ id: 1, cantidadAlumnos: 25 }),
        crearGrupo({ id: 2, cantidadAlumnos: 18 }),
      ];

      const { result } = renderHook(() => useGruposDashboardViewModel());
      expect(result.current.kpis.totalAlumnos).toBe(43);
    });

    it("calcula promedioGeneral con calificaciones disponibles", () => {
      mockGrupos = [crearGrupo()];
      mockCalificaciones = [
        crearCalificacion({ promedio: 8 }),
        crearCalificacion({ promedio: 9 }),
        crearCalificacion({ promedio: 10 }),
      ];

      const { result } = renderHook(() => useGruposDashboardViewModel());
      expect(result.current.kpis.promedioGeneral).toBe(9);
    });

    it("calcula indiceAsistencia como porcentaje de presentes", () => {
      mockGrupos = [crearGrupo()];
      mockAsistencias = [
        crearAsistencia({ estado: "presente" }),
        crearAsistencia({ estado: "presente" }),
        crearAsistencia({ estado: "ausente" }),
        crearAsistencia({ estado: "presente" }),
      ];

      const { result } = renderHook(() => useGruposDashboardViewModel());
      expect(result.current.kpis.indiceAsistencia).toBe(75);
    });

    it("calcula entregasPendientes (no finalizadas)", () => {
      mockGrupos = [crearGrupo()];
      mockEntregables = [
        crearEntregable({ estado: "asignada" }),
        crearEntregable({ estado: "en_progreso" }),
        crearEntregable({ estado: "finalizada" }),
      ];

      const { result } = renderHook(() => useGruposDashboardViewModel());
      expect(result.current.kpis.entregasPendientes).toBe(2);
    });

    it("cuenta solo grupos activos en gruposActivos", () => {
      mockGrupos = [
        crearGrupo({ id: 1, estado: "activo" }),
        crearGrupo({ id: 2, estado: "inactivo" }),
        crearGrupo({ id: 3, estado: "activo" }),
        crearGrupo({ id: 4, estado: "finalizado" }),
      ];

      const { result } = renderHook(() => useGruposDashboardViewModel());
      expect(result.current.kpis.gruposActivos).toBe(2);
    });

    it("ignora calificaciones de grupos inactivos", () => {
      mockGrupos = [
        crearGrupo({ id: 1, estado: "activo" }),
        crearGrupo({ id: 2, estado: "inactivo" }),
      ];
      mockCalificaciones = [
        crearCalificacion({ grupoId: 1, promedio: 8 }),
        crearCalificacion({ grupoId: 2, promedio: 10 }), // should be ignored
      ];

      const { result } = renderHook(() => useGruposDashboardViewModel());
      expect(result.current.kpis.promedioGeneral).toBe(8);
    });
  });

  // ─── gruposConStats ───

  describe("gruposConStats", () => {
    it("mapea grupos activos con estadísticas calculadas", () => {
      mockGrupos = [
        crearGrupo({
          id: 5,
          nombre: "7A",
          materia: "Física",
          cantidadAlumnos: 20,
          estado: "activo",
        }),
      ];
      mockCalificaciones = [
        crearCalificacion({ grupoId: 5, promedio: 9 }),
        crearCalificacion({ grupoId: 5, promedio: 7 }),
      ];
      mockAsistencias = [
        crearAsistencia({ grupoId: 5, estado: "presente" }),
        crearAsistencia({ grupoId: 5, estado: "ausente" }),
      ];
      mockEntregables = [
        crearEntregable({ grupoId: 5, estado: "asignada" }),
        crearEntregable({ grupoId: 5, estado: "finalizada" }),
      ];

      const { result } = renderHook(() => useGruposDashboardViewModel());
      expect(result.current.gruposConStats).toHaveLength(1);

      const stats = result.current.gruposConStats[0];
      expect(stats.id).toBe(5);
      expect(stats.nombre).toBe("7A");
      expect(stats.materia).toBe("Física");
      expect(stats.cantidadAlumnos).toBe(20);
      expect(stats.promedio).toBe(8);
      expect(stats.asistencia).toBe(50);
      expect(stats.pendientes).toBe(1);
    });

    it("excluye grupos inactivos", () => {
      mockGrupos = [
        crearGrupo({ id: 1, estado: "activo" }),
        crearGrupo({ id: 2, estado: "inactivo" }),
      ];

      const { result } = renderHook(() => useGruposDashboardViewModel());
      expect(result.current.gruposConStats).toHaveLength(1);
      expect(result.current.gruposConStats[0].id).toBe(1);
    });

    it("devuelve 0 cuando no hay datos para el grupo", () => {
      mockGrupos = [crearGrupo({ id: 10 })];

      const { result } = renderHook(() => useGruposDashboardViewModel());
      const stats = result.current.gruposConStats[0];
      expect(stats.promedio).toBe(0);
      expect(stats.asistencia).toBe(0);
      expect(stats.pendientes).toBe(0);
    });
  });

  // ─── alertas ───

  describe("alertas", () => {
    it("detecta alumnos con promedio bajo (< 6)", () => {
      mockGrupos = [crearGrupo({ id: 1 })];
      mockAlumnos = [crearAlumno({ id: 10, grupoId: 1, nombre: "Pedro", apellidos: "García" })];
      mockCalificaciones = [crearCalificacion({ alumnoId: 10, grupoId: 1, promedio: 4.5 })];

      const { result } = renderHook(() => useGruposDashboardViewModel());
      expect(result.current.alertas).toHaveLength(1);
      expect(result.current.alertas[0]).toEqual(
        expect.objectContaining({
          alumnoId: 10,
          nombre: "Pedro",
          tipo: "critico",
          mensaje: "Promedio bajo (4.5)",
        })
      );
    });

    it("no genera alerta si promedio >= 6", () => {
      mockGrupos = [crearGrupo({ id: 1 })];
      mockAlumnos = [crearAlumno({ id: 10, grupoId: 1 })];
      mockCalificaciones = [crearCalificacion({ alumnoId: 10, grupoId: 1, promedio: 7 })];

      const { result } = renderHook(() => useGruposDashboardViewModel());
      const alertasPromedio = result.current.alertas.filter((a) => a.mensaje.includes("Promedio"));
      expect(alertasPromedio).toHaveLength(0);
    });

    it("detecta 3 faltas consecutivas", () => {
      mockGrupos = [crearGrupo({ id: 1 })];
      mockAlumnos = [crearAlumno({ id: 20, grupoId: 1, nombre: "María", apellidos: "Ruiz" })];
      mockAsistencias = [
        crearAsistencia({ alumnoId: 20, grupoId: 1, fecha: "2026-03-13", estado: "ausente" }),
        crearAsistencia({ alumnoId: 20, grupoId: 1, fecha: "2026-03-14", estado: "ausente" }),
        crearAsistencia({ alumnoId: 20, grupoId: 1, fecha: "2026-03-15", estado: "ausente" }),
      ];

      const { result } = renderHook(() => useGruposDashboardViewModel());
      const alertasFaltas = result.current.alertas.filter((a) =>
        a.mensaje.includes("faltas consecutivas")
      );
      expect(alertasFaltas).toHaveLength(1);
      expect(alertasFaltas[0].nombre).toBe("María");
    });

    it("no genera alerta si solo 2 faltas consecutivas", () => {
      mockGrupos = [crearGrupo({ id: 1 })];
      mockAlumnos = [crearAlumno({ id: 20, grupoId: 1 })];
      mockAsistencias = [
        crearAsistencia({ alumnoId: 20, grupoId: 1, fecha: "2026-03-14", estado: "ausente" }),
        crearAsistencia({ alumnoId: 20, grupoId: 1, fecha: "2026-03-15", estado: "ausente" }),
      ];

      const { result } = renderHook(() => useGruposDashboardViewModel());
      const alertasFaltas = result.current.alertas.filter((a) =>
        a.mensaje.includes("faltas consecutivas")
      );
      expect(alertasFaltas).toHaveLength(0);
    });

    it("limita alertas a máximo 5", () => {
      mockGrupos = [crearGrupo({ id: 1 })];
      mockAlumnos = Array.from({ length: 8 }, (_, i) =>
        crearAlumno({ id: i + 1, grupoId: 1, nombre: `Alumno${i}`, apellidos: `Ape${i}` })
      );
      mockCalificaciones = Array.from({ length: 8 }, (_, i) =>
        crearCalificacion({ alumnoId: i + 1, grupoId: 1, promedio: 3 })
      );

      const { result } = renderHook(() => useGruposDashboardViewModel());
      expect(result.current.alertas).toHaveLength(5);
    });

    it("ignora alumnos inactivos", () => {
      mockGrupos = [crearGrupo({ id: 1 })];
      mockAlumnos = [crearAlumno({ id: 1, grupoId: 1, estado: "inactivo" })];
      mockCalificaciones = [crearCalificacion({ alumnoId: 1, grupoId: 1, promedio: 2 })];

      const { result } = renderHook(() => useGruposDashboardViewModel());
      expect(result.current.alertas).toHaveLength(0);
    });

    it("ignora alumnos sin grupoId", () => {
      mockGrupos = [crearGrupo({ id: 1 })];
      mockAlumnos = [crearAlumno({ id: 1, grupoId: undefined })];
      mockCalificaciones = [crearCalificacion({ alumnoId: 1, grupoId: 1, promedio: 2 })];

      const { result } = renderHook(() => useGruposDashboardViewModel());
      expect(result.current.alertas).toHaveLength(0);
    });
  });

  // ─── quickActions ───

  describe("quickActions", () => {
    it("devuelve las 4 acciones rápidas", () => {
      const { result } = renderHook(() => useGruposDashboardViewModel());
      expect(result.current.quickActions).toHaveLength(4);
      expect(result.current.quickActions.map((a) => a.id)).toEqual([
        "calificar",
        "tarea",
        "reportes",
        "asistencia",
      ]);
    });
  });

  // ─── recargar ───

  describe("recargar", () => {
    it("invoca reloadGrupos del contexto", async () => {
      mockReloadGrupos.mockResolvedValue(undefined);
      const { result } = renderHook(() => useGruposDashboardViewModel());

      await result.current.recargar();
      expect(mockReloadGrupos).toHaveBeenCalledTimes(1);
    });
  });
});
