import React from "react";
import { act, renderHook, waitFor } from "@testing-library/react-native";
import { AlumnosProvider, useAlumnos } from "../../context/AlumnosContext";

const mockGetItem = jest.fn();
const mockSetItem = jest.fn();
const mockQueueEntityOperation = jest.fn();

jest.mock("@react-native-async-storage/async-storage", () => ({
  getItem: (...args: unknown[]) => mockGetItem(...args),
  setItem: (...args: unknown[]) => mockSetItem(...args),
}));

jest.mock("../../sync/services/entitySync", () => ({
  SYNC_ENTITIES: {
    alumnos: {
      entity: "alumnos",
      endpoint: "/api/alumnos",
      storageKey: "@planearia:alumnos",
      responseKey: "alumnos",
    },
  },
  queueEntityOperation: (...args: unknown[]) => mockQueueEntityOperation(...args),
}));

jest.mock("../../sync/services/syncEvents", () => ({
  onSyncEvent: jest.fn(() => jest.fn()),
}));

const wrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <AlumnosProvider>{children}</AlumnosProvider>
);

describe("AlumnosContext batch creation", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockGetItem.mockResolvedValue(
      JSON.stringify([
        {
          id: 10,
          nombre: "Alumno",
          apellidos: "Existente",
          numeroControl: "A010",
          carrera: "ISC",
          fechaIngreso: "2026-01-01T00:00:00.000Z",
          estado: "activo",
        },
      ])
    );
    mockSetItem.mockResolvedValue(undefined);
    mockQueueEntityOperation.mockResolvedValue(true);
  });

  it("persiste todos los alumnos de un lote en una sola actualizacion", async () => {
    const { result } = renderHook(() => useAlumnos(), { wrapper });

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    await act(async () => {
      await result.current.agregarAlumnos([
        {
          id: 11,
          nombre: "Ana",
          apellidos: "Lopez",
          numeroControl: "A011",
          carrera: "ISC",
          fechaIngreso: new Date("2026-01-02T00:00:00.000Z"),
          estado: "activo",
        },
        {
          id: 12,
          nombre: "Bruno",
          apellidos: "Diaz",
          numeroControl: "A012",
          carrera: "IGE",
          fechaIngreso: new Date("2026-01-03T00:00:00.000Z"),
          estado: "activo",
        },
      ]);
    });

    expect(mockSetItem).toHaveBeenCalledTimes(1);
    const saved = JSON.parse(mockSetItem.mock.calls[0][1]);
    expect(saved).toHaveLength(3);
    expect(saved.map((alumno: { numeroControl: string }) => alumno.numeroControl)).toEqual([
      "A010",
      "A011",
      "A012",
    ]);
    expect(mockQueueEntityOperation).toHaveBeenCalledTimes(2);
  });
});
