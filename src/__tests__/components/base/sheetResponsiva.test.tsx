import React from "react";
import { screen } from "@testing-library/react-native";

import Sheet from "../../../components/base/Sheet";
import { getBreakpoint } from "../../../hooks/useBreakpoint";
import { renderConProveedores, estiloPlano } from "./renderConProveedores";

/**
 * Fija la forma responsiva de `Sheet`: hoja inferior a ancho completo en movil, dialogo
 * centrado de 520px en tablet y escritorio.
 *
 * Existe por un falso positivo de la QA visual de #84, que reporto la hoja como full-width
 * en tablet. La medicion habia tomado el contenedor `position: fixed` que el `Modal` de
 * react-native-web pone alrededor de todo (y que ya expone `aria-modal="true"`), no el
 * panel. Esta suite afirma sobre el panel por su `testID` propio.
 *
 * El ancho entra por `getBreakpoint` real, no por una constante escrita a mano: asi los
 * limites de rango siguen siendo los del modulo y mover un breakpoint rompe aqui tambien.
 * Solo se sustituye la lectura de dimensiones, que en Jest no tiene ventana que medir.
 */
jest.mock("@react-native-async-storage/async-storage", () =>
  require("@react-native-async-storage/async-storage/jest/async-storage-mock")
);

let mockAnchoSimulado = 375;

jest.mock("../../../hooks/useBreakpoint", () => {
  const actual = jest.requireActual("../../../hooks/useBreakpoint");
  return {
    ...actual,
    useBreakpoint: () => {
      const breakpoint = actual.getBreakpoint(mockAnchoSimulado);
      return {
        width: mockAnchoSimulado,
        height: 812,
        fontScale: 1,
        breakpoint,
        isMobile: breakpoint === "mobile",
        isTablet: breakpoint === "tablet",
        isDesktop: breakpoint === "desktop",
      };
    },
  };
});

function renderEnAncho(width: number) {
  mockAnchoSimulado = width;
  renderConProveedores(
    <Sheet visible titulo="Filtros" onClose={() => undefined} testID="sheet">
      <></>
    </Sheet>
  );
}

function estiloDe(testID: string) {
  return estiloPlano(screen.getByTestId(testID).props.style);
}

describe("Sheet: forma por breakpoint", () => {
  it.each([375, 767])("a %ipx es hoja inferior a ancho completo", (width) => {
    expect(getBreakpoint(width)).toBe("mobile");
    renderEnAncho(width);

    const panel = estiloDe("sheet-panel");
    expect(panel.width).toBe("100%");
    // Las esquinas inferiores rectas son lo que la ancla al borde: si se redondean,
    // deja de nacer del borde inferior.
    expect(panel.borderBottomLeftRadius).toBe(0);
    expect(panel.borderBottomRightRadius).toBe(0);

    // La raiz es quien coloca al panel; un ancho correcto con la alineacion equivocada
    // seguiria viendose mal.
    const raiz = estiloDe("sheet");
    expect(raiz.justifyContent).toBe("flex-end");
  });

  it.each([768, 1279, 1280])("a %ipx es dialogo centrado de 520px", (width) => {
    expect(getBreakpoint(width)).not.toBe("mobile");
    renderEnAncho(width);

    const panel = estiloDe("sheet-panel");
    expect(panel.width).toBe(520);
    expect(panel.borderBottomLeftRadius).toBeGreaterThan(0);
    expect(panel.borderBottomRightRadius).toBeGreaterThan(0);

    const raiz = estiloDe("sheet");
    expect(raiz.justifyContent).toBe("center");
    expect(raiz.alignItems).toBe("center");
  });
});
