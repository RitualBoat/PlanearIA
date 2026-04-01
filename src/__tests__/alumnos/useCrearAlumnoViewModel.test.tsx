import React from "react";
import { act, renderHook } from "@testing-library/react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { AlumnosProvider } from "../../context/AlumnosContext";
import { useCrearAlumnoViewModel } from "../../hooks/useCrearAlumnoViewModel";

const mockGetItem = jest.fn();
const mockSetItem = jest.fn();

jest.mock("@react-native-async-storage/async-storage", () => ({
  getItem: (...args: unknown[]) => mockGetItem(...args),
  setItem: (...args: unknown[]) => mockSetItem(...args),
}));

const wrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return <AlumnosProvider>{children}</AlumnosProvider>;
};

describe("useCrearAlumnoViewModel", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockGetItem.mockResolvedValue("[]");
    mockSetItem.mockResolvedValue(undefined);
  });

  it("valida campos requeridos del formulario", async () => {
    const { result } = renderHook(() => useCrearAlumnoViewModel(), { wrapper });

    let response: { ok: boolean; syncOk: boolean | null; alumnoId?: number } = {
      ok: true,
      syncOk: null,
    };
    await act(async () => {
      response = await result.current.guardarAlumno();
    });

    expect(response.ok).toBe(false);
    expect(result.current.errors.nombre).toBeTruthy();
    expect(result.current.errors.apellidos).toBeTruthy();
    expect(result.current.errors.numeroControl).toBeTruthy();
    expect(result.current.errors.carrera).toBeTruthy();
  });

  it("persiste alumno cuando datos son validos", async () => {
    const { result } = renderHook(() => useCrearAlumnoViewModel(), { wrapper });

    await act(async () => {
      result.current.setNombre("Ana");
      result.current.setApellidos("Lopez");
      result.current.setNumeroControl("A001");
      result.current.setCarrera("ISC");
      result.current.setEmail("ana@example.com");
    });

    let response: { ok: boolean; syncOk: boolean | null; alumnoId?: number } = {
      ok: false,
      syncOk: null,
    };
    await act(async () => {
      response = await result.current.guardarAlumno();
    });

    expect(response.ok).toBe(true);
    expect(mockSetItem).toHaveBeenCalledWith("@planearia:alumnos", expect.any(String));

    const savedRaw = mockSetItem.mock.calls[mockSetItem.mock.calls.length - 1][1];
    const saved = JSON.parse(savedRaw);
    expect(saved).toHaveLength(1);
    expect(saved[0]).toEqual(
      expect.objectContaining({
        nombre: "Ana",
        apellidos: "Lopez",
        numeroControl: "A001",
        carrera: "ISC",
        email: "ana@example.com",
      })
    );
  });

  it("rechaza email invalido", async () => {
    const { result } = renderHook(() => useCrearAlumnoViewModel(), { wrapper });

    await act(async () => {
      result.current.setNombre("Ana");
      result.current.setApellidos("Lopez");
      result.current.setNumeroControl("A001");
      result.current.setCarrera("ISC");
      result.current.setEmail("correo-invalido");
    });

    let response: { ok: boolean; syncOk: boolean | null; alumnoId?: number } = {
      ok: true,
      syncOk: null,
    };
    await act(async () => {
      response = await result.current.guardarAlumno();
    });

    expect(response.ok).toBe(false);
    expect(result.current.errors.email).toContain("email válido");
    expect(mockSetItem).not.toHaveBeenCalled();
  });

  it("carga datos y actualiza alumno existente", async () => {
    mockGetItem.mockResolvedValue(
      JSON.stringify([
        {
          id: 10,
          nombre: "Carlos",
          apellidos: "Ramirez",
          numeroControl: "A010",
          carrera: "ISC",
          fechaIngreso: "2026-01-01T00:00:00.000Z",
          estado: "activo",
        },
      ])
    );

    const { result } = renderHook(() => useCrearAlumnoViewModel(), { wrapper });

    await act(async () => {
      await Promise.resolve();
    });

    await act(async () => {
      result.current.cargarFormularioDesdeAlumno({
        id: 10,
        nombre: "Carlos",
        apellidos: "Ramirez",
        numeroControl: "A010",
        carrera: "ISC",
        fechaIngreso: new Date("2026-01-01T00:00:00.000Z"),
        estado: "activo",
      } as any);
      result.current.setEmail("carlos@correo.com");
    });

    let response: { ok: boolean; syncOk: boolean | null; alumnoId?: number } = {
      ok: false,
      syncOk: null,
    };
    await act(async () => {
      response = await result.current.guardarAlumno({ modo: "editar", alumnoId: 10 });
    });

    expect(response.ok).toBe(true);

    const savedRaw = mockSetItem.mock.calls[mockSetItem.mock.calls.length - 1][1];
    const saved = JSON.parse(savedRaw);
    expect(saved).toHaveLength(1);
    expect(saved[0]).toEqual(
      expect.objectContaining({
        id: 10,
        nombre: "Carlos",
        apellidos: "Ramirez",
        numeroControl: "A010",
        email: "carlos@correo.com",
      })
    );
  });
});
