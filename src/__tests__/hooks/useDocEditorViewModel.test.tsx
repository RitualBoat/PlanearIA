import React from "react";
import { act, renderHook, waitFor } from "@testing-library/react-native";

/**
 * Verifica la maquina de historial del editor tras moverla a un useReducer puro
 * (regla no-impure-state-updater): undo/redo, dirty-state, limite de historial, no-op y
 * correctitud bajo la doble invocacion de React (StrictMode).
 */

jest.mock("@react-native-async-storage/async-storage", () => ({
  getItem: jest.fn().mockResolvedValue(null),
  setItem: jest.fn().mockResolvedValue(undefined),
  removeItem: jest.fn().mockResolvedValue(undefined),
}));

const mockNavigate = jest.fn();
jest.mock("@react-navigation/native", () => ({
  useNavigation: () => ({
    navigate: mockNavigate,
    dispatch: jest.fn(),
    addListener: jest.fn(() => jest.fn()),
  }),
  useRoute: () => ({ params: { modo: "crear" }, key: "route-crear-1" }),
}));

const mockCrear = jest.fn().mockResolvedValue(undefined);
const mockActualizar = jest.fn().mockResolvedValue(undefined);
const mockObtenerDocumento = jest.fn(() => undefined);
jest.mock("../../context/PlaneacionesContext", () => ({
  usePlaneaciones: () => ({
    crear: mockCrear,
    actualizar: mockActualizar,
    obtenerDocumento: mockObtenerDocumento,
  }),
}));

jest.mock("../../context/AuthContext", () => ({
  useAuth: () => ({ usuario: { id: "user-1", nombre: "Ana", apellidos: "Docente" } }),
}));

jest.mock("../../services/plantillaDocumentoService", () => ({
  getPlantillaDocumento: jest.fn().mockResolvedValue(null),
  buildDocumentoFromPlantilla: jest.fn(),
}));

jest.mock("../../navigation/navigateToHub", () => ({ navigateToHub: jest.fn() }));

import { useDocEditorViewModel } from "../../hooks/useDocEditorViewModel";
import type { ElementosCurriculares } from "../../../types/planeacionV2";

const setContenido = (
  current: ElementosCurriculares,
  contenido: string
): ElementosCurriculares => ({ ...current, contenido });

const bootUp = async () => {
  const rendered = renderHook(() => useDocEditorViewModel());
  await waitFor(() => expect(rendered.result.current.isLoading).toBe(false));
  return rendered;
};

describe("useDocEditorViewModel (maquina de historial pura)", () => {
  beforeEach(() => jest.clearAllMocks());

  it("aplica un cambio: marca dirty y habilita deshacer", async () => {
    const { result } = await bootUp();
    expect(result.current.isDirty).toBe(false);
    expect(result.current.canUndo).toBe(false);

    act(() => {
      result.current.setCurricular(setContenido(result.current.documento.elementosCurriculares, "Fracciones"));
    });

    expect(result.current.isDirty).toBe(true);
    expect(result.current.canUndo).toBe(true);
    expect(result.current.documento.elementosCurriculares.contenido).toBe("Fracciones");
  });

  it("deshacer restaura el documento previo y rehacer lo reaplica", async () => {
    const { result } = await bootUp();
    const baseContenido = result.current.documento.elementosCurriculares.contenido;

    act(() => {
      result.current.setCurricular(setContenido(result.current.documento.elementosCurriculares, "Fracciones"));
    });
    expect(result.current.documento.elementosCurriculares.contenido).toBe("Fracciones");

    act(() => result.current.undo());
    expect(result.current.documento.elementosCurriculares.contenido).toBe(baseContenido);
    expect(result.current.canUndo).toBe(false);
    expect(result.current.canRedo).toBe(true);

    act(() => result.current.redo());
    expect(result.current.documento.elementosCurriculares.contenido).toBe("Fracciones");
    expect(result.current.canRedo).toBe(false);
    expect(result.current.canUndo).toBe(true);
  });

  it("un updater que no cambia el documento no crea historial ni marca dirty (no-op)", async () => {
    const { result } = await bootUp();
    const rawActual = result.current.documento.contenidoRaw;

    act(() => result.current.setContenidoRaw(rawActual));

    expect(result.current.isDirty).toBe(false);
    expect(result.current.canUndo).toBe(false);
  });

  it("respeta el limite de 30 entradas de historial", async () => {
    const { result } = await bootUp();

    for (let i = 1; i <= 35; i++) {
      act(() => {
        result.current.setCurricular(setContenido(result.current.documento.elementosCurriculares, `v${i}`));
      });
    }
    expect(result.current.documento.elementosCurriculares.contenido).toBe("v35");

    let undos = 0;
    while (result.current.canUndo) {
      act(() => result.current.undo());
      undos++;
      if (undos > 40) break; // guardia anti-bucle
    }
    expect(undos).toBe(30);
  });

  it("mantiene undo/redo correctos bajo la doble invocacion de StrictMode", async () => {
    const rendered = renderHook(() => useDocEditorViewModel(), { wrapper: React.StrictMode });
    await waitFor(() => expect(rendered.result.current.isLoading).toBe(false));
    const { result } = rendered;

    act(() => {
      result.current.setCurricular(setContenido(result.current.documento.elementosCurriculares, "A"));
    });
    act(() => {
      result.current.setCurricular(setContenido(result.current.documento.elementosCurriculares, "B"));
    });
    expect(result.current.documento.elementosCurriculares.contenido).toBe("B");

    act(() => result.current.undo());
    expect(result.current.documento.elementosCurriculares.contenido).toBe("A");
    act(() => result.current.undo());
    expect(result.current.documento.elementosCurriculares.contenido).toBe("");
    expect(result.current.canUndo).toBe(false);

    act(() => result.current.redo());
    expect(result.current.documento.elementosCurriculares.contenido).toBe("A");
  });
});
