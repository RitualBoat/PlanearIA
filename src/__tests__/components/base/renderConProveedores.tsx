import React from "react";
import { render } from "@testing-library/react-native";
import type { RenderResult } from "@testing-library/react-native";
import { ThemeProvider } from "../../../context/ThemeContext";
import { FontSizeProvider } from "../../../context/FontSizeContext";
import { DaltonismoProvider } from "../../../context/DaltonismoContext";
import { AccessibilityPreferencesProvider } from "../../../context/AccessibilityPreferencesContext";

/**
 * Monta un componente de la biblioteca base con los cuatro proveedores que `useAppTheme`
 * compone.
 *
 * Sin los cuatro, el hook lanza: los componentes base no tienen fallback a color estatico
 * a proposito, y esa ausencia es justo lo que garantiza que reaccionen al tema. Este
 * helper evita repetir el anidado en cada suite.
 */
const Proveedores: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <ThemeProvider>
    <FontSizeProvider>
      <DaltonismoProvider>
        <AccessibilityPreferencesProvider>{children}</AccessibilityPreferencesProvider>
      </DaltonismoProvider>
    </FontSizeProvider>
  </ThemeProvider>
);

export function renderConProveedores(ui: React.ReactElement): RenderResult {
  // Se pasa como `wrapper` y no como arbol envolvente: asi el `rerender` que devuelve RTL
  // vuelve a montar dentro de los proveedores. Envolver a mano los pierde en el rerender.
  return render(ui, { wrapper: Proveedores });
}

/** Aplana el estilo que RN entrega como arreglo anidado, para poder afirmar sobre el. */
export function estiloPlano(style: unknown): Record<string, unknown> {
  if (Array.isArray(style)) {
    return style.reduce<Record<string, unknown>>(
      (acumulado, parte) => ({ ...acumulado, ...estiloPlano(parte) }),
      {}
    );
  }
  if (style && typeof style === "object") return style as Record<string, unknown>;
  return {};
}
