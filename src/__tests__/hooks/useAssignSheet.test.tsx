import { act, renderHook, waitFor } from "@testing-library/react-native";
import { useAssignSheet, type ElementoAsignable } from "../../hooks/useAssignSheet";

/**
 * ViewModel del selector transversal (change assign-sheet, #84).
 *
 * Lo que estas pruebas protegen no es el aspecto de la hoja: es que toda asignacion pase
 * por el camino que encola y que el destino quede coherente. El defecto que cerro este
 * change fue invisible para la suite anterior justo por no verificar ninguna de las dos cosas.
 */

const mockActualizarRecurso = jest.fn().mockResolvedValue({ syncOk: true });
const mockActualizarEntregable = jest.fn().mockResolvedValue({ syncOk: true });
const mockObtenerRecursoPorId = jest.fn((id: number) => (id === 404 ? undefined : { id }));
const mockObtenerEntregablePorId = jest.fn((id: number) => (id === 404 ? undefined : { id }));

let mockGruposCargando = false;

jest.mock("../../context/GruposContext", () => ({
  useGruposContext: () => ({
    grupos: mockGruposCargando
      ? []
      : [
          { id: 1, nombre: "2do A" },
          { id: 2, nombre: "3ro B" },
        ],
    isLoading: mockGruposCargando,
  }),
}));

jest.mock("../../context/RecursosContext", () => ({
  useRecursos: () => ({
    actualizarRecurso: (...args: unknown[]) => mockActualizarRecurso(...args),
    obtenerRecursoPorId: (id: number) => mockObtenerRecursoPorId(id),
  }),
}));

jest.mock("../../context/EntregablesContext", () => ({
  useEntregables: () => ({
    actualizarEntregable: (...args: unknown[]) => mockActualizarEntregable(...args),
    obtenerEntregablePorId: (id: number) => mockObtenerEntregablePorId(id),
  }),
}));

const mockGetUnidades = jest.fn();
const mockGetActividades = jest.fn();

jest.mock("../../services/classroom/classroomFacade", () => ({
  classroomFacade: {
    getUnidadesByGrupoId: (grupoId: number) => mockGetUnidades(grupoId),
    getActividadesByGrupoId: (grupoId: number) => mockGetActividades(grupoId),
  },
}));

const RECURSO: ElementoAsignable = { id: 1, titulo: "Guia", tipo: "recurso" };

describe("useAssignSheet", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockGruposCargando = false;
    mockGetUnidades.mockResolvedValue([
      { id: "u1", grupoId: 1, nombre: "Unidad 1", posicion: 0 },
    ]);
    mockGetActividades.mockResolvedValue([{ id: 50, titulo: "Ensayo" }]);
  });

  const montar = (elementos: ElementoAsignable[] = [RECURSO]) =>
    renderHook(() => useAssignSheet(elementos));

  it("no permite confirmar sin clase elegida", () => {
    const { result } = montar();
    expect(result.current.puedeConfirmar).toBe(false);
  });

  it("asigna solo la clase y encola por el camino del contexto", async () => {
    const { result } = montar();

    await act(async () => {
      result.current.elegirClase(1);
    });
    await waitFor(() => expect(result.current.cargando).toBe(false));
    await act(async () => {
      await result.current.asignar();
    });

    expect(mockActualizarRecurso).toHaveBeenCalledWith(1, {
      grupoId: 1,
      unidadId: undefined,
      tareaId: undefined,
      asignadoComoTarea: false,
    });
    expect(result.current.resultado).toEqual({ asignados: 1, syncOk: true });
  });

  it("fija tareaId y asignadoComoTarea juntos al elegir actividad", async () => {
    const { result } = montar();

    await act(async () => {
      result.current.elegirClase(1);
    });
    await waitFor(() => expect(result.current.actividades).toHaveLength(1));
    await act(async () => {
      result.current.elegirActividad(50);
    });
    await act(async () => {
      await result.current.asignar();
    });

    expect(mockActualizarRecurso).toHaveBeenCalledWith(
      1,
      expect.objectContaining({ tareaId: 50, asignadoComoTarea: true })
    );
  });

  it("limpia la marca de actividad cuando no se elige ninguna", async () => {
    const { result } = montar();

    await act(async () => {
      result.current.elegirClase(1);
    });
    await waitFor(() => expect(result.current.actividades).toHaveLength(1));
    await act(async () => {
      result.current.elegirActividad(50);
    });
    await act(async () => {
      result.current.elegirActividad(null);
    });
    await act(async () => {
      await result.current.asignar();
    });

    expect(mockActualizarRecurso).toHaveBeenCalledWith(
      1,
      expect.objectContaining({ tareaId: undefined, asignadoComoTarea: false })
    );
  });

  it("descarta unidad y actividad al cambiar de clase", async () => {
    const { result } = montar();

    await act(async () => {
      result.current.elegirClase(1);
    });
    await waitFor(() => expect(result.current.unidades).toHaveLength(1));
    await act(async () => {
      result.current.elegirUnidad("u1");
    });
    await act(async () => {
      result.current.elegirActividad(50);
    });

    await act(async () => {
      result.current.elegirClase(2);
    });

    expect(result.current.destino).toEqual({ grupoId: 2, unidadId: null, tareaId: null });
  });

  it("asigna un entregable por su propio contexto, sin marca de actividad", async () => {
    const { result } = montar([{ id: 10, titulo: "Ensayo", tipo: "entregable" }]);

    await act(async () => {
      result.current.elegirClase(1);
    });
    await waitFor(() => expect(result.current.cargando).toBe(false));
    await act(async () => {
      result.current.elegirUnidad("u1");
    });
    await act(async () => {
      await result.current.asignar();
    });

    expect(mockActualizarEntregable).toHaveBeenCalledWith(10, { grupoId: 1, unidadId: "u1" });
    expect(mockActualizarRecurso).not.toHaveBeenCalled();
  });

  it("no ofrece actividad como destino de un entregable", async () => {
    // `Tarea` no declara `tareaId`: si el nivel se ofreciera, la eleccion se descartaria en
    // silencio y la confirmacion nombraria un destino que la escritura no aplica.
    const { result } = montar([{ id: 50, titulo: "Ensayo", tipo: "entregable" }]);

    await act(async () => {
      result.current.elegirClase(1);
    });
    await waitFor(() => expect(result.current.cargando).toBe(false));

    expect(result.current.admiteActividad).toBe(false);
    expect(result.current.actividades).toHaveLength(0);
  });

  it("no ofrece actividad si la seleccion mezcla recursos y entregables", async () => {
    const { result } = montar([
      { id: 1, titulo: "Guia", tipo: "recurso" },
      { id: 50, titulo: "Ensayo", tipo: "entregable" },
    ]);

    await act(async () => {
      result.current.elegirClase(1);
    });
    await waitFor(() => expect(result.current.cargando).toBe(false));

    expect(result.current.admiteActividad).toBe(false);
  });

  it("no declara al docente sin clases mientras el contexto aun carga", () => {
    mockGruposCargando = true;
    const { result } = montar();

    // La hoja distingue "cargando" de "no tienes clases": afirmar lo segundo durante el
    // arranque del contexto es falso para un docente que si tiene clases.
    expect(result.current.clases).toHaveLength(0);
    expect(result.current.cargando).toBe(true);
  });

  it("no escribe ni afirma exito sobre un elemento inexistente", async () => {
    const { result } = montar([{ id: 404, titulo: "Fantasma", tipo: "recurso" }]);

    await act(async () => {
      result.current.elegirClase(1);
    });
    await waitFor(() => expect(result.current.cargando).toBe(false));
    await act(async () => {
      await result.current.asignar();
    });

    expect(mockActualizarRecurso).not.toHaveBeenCalled();
    expect(result.current.resultado).toEqual({ asignados: 0, syncOk: true });
  });

  it("reporta encolado cuando la cola no quedo drenada", async () => {
    mockActualizarRecurso.mockResolvedValueOnce({ syncOk: false });
    const { result } = montar();

    await act(async () => {
      result.current.elegirClase(1);
    });
    await waitFor(() => expect(result.current.cargando).toBe(false));
    await act(async () => {
      await result.current.asignar();
    });

    expect(result.current.resultado).toEqual({ asignados: 1, syncOk: false });
  });

  it("nombra el destino completo para que la confirmacion no sea generica", async () => {
    const { result } = montar();

    await act(async () => {
      result.current.elegirClase(1);
    });
    await waitFor(() => expect(result.current.unidades).toHaveLength(1));
    await act(async () => {
      result.current.elegirUnidad("u1");
    });

    expect(result.current.resumenDestino).toBe("2do A - Unidad 1");
  });

  it("ofrece reintentar cuando falla la carga de destinos", async () => {
    mockGetUnidades.mockRejectedValueOnce(new Error("sin datos"));
    const { result } = montar();

    await act(async () => {
      result.current.elegirClase(1);
    });
    await waitFor(() => expect(result.current.error).not.toBeNull());

    mockGetUnidades.mockResolvedValue([
      { id: "u1", grupoId: 1, nombre: "Unidad 1", posicion: 0 },
    ]);
    await act(async () => {
      result.current.reintentar();
    });

    await waitFor(() => expect(result.current.unidades).toHaveLength(1));
    expect(result.current.error).toBeNull();
  });
});
