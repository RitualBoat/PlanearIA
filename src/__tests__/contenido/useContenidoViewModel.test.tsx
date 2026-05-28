import { act, renderHook } from "@testing-library/react-native";
import { Alert } from "react-native";
import { Recurso, Plantilla, Tarea } from "../../../types";
import { NivelAcademico, type PlaneacionDocumento } from "../../../types/planeacionV2";

jest.mock("@react-native-community/netinfo", () => ({
  addEventListener: jest.fn(() => jest.fn()),
  fetch: jest.fn().mockResolvedValue({ isConnected: true, isInternetReachable: true }),
}));

const mockEliminar = jest.fn().mockResolvedValue(undefined);
const mockClonar = jest.fn().mockResolvedValue(undefined);
const mockEliminarRecurso = jest.fn().mockResolvedValue(undefined);
const mockCrearRecurso = jest.fn().mockResolvedValue({ recurso: {}, syncOk: true });
const mockEliminarEntregable = jest.fn().mockResolvedValue(undefined);
const mockEliminarPlantilla = jest.fn().mockResolvedValue(undefined);
const mockCrearPlantilla = jest.fn().mockResolvedValue({ plantilla: {}, syncOk: true });

let mockDocumentos: PlaneacionDocumento[] = [];
let mockRecursos: Recurso[] = [];
let mockEntregables: Tarea[] = [];
let mockPlantillas: Plantilla[] = [];

jest.mock("../../context/PlaneacionesContext", () => ({
  usePlaneaciones: () => ({
    documentos: mockDocumentos,
    isLoading: false,
    eliminar: mockEliminar,
    clonar: mockClonar,
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

import { useContenidoViewModel } from "../../hooks/useContenidoViewModel";

const makeDocumento = (overrides: Partial<PlaneacionDocumento> = {}): PlaneacionDocumento => {
  const base: PlaneacionDocumento = {
    id: "plan-1",
    version: 2,
    userId: "user-1",
    nivelAcademico: NivelAcademico.PRIMARIA,
    infoInstitucional: {
      institucion: "Escuela Demo",
      cicloEscolar: "2026-2027",
    },
    datosGenerales: {
      maestro: "Docente Demo",
      asignatura: "Matematicas",
      fechaInicio: "2024-06-10T00:00:00.000Z",
      fechaFin: "2024-06-10T00:00:00.000Z",
      semanas: [23],
      grado: "3",
      grupos: ["A"],
    },
    elementosCurriculares: {
      proposito: "Identifica fracciones.",
      producto: "Cuaderno",
      contenido: "Fracciones",
      pda: "Fracciones equivalentes",
      campoFormativo: "Pensamiento matematico",
      ejeArticulador: "Pensamiento critico",
      rasgosPerfilEgreso: ["Analiza problemas"],
      instrumentoEvaluacion: "Rubrica",
    },
    sesiones: [
      {
        id: "sesion-1",
        numero: 1,
        tipo: "regular",
        inicio: "Repaso",
        desarrollo: "Ejercicios",
        cierre: "Conclusion",
      },
    ],
    evaluacionFinal: {
      tipo: "rubrica",
      escala: [],
      criterios: [{ id: "crit-1", descripcion: "Resuelve ejercicios" }],
    },
    observaciones: [],
    firmas: [],
    fechaCreacion: "2024-06-01T00:00:00.000Z",
    fechaModificacion: "2024-06-10T12:00:00.000Z",
  };

  return {
    ...base,
    ...overrides,
    infoInstitucional: { ...base.infoInstitucional, ...overrides.infoInstitucional },
    datosGenerales: { ...base.datosGenerales, ...overrides.datosGenerales },
    elementosCurriculares: {
      ...base.elementosCurriculares,
      ...overrides.elementosCurriculares,
    },
    sesiones: overrides.sesiones ?? base.sesiones,
    observaciones: overrides.observaciones ?? base.observaciones,
    firmas: overrides.firmas ?? base.firmas,
  };
};

const makeRecurso = (overrides: Partial<Recurso> = {}): Recurso =>
  ({
    id: 1,
    titulo: "Presentacion Fracciones",
    descripcion: "Introduccion a fracciones",
    tipo: "presentacion",
    tags: ["matematicas"],
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

describe("useContenidoViewModel", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockDocumentos = [];
    mockRecursos = [];
    mockEntregables = [];
    mockPlantillas = [];
  });

  it("agrega todos los tipos de contenido", () => {
    mockDocumentos = [makeDocumento()];
    mockRecursos = [makeRecurso()];
    mockEntregables = [makeEntregable()];
    mockPlantillas = [makePlantilla()];

    const { result } = renderHook(() => useContenidoViewModel());

    expect(result.current.items).toHaveLength(4);
    expect(result.current.totalItems).toBe(4);
  });

  it("calcula conteos por categoria", () => {
    mockDocumentos = [makeDocumento(), makeDocumento({ id: "plan-2" })];
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

  it("filtra y busca planeaciones V2", () => {
    mockDocumentos = [makeDocumento()];
    mockRecursos = [makeRecurso({ titulo: "Video de historia" } as any)];

    const { result } = renderHook(() => useContenidoViewModel());

    act(() => {
      result.current.setCategoriaActiva("planeaciones");
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
    mockDocumentos = [
      makeDocumento({ id: "plan-completa" }),
      makeDocumento({
        id: "plan-borrador",
        elementosCurriculares: {
          proposito: "",
          contenido: "",
          pda: "",
          campoFormativo: "",
          ejeArticulador: "",
          rasgosPerfilEgreso: [],
          instrumentoEvaluacion: "",
        },
        sesiones: [],
        evaluacionFinal: undefined,
      }),
    ];

    const { result } = renderHook(() => useContenidoViewModel());

    act(() => {
      result.current.setFiltroEstado("borrador");
    });

    expect(result.current.items).toHaveLength(1);
    expect(result.current.items[0].id).toBe("plan-plan-borrador");
  });

  it("extrae borradores con maximo de 6", () => {
    mockDocumentos = Array.from({ length: 8 }, (_, i) =>
      makeDocumento({
        id: `plan-${i}`,
        elementosCurriculares: {
          proposito: "",
          contenido: "",
          pda: "",
          campoFormativo: "",
          ejeArticulador: "",
          rasgosPerfilEgreso: [],
          instrumentoEvaluacion: "",
        },
        sesiones: [],
        evaluacionFinal: undefined,
      })
    );

    const { result } = renderHook(() => useContenidoViewModel());

    expect(result.current.borradores).toHaveLength(6);
  });

  it("cuenta y limpia filtros activos", () => {
    mockRecursos = [makeRecurso()];

    const { result } = renderHook(() => useContenidoViewModel());

    act(() => {
      result.current.setFiltroTipo("presentacion");
      result.current.setFiltroFecha("semana");
      result.current.setFiltroEstado("borrador");
    });
    expect(result.current.filtrosActivos).toBe(3);

    act(() => {
      result.current.limpiarFiltros();
    });
    expect(result.current.filtrosActivos).toBe(0);
  });

  it("ordena items por fechaModificacion", () => {
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

  it("eliminarItem llama al servicio V2 de planeaciones", () => {
    mockDocumentos = [makeDocumento()];
    const alertSpy = jest.spyOn(Alert, "alert").mockImplementation((_, __, buttons) => {
      const eliminar = buttons?.find((button) => button.text === "Eliminar");
      eliminar?.onPress?.();
    });

    const { result } = renderHook(() => useContenidoViewModel());

    act(() => {
      result.current.eliminarItem(result.current.items[0]);
    });

    expect(alertSpy).toHaveBeenCalled();
    expect(mockEliminar).toHaveBeenCalledWith("plan-1");
    alertSpy.mockRestore();
  });

  it("duplicarItem clona planeacion V2", async () => {
    mockDocumentos = [makeDocumento()];
    const alertSpy = jest.spyOn(Alert, "alert").mockImplementation(jest.fn());

    const { result } = renderHook(() => useContenidoViewModel());

    await act(async () => {
      result.current.duplicarItem(result.current.items[0]);
    });

    expect(mockClonar).toHaveBeenCalledWith("plan-1");
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
        titulo: "Presentacion Fracciones (copia)",
      })
    );
    alertSpy.mockRestore();
  });

  it("muestra titulo fallback cuando no hay PDA ni contenido", () => {
    mockDocumentos = [
      makeDocumento({
        elementosCurriculares: {
          proposito: "",
          contenido: "",
          pda: "",
          campoFormativo: "",
          ejeArticulador: "",
          rasgosPerfilEgreso: [],
          instrumentoEvaluacion: "",
        },
      }),
    ];

    const { result } = renderHook(() => useContenidoViewModel());

    expect(result.current.items[0].titulo).toBe("Planeacion sin titulo");
  });

  it("calcula progreso completo e incompleto para documentos V2", () => {
    mockDocumentos = [
      makeDocumento({ id: "completa" }),
      makeDocumento({
        id: "parcial",
        elementosCurriculares: {
          proposito: "",
          contenido: "Fracciones",
          pda: "",
          campoFormativo: "",
          ejeArticulador: "",
          rasgosPerfilEgreso: [],
          instrumentoEvaluacion: "",
        },
        sesiones: [],
        evaluacionFinal: undefined,
      }),
    ];

    const { result } = renderHook(() => useContenidoViewModel());
    const completa = result.current.items.find((item) => item.id === "plan-completa");
    const parcial = result.current.items.find((item) => item.id === "plan-parcial");

    expect(completa?.progreso).toBe(100);
    expect(completa?.esBorrador).toBe(false);
    expect(parcial?.progreso).toBe(50);
    expect(parcial?.esBorrador).toBe(true);
  });

  it("no cuenta sesiones Tiptap vacias como contenido real", () => {
    const emptyTipTap = JSON.stringify({
      type: "doc",
      content: [{ type: "paragraph", content: [] }],
    });

    mockDocumentos = [
      makeDocumento({
        id: "tiptap-vacio",
        sesiones: [
          {
            id: "s-empty",
            numero: 1,
            tipo: "regular",
            inicio: emptyTipTap,
            desarrollo: "",
            cierre: "",
          },
        ],
        evaluacionFinal: undefined,
        elementosCurriculares: {
          proposito: "Identifica fracciones.",
          contenido: "Fracciones",
          pda: "Fracciones equivalentes",
          campoFormativo: "Pensamiento matematico",
          ejeArticulador: "Pensamiento critico",
          rasgosPerfilEgreso: [],
          instrumentoEvaluacion: "",
        },
      }),
    ];

    const { result } = renderHook(() => useContenidoViewModel());

    expect(result.current.items[0].progreso).toBe(67);
    expect(result.current.items[0].esBorrador).toBe(true);
  });
});
