import { getBreakpoint } from "../../hooks/useBreakpoint";
import { getShellNavigationOptions } from "../../navigation/shellOptions";

/**
 * Shell adaptativo (change app-shell-navegacion, #81): una sola superficie de
 * navegacion primaria por ancho, derivada del breakpoint reactivo. La regla M3
 * "nunca navigation bar y rail simultaneos" es estructural: la funcion devuelve
 * UNA posicion; no existe un segundo componente de navegacion que montar.
 * La verificacion de montaje real por breakpoint es la QA Playwright del change.
 */
describe("getShellNavigationOptions", () => {
  it.each([
    [375, "mobile", "bottom", "uikit", "below-icon"],
    [767, "mobile", "bottom", "uikit", "below-icon"],
    [768, "tablet", "left", "material", "below-icon"],
    [1279, "tablet", "left", "material", "below-icon"],
    [1280, "desktop", "left", "material", "beside-icon"],
    [1920, "desktop", "left", "material", "beside-icon"],
  ] as const)(
    "a %s pt el breakpoint %s produce barra %s (%s, %s)",
    (width, breakpoint, position, variant, labelPosition) => {
      expect(getBreakpoint(width)).toBe(breakpoint);
      const options = getShellNavigationOptions(breakpoint, false);
      expect(options.tabBarPosition).toBe(position);
      expect(options.tabBarVariant).toBe(variant);
      expect(options.tabBarLabelPosition).toBe(labelPosition);
    }
  );

  it("la posicion es un valor unico: barra y rail no pueden coexistir", () => {
    for (const breakpoint of ["mobile", "tablet", "desktop"] as const) {
      const { tabBarPosition } = getShellNavigationOptions(breakpoint, false);
      expect(["bottom", "left"]).toContain(tabBarPosition);
    }
  });

  it("la variante material solo se usa con la barra lateral", () => {
    for (const breakpoint of ["mobile", "tablet", "desktop"] as const) {
      const options = getShellNavigationOptions(breakpoint, false);
      if (options.tabBarVariant === "material") {
        expect(options.tabBarPosition).toBe("left");
      }
    }
  });

  it("reduce-motion apaga la animacion de cambio de tab", () => {
    for (const breakpoint of ["mobile", "tablet", "desktop"] as const) {
      expect(getShellNavigationOptions(breakpoint, true).animation).toBe("none");
      expect(getShellNavigationOptions(breakpoint, false).animation).toBe("shift");
    }
  });
});
