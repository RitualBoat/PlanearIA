import React from "react";
import { fireEvent, render } from "@testing-library/react-native";
import OnboardingScreen from "../../screens/onboarding/OnboardingScreen";

// ─── Mocks ───

jest.mock("@expo/vector-icons", () => ({
  MaterialIcons: "MaterialIcons",
}));
jest.mock("@expo/vector-icons/MaterialIcons", () => "MaterialIcons");

jest.mock("react-native-safe-area-context", () => {
  const React = require("react");
  return {
    SafeAreaView: ({ children }: { children: React.ReactNode }) => children,
  };
});

jest.mock("expo-linear-gradient", () => {
  const React = require("react");
  return {
    LinearGradient: ({ children, style, testID }: any) =>
      React.createElement("View", { style, testID }, children),
  };
});

const mockReplace = jest.fn();
jest.mock("@react-navigation/native", () => ({
  useNavigation: () => ({ replace: mockReplace }),
}));

const mockSetItem = jest.fn();
jest.mock("@react-native-async-storage/async-storage", () => ({
  setItem: (...args: any[]) => {
    mockSetItem(...args);
    return Promise.resolve();
  },
  getItem: jest.fn().mockResolvedValue(null),
}));

const mockLoginComoInvitado = jest.fn().mockResolvedValue(undefined);
jest.mock("../../context/AuthContext", () => ({
  useAuth: () => ({
    loginComoInvitado: mockLoginComoInvitado,
  }),
}));

beforeEach(() => {
  jest.clearAllMocks();
});

// ─── Tests ───

describe("OnboardingScreen", () => {
  it("renderiza el primer slide correctamente", () => {
    const { getByText } = render(<OnboardingScreen />);
    expect(getByText("Planea con Inteligencia Artificial")).toBeTruthy();
    expect(getByText(/planeaciones didácticas/)).toBeTruthy();
  });

  it("muestra el header con PlanearIA", () => {
    const { getByText } = render(<OnboardingScreen />);
    expect(getByText("PlanearIA")).toBeTruthy();
  });

  it("muestra el botón Saltar en el primer slide", () => {
    const { getByText } = render(<OnboardingScreen />);
    expect(getByText("Saltar")).toBeTruthy();
  });

  it("muestra el botón Siguiente", () => {
    const { getByText } = render(<OnboardingScreen />);
    expect(getByText("Siguiente")).toBeTruthy();
  });

  it("renderiza los 4 indicadores de punto", () => {
    const { getAllByRole } = render(<OnboardingScreen />);
    const dots = getAllByRole("button").filter((b) =>
      b.props.accessibilityLabel?.startsWith("Ir a diapositiva")
    );
    expect(dots.length).toBe(4);
  });

  it("al tocar Saltar, navega a MainTabs", async () => {
    const { getByText } = render(<OnboardingScreen />);
    fireEvent.press(getByText("Saltar"));
    await new Promise((r) => setTimeout(r, 50));
    expect(mockSetItem).toHaveBeenCalledWith("HAS_SEEN_ONBOARDING", "true");
    expect(mockLoginComoInvitado).toHaveBeenCalled();
    expect(mockReplace).toHaveBeenCalledWith("MainTabs");
  });

  it("renderiza los 4 slides con títulos correctos", () => {
    const { getByText } = render(<OnboardingScreen />);
    expect(getByText("Planea con Inteligencia Artificial")).toBeTruthy();
    expect(getByText("Gestiona tus Grupos")).toBeTruthy();
    expect(getByText("Recursos y Plantillas")).toBeTruthy();
    expect(getByText("Colabora con otros Docentes")).toBeTruthy();
  });

  it("el botón de acción tiene accessibilityLabel", () => {
    const { getByLabelText } = render(<OnboardingScreen />);
    expect(getByLabelText("Siguiente diapositiva")).toBeTruthy();
  });

  it("el botón Saltar tiene accessibilityLabel", () => {
    const { getByLabelText } = render(<OnboardingScreen />);
    expect(getByLabelText("Saltar introducción")).toBeTruthy();
  });
});
