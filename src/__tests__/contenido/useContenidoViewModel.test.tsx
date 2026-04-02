import { act, renderHook } from "@testing-library/react-native";
import { Alert } from "react-native";
import { NivelAcademico, Planeacion } from "../../../types/planeacion";
import { Recurso, Plantilla, Tarea } from "../../../types";

// ─── Mocks ───

const mockEliminarPlaneacion = jest.fn().mockResolvedValue(undefined);
const mockClonarPlaneacion = jest.fn().mockResolvedValue(undefined);
const mockAgregarPlaneacion = jest.fn().mockResolvedValue(undefined);
const mockEliminarRecurso = jest.fn().mockResolvedValue(undefined);
const mockCrearRecurso = jest.fn().mockResolvedValue({ recurso: {}, syncOk: true });
const mockEliminarEntregable = jest.fn().mockResolvedValue(undefined);
const mockEliminarPlantilla = jest.fn().mockResolvedValue(undefined);
const mockCrearPlantilla = jest.fn().mockResolvedValue({ plantilla: {}, syncOk: true });

let mockPlaneaciones: Planeacion[] = [];
let mockRecursos: Recurso[] = [];
let mockEntregables: Tarea[] = [];
let mockPlantillas: Plantilla[] = [];

jest.mock("../../sync/providers/SyncProvider", () => ({
  usePlaneaciones: () => ({
    planeaciones: mockPlaneaciones,
    isLoading: false,
    eliminarPlaneacion: mockEliminarPlaneacion,
    clonarPlaneacion: mockClonarPlaneacion,
    agregarPlaneacion: mockAgregarPlaneacion,
    obtenerPlaneacion: jest.fn(),
    actualizarPlaneacion: jest.fn(),
  }),
}));

jest.mock("../../context/RecursosContext", () => ({
  useRecursos: () => ({
    recursos: mockRecursos,
    isLoading: false,
    eliminarRecurso: mockEliminarRecurso,
    crearRecurso: mockCrearRecurso,
  }),
}));

jest.mock("../../context/EntregablesContext", () => ({
  useEntregables: () => ({
    entregables: mockEntregables,
    isLoading: false,
    eliminarEntregable: mockEliminarEntregable,
  }),
}));

jest.mock("../../context/PlantillasContext", () => ({
  usePlantillas: () => ({
    plantillas: mockPlantillas,
    isLoading: false,
    eliminarPlantilla: mockEliminarPlantilla,
    crearPlantilla: mockCrearPlantilla,
  }),
}));

import { useContenidoViewModel, CategoriaContenido } from "../../hooks/useContenidoViewModel";

// ─── Test data ───

const makePlaneacion = (overrides: Partial<Planeacion> = {}): Planeacion => ({
  id: "plan-1",
  nivelAcademico: NivelAcademico.PRIMARIA,
  asignatura: "Matemáticas",
  grado: "3°",
  grupo: "A",
  fecha: "2024-06-10T00:00:00.000Z",
  horaInicio: "08:00",
  duracionTotal: 50,
  unidadTematica: "Fracciones",
  temaSesion: "Fracciones equivalentes",
  aprendizajesEsperados: ["Identifica fracciones"],
  actividades: [
    { tipo: "inicio", descripcion: "Repaso", duracion: 10 },
    { tipo: "desarrollo", descripcion: "Ejercicios", duracion: 30 },
    { tipo: "cierre", descripcion: "Conclusión", duracion: 10 },
  ],
  recursos: ["Libro"],
  evaluacion: "Rúbrica",
  evidencias: ["Cuaderno"],
  observaciones: "",
  fechaCreacion: "2024-06-01T00:00:00.000Z",
  fechaModificacion: "2024-06-10T12:00:00.000Z",
  campoFormativo: "Pensamiento Matemático",
  ...overrides,
});

const makeRecurso = (overrides: Partial<Recurso> = {}): Recurso =>
  ({
    id: 1,
    titulo: "Presentación Fracciones",
    descripcion: "Introducción a fracciones",
    tipo: "presentacion",
    tags: ["matemáticas"],
    acceso: "privado",
    origen: "manual",
    fechaCreacion: new Date("2024-06-05T00:00:00.000Z"),
    fechaModificacion: new Date("2024-06-08T00:00:00.000Z"),
    ...overrides,
  }) as Recurso;

const makeEntregable = (overrides: Partial<Tarea> = {}): Tarea =>
  ({
    id: 1,
    titulo: "Tarea de fracciones",
    descripcion: "Resolver ejercicios",
    tipo: "tarea",
    grupoId: 1,
    estado: "asignada",
    fechaAsignacion: new Date("2024-06-07T00:00:00.000Z"),
    fechaEntrega: new Date("2024-06-14T00:00:00.000Z"),
    puntosTotales: 100,
    ...overrides,
  }) as Tarea;

const makePlantilla = (overrides: Partial<Plantilla> = {}): Plantilla =>
  ({
    id: 1,
    nombre: "Plantilla Examen",
    tipo: "examen",
    categoria: "evaluacion",
    contenido: {},
    tags: [],
    esDelSistema: false,
    usosCount: 5,
    fechaCreacion: new Date("2024-05-01T00:00:00.000Z"),
    fechaModificacion: new Date("2024-06-01T00:00:00.000Z"),
    ...overrides,
  }) as Plantilla;

// ─── Tests ───

describe("useContenidoViewModel", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockPlaneaciones = [];
    mockRecursos = [];
    mockEntregables = [];
    mockPlantillas = [];
  });

  it("agrega todos los tipos de contenido", () => {
    mockPlaneaciones = [makePlaneacion()];
    mockRecursos = [makeRecurso()];
    mockEntregables = [makeEntregable()];
    mockPlantillas = [makePlantilla()];

    const { result } = renderHook(() => useContenidoViewModel());

    expect(result.current.items).toHaveLength(4);
    expect(result.current.totalItems).toBe(4);
  });

  it("calcula conteos por categoría", () => {
    mockPlaneaciones = [makePlaneacion(), makePlaneacion({ id: "plan-2" })];
    mockRecursos = [makeRecurso()];
    mockEntregables = [makeEntregable(), makeEntregable({ id: 2 } as any)];
    mockPlantillas = [makePlantilla()];

    const { result } = renderHook(() => useContenidoViewModel());

    expect(result.current.conteos.todo).toBe(6);
    expect(result.current.conteos.planeaciones).toBe(2);
    expect(result.current.conteos.recursos).toBe(1);
    expect(result.current.conteos.entregables).toBe(2);
    expect(result.current.conteos.plantillas).toBe(1);
  });

  it("filtra por categoría", () => {
    mockPlaneaciones = [makePlaneacion()];
    mockRecursos = [makeRecurso()];

    const { result } = renderHook(() => useContenidoViewModel());

    act(() => {
      result.current.setCategoriaActiva("recursos");
    });

    expect(result.current.items).toHaveLength(1);
    expect(result.current.items[0].tipo).toBe("recursos");
  });

  it("busca por título y subtítulo", () => {
    mockPlaneaciones = [makePlaneacion()];
    mockRecursos = [makeRecurso({ titulo: "Video de historia" } as any)];

    const { result } = renderHook(() => useContenidoViewModel());

    act(() => {
      result.current.setSearchQuery("fracciones");
    });

    expect(result.current.items).toHaveLength(1);
    expect(result.current.items[0].titulo).toBe("Fracciones equivalentes");
  });

  it("filtra por tipo de recurso", () => {
    mockRecursos = [
      makeRecurso({ id: 1, tipo: "presentacion" } as any),
      makeRecurso({ id: 2, tipo: "video", titulo: "Video clase" } as any),
    ];

    const { result } = renderHook(() => useContenidoViewModel());

    act(() => {
      result.current.setFiltroTipo("video");
    });

    expect(result.current.items).toHaveLength(1);
    expect(result.current.items[0].tipoRecurso).toBe("video");
  });

  it("filtra por estado borrador", () => {
    // Una planeación completa (6/6 campos) y una incompleta
    mockPlaneaciones = [
      makePlaneacion({ id: "plan-completa" }),
      makePlaneacion({
        id: "plan-borrador",
        asignatura: "Historia",
        temaSesion: "",
        aprendizajesEsperados: [],
        actividades: [],
        evaluacion: "",
        recursos: [],
      }),
    ];

    const { result } = renderHook(() => useContenidoViewModel());

    act(() => {
      result.current.setFiltroEstado("borrador");
    });

    expect(result.current.items).toHaveLength(1);
    expect(result.current.items[0].esBorrador).toBe(true);
  });

  it("extrae borradores (máximo 6)", () => {
    // 8 planeaciones incompletas
    mockPlaneaciones = Array.from({ length: 8 }, (_, i) =>
      makePlaneacion({
        id: `plan-${i}`,
        temaSesion: "",
        aprendizajesEsperados: [],
        actividades: [],
        evaluacion: "",
        recursos: [],
      })
    );

    const { result } = renderHook(() => useContenidoViewModel());

    expect(result.current.borradores).toHaveLength(6);
  });

  it("cuenta filtros activos correctamente", () => {
    mockRecursos = [makeRecurso()];

    const { result } = renderHook(() => useContenidoViewModel());

    expect(result.current.filtrosActivos).toBe(0);

    act(() => {
      result.current.setFiltroTipo("presentacion");
    });
    expect(result.current.filtrosActivos).toBe(1);

    act(() => {
      result.current.setFiltroEstado("completo");
    });
    expect(result.current.filtrosActivos).toBe(2);
  });

  it("limpiarFiltros resetea todos los filtros", () => {
    mockRecursos = [makeRecurso()];

    const { result } = renderHook(() => useContenidoViewModel());

    act(() => {
      result.current.setFiltroTipo("video");
      result.current.setFiltroFecha("semana");
      result.current.setFiltroEstado("borrador");
    });
    expect(result.current.filtrosActivos).toBe(3);

    act(() => {
      result.current.limpiarFiltros();
    });
    expect(result.current.filtrosActivos).toBe(0);
  });

  it("ordena items por fechaModificacion (más reciente primero)", () => {
    mockRecursos = [
      makeRecurso({
        id: 1,
        titulo: "Recurso antiguo",
        fechaModificacion: new Date("2024-01-01T00:00:00.000Z"),
      } as any),
      makeRecurso({
        id: 2,
        titulo: "Recurso reciente",
        fechaModificacion: new Date("2024-12-01T00:00:00.000Z"),
      } as any),
    ];

    const { result } = renderHook(() => useContenidoViewModel());

    expect(result.current.items[0].titulo).toBe("Recurso reciente");
    expect(result.current.items[1].titulo).toBe("Recurso antiguo");
  });

  it("eliminarItem muestra Alert y llama al servicio correcto", () => {
    mockPlaneaciones = [makePlaneacion()];
    const alertSpy = jest.spyOn(Alert, "alert").mockImplementation((_, __, buttons) => {
      const eliminar = buttons?.find((b) => b.text === "Eliminar");
      eliminar?.onPress?.();
    });

    const { result } = renderHook(() => useContenidoViewModel());

    act(() => {
      result.current.eliminarItem(result.current.items[0]);
    });

    expect(alertSpy).toHaveBeenCalled();
    expect(mockEliminarPlaneacion).toHaveBeenCalledWith("plan-1");
    alertSpy.mockRestore();
  });

  it("duplicarItem clona planeación", async () => {
    mockPlaneaciones = [makePlaneacion()];
    const alertSpy = jest.spyOn(Alert, "alert").mockImplementation(jest.fn());

    const { result } = renderHook(() => useContenidoViewModel());

    await act(async () => {
      result.current.duplicarItem(result.current.items[0]);
    });

    expect(mockClonarPlaneacion).toHaveBeenCalledWith("plan-1");
    alertSpy.mockRestore();
  });

  it("duplicarItem crea copia de recurso", async () => {
    mockRecursos = [makeRecurso()];
    const alertSpy = jest.spyOn(Alert, "alert").mockImplementation(jest.fn());

    const { result } = renderHook(() => useContenidoViewModel());

    await act(async () => {
      result.current.duplicarItem(result.current.items[0]);
    });

    expect(mockCrearRecurso).toHaveBeenCalledWith(
      expect.objectContaining({
        titulo: "Presentación Fracciones (copia)",
      })
    );
    alertSpy.mockRestore();
  });

  it("muestra título fallback cuando no hay temaSesion", () => {
    mockPlaneaciones = [makePlaneacion({ temaSesion: "", unidadTematica: "" })];

    const { result } = renderHook(() => useContenidoViewModel());

    expect(result.current.items[0].titulo).toBe("Planeación sin título");
  });

  it("calcula progreso correctamente para planeaciones completas", () => {
    mockPlaneaciones = [makePlaneacion()]; // Todos los campos llenos

    const { result } = renderHook(() => useContenidoViewModel());

    expect(result.current.items[0].progreso).toBe(100);
    expect(result.current.items[0].esBorrador).toBe(false);
  });

  it("calcula progreso incompleto para planeaciones parciales", () => {
    mockPlaneaciones = [
      makePlaneacion({
        temaSesion: "",
        aprendizajesEsperados: [],
        evaluacion: "",
      }),
    ];

    const { result } = renderHook(() => useContenidoViewModel());

    // 3 de 6 campos llenos = 50%
    expect(result.current.items[0].progreso).toBe(50);
    expect(result.current.items[0].esBorrador).toBe(true);
  });
});
