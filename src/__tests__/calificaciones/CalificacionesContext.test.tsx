import React from "react";
import { act, renderHook, waitFor } from "@testing-library/react-native";
import { CalificacionesProvider, useCalificaciones } from "../../context/CalificacionesContext";

const mockGetItem = jest.fn();
const mockSetItem = jest.fn();

jest.mock("@react-native-async-storage/async-storage", () => ({
  getItem: (...args: unknown[]) => mockGetItem(...args),
  setItem: (...args: unknown[]) => mockSetItem(...args),
}));

jest.mock("../../sync/config/apiConfig", () => ({
  API_CONFIG: { baseUrl: "", apiSecret: "", timeout: 5000 },
  isAPIConfigured: () => false,
}));

const wrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <CalificacionesProvider>{children}</CalificacionesProvider>
);

describe("CalificacionesContext", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockGetItem.mockResolvedValue("[]");
    mockSetItem.mockResolvedValue(undefined);
  });

  it("carga calificaciones vacías al iniciar", async () => {
    const { result } = renderHook(() => useCalificaciones(), { wrapper });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.calificaciones).toEqual([]);
    expect(result.current.error).toBeNull();
  });

  it("registra una calificación individual y persiste", async () => {
    const { result } = renderHook(() => useCalificaciones(), { wrapper });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    let response: { calificacion: { id: number }; syncOk: boolean } | undefined;
    await act(async () => {
      response = await result.current.registrarCalificacion({
        alumnoId: 1,
        grupoId: 10,
        periodo: "Ene-Jun 2025",
        parcial1: 85,
        promedio: 85,
        estado: "pendiente",
        fechaRegistro: new Date("2025-03-15"),
      });
    });

    expect(response?.calificacion.id).toBe(1);
    expect(result.current.calificaciones).toHaveLength(1);
    expect(mockSetItem).toHaveBeenCalled();
  });

  it("registra calificaciones masivas reemplazando existentes del mismo alumno+grupo", async () => {
    mockGetItem.mockResolvedValue(
      JSON.stringify([
        {
          id: 1,
          alumnoId: 1,
          grupoId: 10,
          periodo: "Ene-Jun 2025",
          parcial1: 70,
          promedio: 70,
          estado: "pendiente",
          fechaRegistro: "2025-03-10",
        },
      ])
    );

    const { result } = renderHook(() => useCalificaciones(), { wrapper });

    await waitFor(() => {
      expect(result.current.calificaciones).toHaveLength(1);
    });

    await act(async () => {
      await result.current.registrarCalificacionesMasivas([
        {
          alumnoId: 1,
          grupoId: 10,
          periodo: "Ene-Jun 2025",
          parcial1: 90,
          promedio: 90,
          estado: "pendiente",
          fechaRegistro: new Date("2025-03-15"),
        },
        {
          alumnoId: 2,
          grupoId: 10,
          periodo: "Ene-Jun 2025",
          parcial1: 80,
          promedio: 80,
          estado: "pendiente",
          fechaRegistro: new Date("2025-03-15"),
        },
      ]);
    });

    // Old record for alumno 1 replaced, alumno 2 added
    expect(result.current.calificaciones).toHaveLength(2);
    const cal1 = result.current.calificaciones.find((c) => c.alumnoId === 1);
    expect(cal1?.parcial1).toBe(90);
  });

  it("actualiza una calificación existente", async () => {
    mockGetItem.mockResolvedValue(
      JSON.stringify([
        {
          id: 1,
          alumnoId: 1,
          grupoId: 10,
          periodo: "Ene-Jun 2025",
          parcial1: 75,
          promedio: 75,
          estado: "pendiente",
          fechaRegistro: "2025-03-10",
        },
      ])
    );

    const { result } = renderHook(() => useCalificaciones(), { wrapper });

    await waitFor(() => {
      expect(result.current.calificaciones).toHaveLength(1);
    });

    await act(async () => {
      await result.current.actualizarCalificacion(1, { parcial1: 95, promedio: 95 });
    });

    expect(result.current.calificaciones[0].parcial1).toBe(95);
    expect(result.current.calificaciones[0].promedio).toBe(95);
  });

  it("elimina una calificación", async () => {
    mockGetItem.mockResolvedValue(
      JSON.stringify([
        {
          id: 1,
          alumnoId: 1,
          grupoId: 10,
          periodo: "P",
          promedio: 80,
          estado: "pendiente",
          fechaRegistro: "2025-03-10",
        },
        {
          id: 2,
          alumnoId: 2,
          grupoId: 10,
          periodo: "P",
          promedio: 60,
          estado: "pendiente",
          fechaRegistro: "2025-03-10",
        },
      ])
    );

    const { result } = renderHook(() => useCalificaciones(), { wrapper });

    await waitFor(() => {
      expect(result.current.calificaciones).toHaveLength(2);
    });

    await act(async () => {
      await result.current.eliminarCalificacion(1);
    });

    expect(result.current.calificaciones).toHaveLength(1);
    expect(result.current.calificaciones[0].id).toBe(2);
  });

  it("filtra calificaciones por grupo", async () => {
    mockGetItem.mockResolvedValue(
      JSON.stringify([
        {
          id: 1,
          alumnoId: 1,
          grupoId: 10,
          periodo: "P",
          promedio: 80,
          estado: "pendiente",
          fechaRegistro: "2025-03-10",
        },
        {
          id: 2,
          alumnoId: 2,
          grupoId: 20,
          periodo: "P",
          promedio: 70,
          estado: "pendiente",
          fechaRegistro: "2025-03-10",
        },
        {
          id: 3,
          alumnoId: 3,
          grupoId: 10,
          periodo: "P",
          promedio: 90,
          estado: "aprobado",
          fechaRegistro: "2025-03-10",
        },
      ])
    );

    const { result } = renderHook(() => useCalificaciones(), { wrapper });

    await waitFor(() => {
      expect(result.current.calificaciones).toHaveLength(3);
    });

    const grupo10 = result.current.obtenerCalificacionesPorGrupo(10);
    expect(grupo10).toHaveLength(2);
  });

  it("filtra calificaciones por alumno", async () => {
    mockGetItem.mockResolvedValue(
      JSON.stringify([
        {
          id: 1,
          alumnoId: 1,
          grupoId: 10,
          periodo: "P",
          promedio: 80,
          estado: "pendiente",
          fechaRegistro: "2025-03-10",
        },
        {
          id: 2,
          alumnoId: 1,
          grupoId: 20,
          periodo: "P",
          promedio: 85,
          estado: "pendiente",
          fechaRegistro: "2025-03-10",
        },
        {
          id: 3,
          alumnoId: 2,
          grupoId: 10,
          periodo: "P",
          promedio: 60,
          estado: "reprobado",
          fechaRegistro: "2025-03-10",
        },
      ])
    );

    const { result } = renderHook(() => useCalificaciones(), { wrapper });

    await waitFor(() => {
      expect(result.current.calificaciones).toHaveLength(3);
    });

    const alumno1 = result.current.obtenerCalificacionesPorAlumno(1);
    expect(alumno1).toHaveLength(2);
  });

  it("maneja error al cargar datos corruptos", async () => {
    mockGetItem.mockResolvedValue("{invalid-json}");

    const { result } = renderHook(() => useCalificaciones(), { wrapper });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.error).toBeTruthy();
  });

  it("lanza error si se usa fuera del provider", () => {
    expect(() => {
      renderHook(() => useCalificaciones());
    }).toThrow("useCalificaciones debe usarse dentro de CalificacionesProvider");
  });

  it("recarga calificaciones existentes desde storage", async () => {
    mockGetItem.mockResolvedValue(
      JSON.stringify([
        {
          id: 5,
          alumnoId: 1,
          grupoId: 10,
          periodo: "P",
          parcial1: 88,
          parcial2: 92,
          promedio: 90,
          estado: "aprobado",
          fechaRegistro: "2025-03-10",
        },
      ])
    );

    const { result } = renderHook(() => useCalificaciones(), { wrapper });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.calificaciones).toHaveLength(1);
    expect(result.current.calificaciones[0].parcial1).toBe(88);
    expect(result.current.calificaciones[0].parcial2).toBe(92);
  });
});
