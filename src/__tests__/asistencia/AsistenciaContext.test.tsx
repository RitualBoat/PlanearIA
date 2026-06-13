import React from "react";
import { act, renderHook, waitFor } from "@testing-library/react-native";
import { AsistenciaProvider, useAsistencias } from "../../context/AsistenciaContext";

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

// The context under test owns local persistence; the sync engine has its
// own suites (syncEngine.test.ts, offlineSyncFlow.test.ts)
jest.mock("../../sync/services/entitySync", () => ({
  SYNC_ENTITIES: {
    asistencias: {
      entity: "asistencias",
      endpoint: "/api/asistencias",
      storageKey: "@planearia:asistencias",
      responseKey: "asistencias",
    },
  },
  queueEntityOperation: jest.fn().mockResolvedValue(true),
}));

const wrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <AsistenciaProvider>{children}</AsistenciaProvider>
);

describe("AsistenciaContext", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockGetItem.mockResolvedValue("[]");
    mockSetItem.mockResolvedValue(undefined);
  });

  it("carga asistencias vacías al iniciar", async () => {
    const { result } = renderHook(() => useAsistencias(), { wrapper });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.asistencias).toEqual([]);
    expect(result.current.error).toBeNull();
  });

  it("registra una asistencia individual y persiste", async () => {
    const { result } = renderHook(() => useAsistencias(), { wrapper });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    let response: { asistencia: { id: number }; syncOk: boolean } | undefined;
    await act(async () => {
      response = await result.current.registrarAsistencia({
        alumnoId: 1,
        grupoId: 10,
        fecha: new Date("2025-03-24"),
        estado: "presente",
      });
    });

    expect(response).toBeDefined();
    // Cross-device-safe ids are timestamp-based, not sequential
    expect(typeof response!.asistencia.id).toBe("number");
    expect(mockSetItem).toHaveBeenCalledWith(
      "@planearia:asistencias",
      expect.stringContaining('"alumnoId":1')
    );
    expect(result.current.asistencias).toHaveLength(1);
  });

  it("registra asistencia masiva y persiste todos los registros", async () => {
    const { result } = renderHook(() => useAsistencias(), { wrapper });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    const registros = [
      { alumnoId: 1, grupoId: 10, fecha: new Date("2025-03-24"), estado: "presente" as const },
      { alumnoId: 2, grupoId: 10, fecha: new Date("2025-03-24"), estado: "retardo" as const },
      { alumnoId: 3, grupoId: 10, fecha: new Date("2025-03-24"), estado: "ausente" as const },
    ];

    await act(async () => {
      await result.current.registrarAsistenciaMasiva(registros);
    });

    expect(result.current.asistencias).toHaveLength(3);
    expect(mockSetItem).toHaveBeenCalled();

    const saved = JSON.parse(mockSetItem.mock.calls[mockSetItem.mock.calls.length - 1][1]);
    expect(saved).toHaveLength(3);
    expect(saved[0].estado).toBe("presente");
    expect(saved[1].estado).toBe("retardo");
    expect(saved[2].estado).toBe("ausente");
  });

  it("registro masivo reemplaza registros existentes del mismo grupo y fecha", async () => {
    mockGetItem.mockResolvedValue(
      JSON.stringify([
        { id: 1, alumnoId: 1, grupoId: 10, fecha: "2025-03-24", estado: "presente" },
        { id: 2, alumnoId: 2, grupoId: 10, fecha: "2025-03-24", estado: "presente" },
        { id: 3, alumnoId: 3, grupoId: 99, fecha: "2025-03-24", estado: "presente" },
      ])
    );

    const { result } = renderHook(() => useAsistencias(), { wrapper });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });
    expect(result.current.asistencias).toHaveLength(3);

    await act(async () => {
      await result.current.registrarAsistenciaMasiva([
        { alumnoId: 1, grupoId: 10, fecha: new Date("2025-03-24"), estado: "ausente" },
      ]);
    });

    // Old grupo 10 records replaced, grupo 99 record preserved
    const grupoId10 = result.current.asistencias.filter((a) => a.grupoId === 10);
    const grupoId99 = result.current.asistencias.filter((a) => a.grupoId === 99);
    expect(grupoId10).toHaveLength(1);
    expect(grupoId10[0].estado).toBe("ausente");
    expect(grupoId99).toHaveLength(1);
  });

  it("actualiza una asistencia existente", async () => {
    mockGetItem.mockResolvedValue(
      JSON.stringify([{ id: 1, alumnoId: 1, grupoId: 10, fecha: "2025-03-24", estado: "presente" }])
    );

    const { result } = renderHook(() => useAsistencias(), { wrapper });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    await act(async () => {
      await result.current.actualizarAsistencia(1, { estado: "retardo" });
    });

    expect(result.current.asistencias[0].estado).toBe("retardo");
    expect(mockSetItem).toHaveBeenCalled();
  });

  it("elimina una asistencia", async () => {
    mockGetItem.mockResolvedValue(
      JSON.stringify([
        { id: 1, alumnoId: 1, grupoId: 10, fecha: "2025-03-24", estado: "presente" },
        { id: 2, alumnoId: 2, grupoId: 10, fecha: "2025-03-24", estado: "retardo" },
      ])
    );

    const { result } = renderHook(() => useAsistencias(), { wrapper });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    await act(async () => {
      await result.current.eliminarAsistencia(1);
    });

    expect(result.current.asistencias).toHaveLength(1);
    expect(result.current.asistencias[0].id).toBe(2);
  });

  it("obtiene asistencias filtradas por grupo y fecha", async () => {
    mockGetItem.mockResolvedValue(
      JSON.stringify([
        { id: 1, alumnoId: 1, grupoId: 10, fecha: "2025-03-24", estado: "presente" },
        { id: 2, alumnoId: 2, grupoId: 10, fecha: "2025-03-25", estado: "presente" },
        { id: 3, alumnoId: 3, grupoId: 20, fecha: "2025-03-24", estado: "ausente" },
      ])
    );

    const { result } = renderHook(() => useAsistencias(), { wrapper });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    const filtrado = result.current.obtenerAsistenciasPorGrupoYFecha(10, "2025-03-24");
    expect(filtrado).toHaveLength(1);
    expect(filtrado[0].alumnoId).toBe(1);
  });

  it("obtiene todas las asistencias de un grupo", async () => {
    mockGetItem.mockResolvedValue(
      JSON.stringify([
        { id: 1, alumnoId: 1, grupoId: 10, fecha: "2025-03-24", estado: "presente" },
        { id: 2, alumnoId: 2, grupoId: 10, fecha: "2025-03-25", estado: "retardo" },
        { id: 3, alumnoId: 3, grupoId: 20, fecha: "2025-03-24", estado: "ausente" },
      ])
    );

    const { result } = renderHook(() => useAsistencias(), { wrapper });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    const porGrupo = result.current.obtenerAsistenciasPorGrupo(10);
    expect(porGrupo).toHaveLength(2);
  });

  it("obtiene todas las asistencias de un alumno", async () => {
    mockGetItem.mockResolvedValue(
      JSON.stringify([
        { id: 1, alumnoId: 1, grupoId: 10, fecha: "2025-03-24", estado: "presente" },
        { id: 2, alumnoId: 1, grupoId: 20, fecha: "2025-03-25", estado: "retardo" },
        { id: 3, alumnoId: 2, grupoId: 10, fecha: "2025-03-24", estado: "ausente" },
      ])
    );

    const { result } = renderHook(() => useAsistencias(), { wrapper });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    const porAlumno = result.current.obtenerAsistenciasPorAlumno(1);
    expect(porAlumno).toHaveLength(2);
  });

  it("carga datos existentes desde AsyncStorage al montar", async () => {
    const existing = [
      { id: 5, alumnoId: 1, grupoId: 10, fecha: "2025-01-15", estado: "presente" },
      { id: 6, alumnoId: 2, grupoId: 10, fecha: "2025-01-15", estado: "retardo" },
    ];
    mockGetItem.mockResolvedValue(JSON.stringify(existing));

    const { result } = renderHook(() => useAsistencias(), { wrapper });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.asistencias).toHaveLength(2);
    expect(result.current.asistencias[0].id).toBe(5);
  });
});
