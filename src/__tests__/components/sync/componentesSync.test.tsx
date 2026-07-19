import React from "react";
import { Text } from "react-native";
import { fireEvent, screen } from "@testing-library/react-native";
import type { GlobalSyncStatus } from "../../../context/SyncContext";
import { renderConProveedores } from "../base/renderConProveedores";

jest.mock("@react-native-async-storage/async-storage", () =>
  require("@react-native-async-storage/async-storage/jest/async-storage-mock")
);

/**
 * `SyncContext` arrastra AuthContext y AsyncStorage, y su ciclo real dispararia temporizadores
 * durante las pruebas. Se simula el hook para poder situar cada estado de forma determinista:
 * lo que se verifica aqui es la presentacion, no el motor.
 */
const mockEstadoSync = {
  isOnline: true,
  status: "synced" as GlobalSyncStatus,
  lastSyncAt: null as string | null,
  pendingCount: 0,
  syncEnabled: true,
  authError: false,
  notice: null,
  dismissNotice: jest.fn(),
  syncNow: jest.fn(),
};

jest.mock("../../../context/SyncContext", () => ({
  useSyncStatus: () => mockEstadoSync,
}));

import SyncStatusChip from "../../../components/sync/SyncStatusChip";
import PendingBadge from "../../../components/sync/PendingBadge";
import SaveStateLabel from "../../../components/sync/SaveStateLabel";

const montar = renderConProveedores;

const situar = (parcial: Partial<typeof mockEstadoSync>): void => {
  Object.assign(mockEstadoSync, parcial);
};

beforeEach(() => {
  situar({
    isOnline: true,
    status: "synced",
    pendingCount: 0,
    syncEnabled: true,
    authError: false,
  });
  mockEstadoSync.syncNow = jest.fn();
});

describe("SyncStatusChip", () => {
  it("anuncia el estado completo por texto, no solo por color", () => {
    situar({ isOnline: false });
    montar(<SyncStatusChip testID="chip" />);

    expect(screen.getByTestId("chip").props.accessibilityLabel).toBe(
      "Sin conexion. Puedes seguir trabajando: tus cambios se guardan en este dispositivo."
    );
  });

  it("conserva la etiqueta accesible completa en variante compacta", () => {
    situar({ isOnline: false });
    montar(<SyncStatusChip compacto testID="chip" />);

    // Se recorta lo que se ve, nunca lo que se anuncia.
    expect(screen.queryByText("Sin conexion")).toBeNull();
    expect(screen.getByTestId("chip").props.accessibilityLabel).toContain(
      "tus cambios se guardan en este dispositivo"
    );
  });

  it("declara aria-busy explicito mientras sincroniza", () => {
    situar({ status: "syncing" });
    montar(<SyncStatusChip testID="chip" />);

    // React Native Web no lo deriva de accessibilityState: sin el prop, el ciclo en curso
    // no se anuncia en web.
    expect(screen.getByTestId("chip").props["aria-busy"]).toBe(true);
  });

  it("no se anuncia como alerta, para no interrumpir en cada ciclo periodico", () => {
    montar(<SyncStatusChip testID="chip" />);

    expect(screen.getByTestId("chip").props.accessibilityRole).not.toBe("alert");
  });

  it("con el servidor caido ofrece reintentar y llama al ciclo manual existente", () => {
    situar({ status: "error" });
    montar(<SyncStatusChip testID="chip" />);

    const chip = screen.getByTestId("chip");
    expect(chip.props.accessibilityRole).toBe("button");

    fireEvent.press(chip);
    expect(mockEstadoSync.syncNow).toHaveBeenCalledWith("manual");
  });

  it("con la sesion expirada usa la salida que provee el anfitrion", () => {
    situar({ authError: true });
    const onReingresar = jest.fn();
    montar(<SyncStatusChip onReingresar={onReingresar} testID="chip" />);

    fireEvent.press(screen.getByTestId("chip"));
    expect(onReingresar).toHaveBeenCalled();
  });

  it("sin conexion no ofrece accion, porque el reingreso seria imposible", () => {
    situar({ isOnline: false, authError: true });
    const onReingresar = jest.fn();
    montar(<SyncStatusChip onReingresar={onReingresar} testID="chip" />);

    expect(screen.getByTestId("chip").props.accessibilityRole).toBe("text");
  });

  it("al docente invitado no le dice que esta sincronizado", () => {
    situar({ syncEnabled: false, status: "synced" });
    montar(<SyncStatusChip testID="chip" />);

    const etiqueta = screen.getByTestId("chip").props.accessibilityLabel;
    expect(etiqueta).toContain("Guardado en este dispositivo");
    expect(etiqueta).not.toContain("Todo sincronizado");
  });
});

describe("PendingBadge", () => {
  it("se oculta cuando no hay cola", () => {
    situar({ pendingCount: 0 });
    montar(<PendingBadge testID="badge" />);

    expect(screen.queryByTestId("badge")).toBeNull();
  });

  it("informa el conteo con plural correcto", () => {
    situar({ pendingCount: 1 });
    const { rerender } = montar(<PendingBadge testID="badge" />);
    expect(screen.getByTestId("badge").props.accessibilityLabel).toBe("1 cambio por sincronizar");

    situar({ pendingCount: 5 });
    rerender(<PendingBadge testID="badge" />);
    expect(screen.getByTestId("badge").props.accessibilityLabel).toBe("5 cambios por sincronizar");
  });

  it("acota la cifra visible sin perder el conteo real en la etiqueta", () => {
    situar({ pendingCount: 150 });
    montar(<PendingBadge testID="badge" />);

    expect(screen.getByText("99+")).toBeTruthy();
    expect(screen.getByTestId("badge").props.accessibilityLabel).toBe(
      "150 cambios por sincronizar"
    );
  });
});

describe("SaveStateLabel", () => {
  it("dice guardado aunque no haya conexion, sin contradecir al chip global", () => {
    situar({ isOnline: false });
    montar(<SaveStateLabel estado="guardado" testID="guardado" />);

    // La distincion que importa en offline-first: guardado (esta aqui) no es sincronizado
    // (esta en el servidor). El complemento explica el resto sin alarmar.
    expect(screen.getByText("Guardado")).toBeTruthy();
    expect(screen.getByText("· Sin conexion")).toBeTruthy();
  });

  it("omite el complemento de sync cuando todo esta al dia", () => {
    montar(<SaveStateLabel estado="guardado" testID="guardado" />);

    expect(screen.getByText("Guardado")).toBeTruthy();
    expect(screen.queryByText(/·/)).toBeNull();
  });

  it("declara ocupado mientras guarda", () => {
    montar(<SaveStateLabel estado="guardando" testID="guardado" />);

    expect(screen.getByTestId("guardado").props["aria-busy"]).toBe(true);
  });

  it("incorpora el momento del ultimo guardado cuando el editor lo provee", () => {
    montar(<SaveStateLabel estado="guardado" guardadoEn="hace 2 minutos" testID="guardado" />);

    expect(screen.getByText("Guardado hace 2 minutos")).toBeTruthy();
  });

  it("el fallo de guardado local es el unico caso que se presenta como error", () => {
    montar(<SaveStateLabel estado="error" testID="guardado" />);

    expect(screen.getByText("No se pudo guardar")).toBeTruthy();
  });
});

describe("coherencia entre superficies", () => {
  it("chip y etiqueta de guardado describen el mismo estado global sin divergir", () => {
    situar({ status: "error" });
    montar(
      <>
        <SyncStatusChip testID="chip" />
        <SaveStateLabel estado="guardado" testID="guardado" />
        <Text>ancla</Text>
      </>
    );

    const chip = screen.getByTestId("chip").props.accessibilityLabel as string;
    const guardado = screen.getByTestId("guardado").props.accessibilityLabel as string;

    // Ambas leen el mismo hook, asi que el titulo del estado global coincide literalmente.
    expect(chip).toContain("Guardado en este dispositivo");
    expect(guardado).toContain("Guardado en este dispositivo");
  });
});
