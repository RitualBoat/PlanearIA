import React from "react";
import { fireEvent, render, screen } from "@testing-library/react-native";

import TerminosScreen from "../../screens/cuenta/TerminosScreen";

const mockGoBack = jest.fn();
let mockRouteParams: { tab?: "terminos" | "privacidad" | "licencias" } | undefined;

jest.mock("@react-navigation/native", () => {
  const actual = jest.requireActual("@react-navigation/native");
  return {
    ...actual,
    useNavigation: () => ({ goBack: mockGoBack }),
    useRoute: () => ({ params: mockRouteParams }),
  };
});

jest.mock("../../themes/useAppTheme", () => ({
  useAppTheme: () => ({
    colors: {
      background: "#ffffff",
      surface: "#ffffff",
      borderStrong: "#000000",
      borderLight: "#cccccc",
      text: "#111111",
      textSecondary: "#444444",
      primary: "#0057b8",
    },
    isDark: false,
    scaled: (value: number) => value,
    highContrast: false,
  }),
}));

jest.mock("@expo/vector-icons/MaterialIcons", () => "MaterialIcons");

describe("TerminosScreen y licencias de terceros", () => {
  beforeEach(() => {
    mockGoBack.mockClear();
    mockRouteParams = undefined;
  });

  it("preserva Terminos y Privacidad y permite abrir Licencias", () => {
    render(<TerminosScreen />);

    expect(screen.getByText(/TÉRMINOS Y CONDICIONES DE USO/)).toBeTruthy();
    fireEvent.press(screen.getByRole("tab", { name: "Aviso de Privacidad" }));
    expect(screen.getByText(/AVISO DE PRIVACIDAD INTEGRAL/)).toBeTruthy();
    fireEvent.press(screen.getByRole("tab", { name: "Licencias de terceros" }));
    expect(screen.getByText(/SheetJS Community Edition -- https:\/\/sheetjs.com\//)).toBeTruthy();
    expect(screen.getByText(/Copyright \(C\) 2012-present\s+SheetJS LLC/)).toBeTruthy();
  });

  it("respeta la pestaña inicial tipada y expone estado accesible", () => {
    mockRouteParams = { tab: "licencias" };
    render(<TerminosScreen />);

    const licensesTab = screen.getByRole("tab", { name: "Licencias de terceros" });
    expect(licensesTab.props.accessibilityState).toEqual({ selected: true });
    expect(screen.getByRole("tab", { name: "Términos y Condiciones" }).props.accessibilityState).toEqual({
      selected: false,
    });
    expect(screen.getByText(/Apache License, Version 2.0/)).toBeTruthy();
  });

  it("mantiene una salida accesible", () => {
    render(<TerminosScreen />);
    fireEvent.press(screen.getByRole("button", { name: "Volver" }));
    expect(mockGoBack).toHaveBeenCalledTimes(1);
  });
});
