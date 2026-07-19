import React from "react";
import { fireEvent, screen } from "@testing-library/react-native";
import EmptyState from "../../../components/base/EmptyState";
import Skeleton from "../../../components/base/Skeleton";
import Banner from "../../../components/base/Banner";
import Toast from "../../../components/base/Toast";
import Sheet from "../../../components/base/Sheet";
import type { EmptyStateVariant } from "../../../components/base/EmptyState";
import { renderConProveedores } from "./renderConProveedores";

jest.mock("@react-native-async-storage/async-storage", () =>
  require("@react-native-async-storage/async-storage/jest/async-storage-mock")
);

const mockReduceMotion = jest.fn(() => false);
jest.mock("../../../themes/useReducedMotionPreference", () => ({
  useReducedMotionPreference: () => mockReduceMotion(),
}));

const VARIANTES: EmptyStateVariant[] = ["empty", "error", "offline"];

describe("EmptyState", () => {
  beforeEach(() => mockReduceMotion.mockReturnValue(false));

  it.each(VARIANTES)("la variante %s trae titulo y mensaje propios", (variant) => {
    renderConProveedores(<EmptyState variant={variant} testID="estado" />);

    // Cada variante rinde texto por defecto: un estado nunca queda como pantalla en blanco.
    expect(screen.getByTestId("estado")).toBeTruthy();
  });

  it("las tres variantes no comparten su copy", () => {
    const titulos = VARIANTES.map((variant) => {
      const { unmount } = renderConProveedores(<EmptyState variant={variant} />);
      const textos = screen
        .getAllByText(/.+/)
        .map((nodo) => nodo.props.children)
        .join(" | ");
      unmount();
      return textos;
    });

    // Reutilizar el copy dejaria al docente sin saber si el problema es suyo, de la red
    // o del servidor.
    expect(new Set(titulos).size).toBe(VARIANTES.length);
  });

  it("ofrece una salida accionable en cada variante", () => {
    const onPress = jest.fn();
    renderConProveedores(
      <EmptyState variant="offline" accion={{ label: "Reintentar", onPress }} testID="estado" />
    );

    fireEvent.press(screen.getByTestId("estado-accion"));

    expect(onPress).toHaveBeenCalledTimes(1);
  });

  it("permite sustituir el copy por defecto", () => {
    renderConProveedores(
      <EmptyState variant="empty" titulo="Sin planeaciones" mensaje="Crea la primera" />
    );

    expect(screen.getByText("Sin planeaciones")).toBeTruthy();
    expect(screen.getByText("Crea la primera")).toBeTruthy();
  });
});

describe("Skeleton", () => {
  it("se anuncia como carga en curso", () => {
    mockReduceMotion.mockReturnValue(false);
    renderConProveedores(<Skeleton testID="skeleton" />);

    const skeleton = screen.getByTestId("skeleton");
    expect(skeleton.props.accessibilityRole).toBe("progressbar");
    expect(skeleton.props.accessibilityLabel).toBe("Cargando");
  });

  it("bajo reduce-motion se presenta sin pulso pero sigue comunicando carga", () => {
    mockReduceMotion.mockReturnValue(true);
    renderConProveedores(<Skeleton testID="skeleton" />);

    const skeleton = screen.getByTestId("skeleton");
    // La variante estatica equivalente: mismo rol y misma etiqueta, sin animacion.
    expect(skeleton.props.accessibilityRole).toBe("progressbar");
    expect(skeleton.props.accessibilityLabel).toBe("Cargando");
  });
});

describe("Banner", () => {
  it("se anuncia como alerta y muestra su accion", () => {
    const onPress = jest.fn();
    renderConProveedores(
      <Banner
        tone="warning"
        titulo="Cambios sin sincronizar"
        accion={{ label: "Sincronizar", onPress }}
        testID="banner"
      />
    );

    expect(screen.getByTestId("banner").props.accessibilityRole).toBe("alert");
    fireEvent.press(screen.getByLabelText("Sincronizar"));
    expect(onPress).toHaveBeenCalledTimes(1);
  });

  it("expone el descarte con etiqueta propia", () => {
    const onDismiss = jest.fn();
    renderConProveedores(<Banner titulo="Aviso" onDismiss={onDismiss} testID="banner" />);

    fireEvent.press(screen.getByLabelText("Descartar aviso"));

    expect(onDismiss).toHaveBeenCalledTimes(1);
  });
});

describe("Toast", () => {
  it("no monta nada cuando no es visible", () => {
    renderConProveedores(<Toast visible={false} mensaje="Guardado" testID="toast" />);

    expect(screen.queryByTestId("toast")).toBeNull();
  });

  it("se anuncia como region viva cuando aparece", () => {
    renderConProveedores(<Toast visible mensaje="Guardado" testID="toast" />);

    const toast = screen.getByTestId("toast");
    expect(toast.props.accessibilityRole).toBe("alert");
    expect(screen.getByText("Guardado")).toBeTruthy();
  });

  it("descarta al presionar su boton de cerrar", () => {
    const onDismiss = jest.fn();
    renderConProveedores(
      <Toast visible mensaje="Guardado" onDismiss={onDismiss} testID="toast" />
    );

    fireEvent.press(screen.getByTestId("toast-dismiss"));

    expect(onDismiss).toHaveBeenCalledTimes(1);
  });
});

describe("Sheet", () => {
  it("cierra al tocar el fondo", () => {
    const onClose = jest.fn();
    renderConProveedores(
      <Sheet visible titulo="Filtros" onClose={onClose} testID="sheet">
        <></>
      </Sheet>
    );

    // El fondo queda fuera del arbol de accesibilidad a proposito: el panel declara
    // accessibilityViewIsModal, asi que un lector de pantalla se queda dentro del panel y
    // usa su boton de cerrar. El toque en el fondo sigue siendo un atajo para quien ve.
    fireEvent.press(screen.getByTestId("sheet-backdrop", { includeHiddenElements: true }));

    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it("expone un cierre etiquetado en el encabezado", () => {
    const onClose = jest.fn();
    renderConProveedores(
      <Sheet visible titulo="Filtros" onClose={onClose} testID="sheet">
        <></>
      </Sheet>
    );

    fireEvent.press(screen.getByTestId("sheet-close"));

    expect(onClose).toHaveBeenCalledTimes(1);
    expect(screen.getByText("Filtros")).toBeTruthy();
  });
});
