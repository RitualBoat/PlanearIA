import React from "react";
import { act, fireEvent, waitFor } from "@testing-library/react-native";
import { renderConProveedores } from "../base/renderConProveedores";
import AssignSheet from "../../../components/assign/AssignSheet";
import type { PresentacionSync } from "../../../hooks/syncPresentation";

/**
 * Hoja del selector transversal (change assign-sheet, #84).
 *
 * La hoja renderiza lo que resuelve el ViewModel. Estas pruebas verifican lo que el docente
 * percibe: que no puede confirmar sin destino, que su eleccion se anuncia sin depender del
 * color, que cerrar no escribe nada y que sin conexion puede asignar igual.
 */

jest.mock("@react-native-async-storage/async-storage", () =>
  require("@react-native-async-storage/async-storage/jest/async-storage-mock")
);

const mockActualizarRecurso = jest.fn().mockResolvedValue({ syncOk: true });
let mockGrupos: Array<{ id: number; nombre: string }> = [{ id: 1, nombre: "2do A" }];

jest.mock("../../../context/GruposContext", () => ({
  useGruposContext: () => ({ grupos: mockGrupos, isLoading: false }),
}));

jest.mock("../../../context/RecursosContext", () => ({
  useRecursos: () => ({
    actualizarRecurso: (...args: unknown[]) => mockActualizarRecurso(...args),
    obtenerRecursoPorId: (id: number) => ({ id }),
  }),
}));

jest.mock("../../../context/EntregablesContext", () => ({
  useEntregables: () => ({
    actualizarEntregable: jest.fn(),
    obtenerEntregablePorId: (id: number) => ({ id }),
  }),
}));

jest.mock("../../../services/classroom/classroomFacade", () => ({
  classroomFacade: {
    getUnidadesByGrupoId: jest.fn().mockResolvedValue([
      { id: "u1", grupoId: 1, nombre: "Unidad 1", posicion: 0 },
    ]),
    getActividadesByGrupoId: jest.fn().mockResolvedValue([]),
  },
}));

const PRESENTACION_BASE: PresentacionSync = {
  estado: "sincronizado",
  tono: "exito",
  icono: "cloud-done",
  titulo: "Todo sincronizado",
  detalle: null,
  etiquetaA11y: "Todo sincronizado",
  accion: null,
  ocupado: false,
  complementoGuardado: null,
};

let mockPresentacion: PresentacionSync = PRESENTACION_BASE;

jest.mock("../../../hooks/useSyncPresentation", () => ({
  useSyncPresentation: () => mockPresentacion,
}));

const ELEMENTO = { id: 1, titulo: "Guia de fracciones", tipo: "recurso" as const };

const montar = async (props: Partial<React.ComponentProps<typeof AssignSheet>> = {}) =>
  await renderConProveedores(
    <AssignSheet
      visible
      elementos={[ELEMENTO]}
      onClose={props.onClose ?? jest.fn()}
      testID="hoja"
      {...props}
    />
  );

describe("AssignSheet", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockGrupos = [{ id: 1, nombre: "2do A" }];
    mockPresentacion = PRESENTACION_BASE;
  });

  it("no permite confirmar mientras no hay clase elegida", async () => {
    const { getByTestId } = await montar();
    // La carga async de destinos resuelve tras el montaje; sin este flush su
    // actualizacion de estado cae fuera de act().
    await act(async () => {});
    expect(getByTestId("hoja-confirmar").props.accessibilityState.disabled).toBe(true);
  });

  it("anuncia la eleccion sin depender del color", async () => {
    const { getByTestId } = await montar();

    const clase = getByTestId("hoja-clase-1");
    expect(clase.props.accessibilityState.checked).toBe(false);

    fireEvent.press(clase);

    await waitFor(() => expect(getByTestId("hoja-clase-1").props.accessibilityState.checked).toBe(true));
    expect(getByTestId("hoja-clase-1").props.accessibilityLabel).toBe("2do A");
  });

  it("nombra el destino en la confirmacion y no una formula generica", async () => {
    const { getByTestId } = await montar();

    fireEvent.press(getByTestId("hoja-clase-1"));
    await waitFor(() => expect(getByTestId("hoja-unidad-u1")).toBeTruthy());
    fireEvent.press(getByTestId("hoja-unidad-u1"));

    await waitFor(() =>
      expect(getByTestId("hoja-confirmar").props.accessibilityHint).toBe(
        "Asignar Guia de fracciones a 2do A - Unidad 1"
      )
    );
  });

  it("no escribe nada si el docente cierra sin confirmar", async () => {
    const onClose = jest.fn();
    const { getByTestId } = await montar({ onClose });

    fireEvent.press(getByTestId("hoja-clase-1"));
    await waitFor(() => expect(getByTestId("hoja-clase-1").props.accessibilityState.checked).toBe(true));
    fireEvent.press(getByTestId("hoja-cancelar"));

    expect(mockActualizarRecurso).not.toHaveBeenCalled();
    expect(onClose).toHaveBeenCalled();
  });

  it("permite asignar sin conexion y lo informa sin bloquear", async () => {
    mockPresentacion = {
      ...PRESENTACION_BASE,
      estado: "sin-conexion",
      tono: "aviso",
      titulo: "Guardado en este dispositivo",
    };
    const { getByTestId } = await montar();

    expect(getByTestId("hoja-offline")).toBeTruthy();
    fireEvent.press(getByTestId("hoja-clase-1"));

    await waitFor(() =>
      expect(getByTestId("hoja-confirmar").props.accessibilityState.disabled).toBe(false)
    );
  });

  it("informa que quedo en cola cuando la sincronizacion no drena", async () => {
    mockActualizarRecurso.mockResolvedValueOnce({ syncOk: false });
    mockPresentacion = {
      ...PRESENTACION_BASE,
      estado: "sin-conexion",
      titulo: "Guardado en este dispositivo",
    };
    const { getByTestId, getByText } = await montar();

    fireEvent.press(getByTestId("hoja-clase-1"));
    // Confirmar sigue bloqueado mientras cargan los destinos: presionar antes seria un
    // clic que la hoja ignora, y la prueba pasaria a verificar nada.
    await waitFor(() =>
      expect(getByTestId("hoja-confirmar").props.accessibilityState.disabled).toBe(false)
    );
    fireEvent.press(getByTestId("hoja-confirmar"));

    await waitFor(() => expect(getByTestId("hoja-resultado")).toBeTruthy());
    expect(
      getByText("Guardado en este dispositivo. Se asignara en el servidor cuando vuelva la conexion.")
    ).toBeTruthy();
  });

  it("ofrece una salida cuando el docente no tiene ninguna clase", async () => {
    mockGrupos = [];
    const onCrearClase = jest.fn();
    const { getByTestId, getByText } = await montar({ onCrearClase });

    // Mismo flush de la carga async de destinos.
    await act(async () => {});
    expect(getByTestId("hoja-vacio")).toBeTruthy();
    fireEvent.press(getByText("Crear clase"));
    expect(onCrearClase).toHaveBeenCalled();
  });
});
