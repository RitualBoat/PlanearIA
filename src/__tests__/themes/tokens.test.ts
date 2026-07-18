import { ReduceMotion } from "react-native-reanimated";

import { spacing } from "../../themes/spacing";
import { radii } from "../../themes/radii";
import { zIndex } from "../../themes/zIndex";
import { typography, scaleType, type TypeToken } from "../../themes/typography";
import { getElevation } from "../../themes/elevation";
import { duration, spring, timing, reduceMotionPolicy } from "../../themes/motion";
import { lightTheme, darkTheme } from "../../themes/colors";

describe("spacing", () => {
  it("los valores distintos de cero son multiplos de 4 (ritmo 4pt)", () => {
    Object.values(spacing)
      .filter((value) => value !== 0)
      .forEach((value) => expect(value % 4).toBe(0));
  });

  it("es una escala estrictamente ascendente", () => {
    const values = Object.values(spacing);
    for (let i = 1; i < values.length; i += 1) {
      expect(values[i]).toBeGreaterThan(values[i - 1]);
    }
  });
});

describe("radii", () => {
  it("incluye 8/12/16/pill", () => {
    expect(radii.sm).toBe(8);
    expect(radii.md).toBe(12);
    expect(radii.lg).toBe(16);
    expect(radii.pill).toBeGreaterThanOrEqual(999);
  });
});

describe("zIndex", () => {
  it("es estrictamente ascendente por rol de capa", () => {
    const order = [
      "base",
      "raised",
      "dropdown",
      "sticky",
      "banner",
      "overlay",
      "modal",
      "toast",
      "tooltip",
    ] as const;
    for (let i = 1; i < order.length; i += 1) {
      expect(zIndex[order[i]]).toBeGreaterThan(zIndex[order[i - 1]]);
    }
  });
});

describe("typography", () => {
  it("todos los tokens tienen fontSize y lineHeight positivos", () => {
    Object.values(typography).forEach((token) => {
      expect(token.fontSize).toBeGreaterThan(0);
      expect(token.lineHeight).toBeGreaterThan(0);
    });
  });
});

describe("scaleType", () => {
  const token: TypeToken = {
    fontSize: 20,
    lineHeight: 28,
    fontWeight: "600",
    letterSpacing: -0.5,
  };

  it("con factor 1 conserva los tamanos base", () => {
    const style = scaleType(token, (base) => Math.round(base * 1));
    expect(style.fontSize).toBe(20);
    expect(style.lineHeight).toBe(28);
  });

  it("con factor 1.4 multiplica fontSize y lineHeight, sin tocar peso ni interletrado", () => {
    const style = scaleType(token, (base) => Math.round(base * 1.4));
    expect(style.fontSize).toBe(28); // 20 * 1.4
    expect(style.lineHeight).toBe(39); // round(28 * 1.4 = 39.2)
    expect(style.fontWeight).toBe("600");
    expect(style.letterSpacing).toBe(-0.5);
  });

  it("omite letterSpacing cuando el token no lo define", () => {
    const style = scaleType(
      { fontSize: 15, lineHeight: 20, fontWeight: "400" },
      (base) => base
    );
    expect(style.letterSpacing).toBeUndefined();
  });
});

describe("getElevation", () => {
  it("difiere entre tema claro y oscuro (color de sombra del tema)", () => {
    const light = getElevation(lightTheme);
    const dark = getElevation(darkTheme);
    expect(light.level1.boxShadow).not.toBe(dark.level1.boxShadow);
  });

  it("los 3 niveles son distintos entre si", () => {
    const elevation = getElevation(lightTheme);
    const shadows = [
      elevation.level1.boxShadow,
      elevation.level2.boxShadow,
      elevation.level3.boxShadow,
    ];
    expect(new Set(shadows).size).toBe(3);
  });
});

describe("motion", () => {
  it("expone las duraciones base 150 y 250 ms", () => {
    expect(duration.fast).toBe(150);
    expect(duration.base).toBe(250);
  });

  it("los presets de spring tienen amortiguacion y rigidez positivas", () => {
    Object.values(spring).forEach((preset) => {
      expect(preset.damping).toBeGreaterThan(0);
      expect(preset.stiffness).toBeGreaterThan(0);
    });
  });

  it("la politica de reduce-motion por defecto es System", () => {
    expect(reduceMotionPolicy).toBe(ReduceMotion.System);
  });

  it("los presets de spring y timing honran la politica de reduce-motion", () => {
    Object.values(spring).forEach((preset) => {
      expect(preset.reduceMotion).toBe(ReduceMotion.System);
    });
    Object.values(timing).forEach((preset) => {
      expect(preset.reduceMotion).toBe(ReduceMotion.System);
    });
  });
});
