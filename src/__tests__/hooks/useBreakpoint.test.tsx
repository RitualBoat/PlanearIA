import { renderHook } from "@testing-library/react-native";

import {
  BREAKPOINTS,
  getBreakpoint,
  resolveResponsive,
  useBreakpoint,
} from "../../hooks/useBreakpoint";

// `useBreakpoint` es solo un envoltorio reactivo sobre `useWindowDimensions`; para
// probar la reactividad controlamos el valor que ese hook devuelve entre renders.
// Se preserva el resto de react-native (View, etc.) para no romper el render de pruebas.
const mockDimensions = { width: 375, height: 812, scale: 2, fontScale: 1 };

jest.mock("react-native", () => {
  const actual = jest.requireActual("react-native");
  return new Proxy(actual, {
    get(target, prop) {
      if (prop === "useWindowDimensions") return () => mockDimensions;
      return target[prop];
    },
  });
});

function setDimensions(next: Partial<typeof mockDimensions>) {
  Object.assign(mockDimensions, next);
}

beforeEach(() => {
  setDimensions({ width: 375, height: 812, scale: 2, fontScale: 1 });
});

describe("getBreakpoint", () => {
  it("clasifica los limites exactos de cada rango", () => {
    expect(getBreakpoint(0)).toBe("mobile");
    expect(getBreakpoint(767)).toBe("mobile");
    expect(getBreakpoint(BREAKPOINTS.tablet)).toBe("tablet"); // 768
    expect(getBreakpoint(1279)).toBe("tablet");
    expect(getBreakpoint(BREAKPOINTS.desktop)).toBe("desktop"); // 1280
    expect(getBreakpoint(3840)).toBe("desktop");
  });
});

describe("resolveResponsive", () => {
  it("elige el valor del rango activo", () => {
    expect(resolveResponsive("mobile", 120, 140, 160)).toBe(120);
    expect(resolveResponsive("tablet", 120, 140, 160)).toBe(140);
    expect(resolveResponsive("desktop", 120, 140, 160)).toBe(160);
  });

  it("cae a tablet cuando se omite el valor de escritorio", () => {
    expect(resolveResponsive("desktop", 120, 140)).toBe(140);
  });

  it("no es de solo numeros: sirve para cualquier valor de estilo", () => {
    expect(resolveResponsive("desktop", "row", "row", "column")).toBe("column");
  });
});

describe("useBreakpoint", () => {
  it("deriva el rango y los flags del ancho vigente", () => {
    setDimensions({ width: 1024, height: 768, fontScale: 1 });
    const { result } = renderHook(() => useBreakpoint());

    expect(result.current.width).toBe(1024);
    expect(result.current.breakpoint).toBe("tablet");
    expect(result.current.isTablet).toBe(true);
    expect(result.current.isMobile).toBe(false);
    expect(result.current.isDesktop).toBe(false);
  });

  it("reacciona a un cambio de ancho: el rango cambia sin recargar", () => {
    setDimensions({ width: 375 });
    const { result, rerender } = renderHook(() => useBreakpoint());
    expect(result.current.breakpoint).toBe("mobile");

    // Simula un resize a escritorio: la fuente reactiva refleja el nuevo rango.
    setDimensions({ width: 1440 });
    rerender({});

    expect(result.current.width).toBe(1440);
    expect(result.current.breakpoint).toBe("desktop");
    expect(result.current.isDesktop).toBe(true);
  });

  it("expone fontScale para coordinar con el tamano de fuente", () => {
    setDimensions({ width: 768, fontScale: 1.5 });
    const { result } = renderHook(() => useBreakpoint());
    expect(result.current.fontScale).toBe(1.5);
  });
});

describe("fabrica de estilos memoizada por bucket", () => {
  // Modela como una fabrica themeada consumiria el breakpoint: produce valores
  // distintos por rango. La memoizacion por bucket (no por ancho crudo) la hace
  // el consumidor con useMemo([breakpoint]); aqui verificamos que el mismo rango
  // produce el mismo resultado y rangos distintos difieren.
  const getStyles = (breakpoint: "mobile" | "tablet" | "desktop") => ({
    gap: resolveResponsive(breakpoint, 8, 12, 16),
  });

  it("produce valores distintos por rango y estables dentro del rango", () => {
    expect(getStyles("mobile").gap).toBe(8);
    expect(getStyles("desktop").gap).toBe(16);
    expect(getStyles("tablet")).toEqual(getStyles("tablet"));
  });
});
