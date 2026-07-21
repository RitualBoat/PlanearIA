import React from "react";
import { Text } from "react-native";
import { fireEvent, screen } from "@testing-library/react-native";
import type { GlobalSyncStatus } from "../../../context/SyncContext";
import { estiloPlano, renderConProveedores } from "../base/renderConProveedores";
import { MIN_TOUCH_TARGET } from "../../../components/base/primitives";

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
  it("anuncia el estado completo por texto, no solo por color", async () => {
    situar({ isOnline: false });
    montar(<SyncStatusChip testID="chip" />);

    expect(screen.getByTestId("chip").props.accessibilityLabel).toBe(
      "Sin conexion. Puedes seguir trabajando: tus cambios se guardan en este dispositivo."
    );
  });

  it("conserva la etiqueta accesible completa en variante compacta", async () => {
    situar({ isOnline: false });
    montar(<SyncStatusChip compacto testID="chip" />);

    // Se recorta lo que se ve, nunca lo que se anuncia.
    expect(screen.queryByText("Sin conexion")).toBeNull();
    expect(screen.getByTestId("chip").props.accessibilityLabel).toContain(
      "tus cambios se guardan en este dispositivo"
    );
  });

  it("declara aria-busy explicito mientras sincroniza", async () => {
    situar({ status: "syncing" });
    montar(<SyncStatusChip testID="chip" />);

    // React Native Web no lo deriva de accessibilityState: sin el prop, el ciclo en curso
    // no se anuncia en web.
    expect(screen.getByTestId("chip").props["aria-busy"]).toBe(true);
  });

  it("no se anuncia como alerta, para no interrumpir en cada ciclo periodico", async () => {
    montar(<SyncStatusChip testID="chip" />);

    expect(screen.getByTestId("chip").props.accessibilityRole).not.toBe("alert");
  });

  it("con el servidor caido ofrece reintentar y llama al ciclo manual existente", async () => {
    situar({ status: "error" });
    montar(<SyncStatusChip testID="chip" />);

    const chip = screen.getByTestId("chip");
    expect(chip.props.accessibilityRole).toBe("button");

    fireEvent.press(chip);
    expect(mockEstadoSync.syncNow).toHaveBeenCalledWith("manual");
  });

  it("con la sesion expirada usa la salida que provee el anfitrion", async () => {
    situar({ authError: true });
    const onReingresar = jest.fn();
    montar(<SyncStatusChip onReingresar={onReingresar} testID="chip" />);

    fireEvent.press(screen.getByTestId("chip"));
    expect(onReingresar).toHaveBeenCalled();
  });

  it("sin conexion no ofrece accion, porque el reingreso seria imposible", async () => {
    situar({ isOnline: false, authError: true });
    const onReingresar = jest.fn();
    montar(<SyncStatusChip onReingresar={onReingresar} testID="chip" />);

    // Lo que importa no es el rol concreto sino que no se ofrezca una accion: sin red, el
    // reingreso no puede completarse.
    expect(screen.getByTestId("chip").props.accessibilityRole).not.toBe("button");
    expect(onReingresar).not.toHaveBeenCalled();
  });

  /**
   * Hallazgo de la revision adversarial: `hitSlop` extiende el alto, pero no puede ensanchar
   * por debajo del ancho real. En compacto el chip mide 32 px (medido en navegador), asi que
   * un chip accionable y compacto quedaba con 32 pt de lado corto. Mismo defecto que #82
   * corrigio en Chip con un ancho minimo.
   */
  it("el chip accionable garantiza 44 pt de lado corto tambien en compacto", async () => {
    situar({ status: "error" });
    montar(<SyncStatusChip compacto testID="chip" />);

    const chip = screen.getByTestId("chip");
    const estilo = estiloPlano(chip.props.style);
    const slop = chip.props.hitSlop;

    expect(estilo.minWidth).toBe(MIN_TOUCH_TARGET);
    expect((estilo.height as number) + slop.top + slop.bottom).toBe(MIN_TOUCH_TARGET);
  });

  it("el chip inerte no reclama area tactil que no usa", async () => {
    montar(<SyncStatusChip compacto testID="chip" />);

    expect(estiloPlano(screen.getByTestId("chip").props.style).minWidth).toBeLessThan(
      MIN_TOUCH_TARGET
    );
  });

  it("al docente invitado no le dice que esta sincronizado", async () => {
    situar({ syncEnabled: false, status: "synced" });
    montar(<SyncStatusChip testID="chip" />);

    const etiqueta = screen.getByTestId("chip").props.accessibilityLabel;
    expect(etiqueta).toContain("Guardado en este dispositivo");
    expect(etiqueta).not.toContain("Todo sincronizado");
  });
});

describe("PendingBadge", () => {
  it("se oculta cuando no hay cola", async () => {
    situar({ pendingCount: 0 });
    montar(<PendingBadge testID="badge" />);

    expect(screen.queryByTestId("badge")).toBeNull();
  });

  it("informa el conteo con plural correcto", async () => {
    situar({ pendingCount: 1 });
    const { rerender } = await montar(<PendingBadge testID="badge" />);
    expect(screen.getByTestId("badge").props.accessibilityLabel).toBe("1 cambio por sincronizar");

    situar({ pendingCount: 5 });
    rerender(<PendingBadge testID="badge" />);
    expect(screen.getByTestId("badge").props.accessibilityLabel).toBe("5 cambios por sincronizar");
  });

  it("acota la cifra visible sin perder el conteo real en la etiqueta", async () => {
    situar({ pendingCount: 150 });
    montar(<PendingBadge testID="badge" />);

    expect(screen.getByText("99+")).toBeTruthy();
    expect(screen.getByTestId("badge").props.accessibilityLabel).toBe(
      "150 cambios por sincronizar"
    );
  });
});

describe("SaveStateLabel", () => {
  it("dice guardado aunque no haya conexion, sin contradecir al chip global", async () => {
    situar({ isOnline: false });
    montar(<SaveStateLabel estado="guardado" testID="guardado" />);

    // La distincion que importa en offline-first: guardado (esta aqui) no es sincronizado
    // (esta en el servidor). El complemento explica el resto sin alarmar.
    expect(screen.getByText("Guardado")).toBeTruthy();
    expect(screen.getByText("· Sin conexion")).toBeTruthy();
  });

  it("omite el complemento de sync cuando todo esta al dia", async () => {
    montar(<SaveStateLabel estado="guardado" testID="guardado" />);

    expect(screen.getByText("Guardado")).toBeTruthy();
    expect(screen.queryByText(/·/)).toBeNull();
  });

  it("declara ocupado mientras guarda", async () => {
    montar(<SaveStateLabel estado="guardando" testID="guardado" />);

    expect(screen.getByTestId("guardado").props["aria-busy"]).toBe(true);
  });

  it("incorpora el momento del ultimo guardado cuando el editor lo provee", async () => {
    montar(<SaveStateLabel estado="guardado" guardadoEn="hace 2 minutos" testID="guardado" />);

    expect(screen.getByText("Guardado hace 2 minutos")).toBeTruthy();
  });

  /**
   * Hallazgo de la revision adversarial: con sesion de invitado renderizaba
   * "Guardado - Guardado en este dispositivo" y lo anunciaba con la palabra repetida.
   */
  it("no tartamudea con el docente invitado", async () => {
    situar({ syncEnabled: false });
    montar(<SaveStateLabel estado="guardado" testID="guardado" />);

    expect(screen.getByText("Guardado")).toBeTruthy();
    expect(screen.queryByText(/·/)).toBeNull();
    expect(screen.getByTestId("guardado").props.accessibilityLabel).toBe("Guardado");
  });

  it("con el servidor caido tampoco repite que esta guardado", async () => {
    situar({ status: "error" });
    montar(<SaveStateLabel estado="guardado" testID="guardado" />);

    expect(screen.queryByText(/· Guardado/)).toBeNull();
  });

  it("el fallo de guardado local es el unico caso que se presenta como error", async () => {
    montar(<SaveStateLabel estado="error" testID="guardado" />);

    expect(screen.getByText("No se pudo guardar")).toBeTruthy();
  });
});

describe("coherencia entre superficies", () => {
  it("chip y etiqueta de guardado nombran el mismo estado global con las mismas palabras", async () => {
    situar({ isOnline: false });
    montar(
      <>
        <SyncStatusChip testID="chip" />
        <SaveStateLabel estado="guardado" testID="guardado" />
        <Text>ancla</Text>
      </>
    );

    // Ambas leen la misma tabla: el complemento de la etiqueta usa literalmente el mismo
    // nombre de estado que el chip muestra como titulo. No pueden divergir en un cambio
    // de copy porque no hay dos copys.
    expect(screen.getByText("Sin conexion")).toBeTruthy();
    expect(screen.getByText("· Sin conexion")).toBeTruthy();
    expect(screen.getByTestId("guardado").props.accessibilityLabel).toContain(
      screen.getByTestId("chip").props.accessibilityLabel
    );
  });

  /**
   * Coherencia no es identidad: con el servidor caido, el chip titula "Guardado en este
   * dispositivo" y la etiqueta de guardado calla su complemento, justamente para no repetir
   * esa frase. Ambas siguen saliendo de la misma tabla.
   */
  it("coherencia no obliga a repetir la misma frase en las dos superficies", async () => {
    situar({ status: "error" });
    montar(
      <>
        <SyncStatusChip testID="chip" />
        <SaveStateLabel estado="guardado" testID="guardado" />
        <Text>ancla</Text>
      </>
    );

    expect(screen.getByTestId("chip").props.accessibilityLabel).toContain(
      "Guardado en este dispositivo"
    );
    expect(screen.getByTestId("guardado").props.accessibilityLabel).toBe("Guardado");
  });
});
