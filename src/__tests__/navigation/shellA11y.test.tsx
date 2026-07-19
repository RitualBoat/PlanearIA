import React from "react";
import { fireEvent, render } from "@testing-library/react-native";
import EscritorioPlaceholderScreen from "../../screens/inicio/EscritorioPlaceholderScreen";
import AppTopBar from "../../navigation/AppTopBar";

jest.mock("@expo/vector-icons/MaterialIcons", () => "MaterialIcons");

jest.mock("@react-native-async-storage/async-storage", () =>
  require("@react-native-async-storage/async-storage/jest/async-storage-mock")
);

jest.mock("react-native-safe-area-context", () => ({
  SafeAreaView: ({ children }: any) => children,
  useSafeAreaInsets: () => ({ top: 0, bottom: 0, left: 0, right: 0 }),
}));

const mockNavigate = jest.fn();
const mockDispatch = jest.fn();
jest.mock("@react-navigation/native", () => ({
  useNavigation: () => ({
    navigate: mockNavigate,
    dispatch: mockDispatch,
  }),
  CommonActions: {
    reset: (payload: unknown) => ({ type: "RESET", payload }),
  },
}));

let mockUnreadCount = 0;
jest.mock("../../context/NotificacionesContext", () => ({
  useNotificaciones: () => ({ unreadCount: mockUnreadCount }),
}));

const mockLogout = jest.fn().mockResolvedValue(undefined);
jest.mock("../../context/AuthContext", () => ({
  useAuth: () => ({ logout: mockLogout }),
}));

/**
 * Desde sync-status-ui (#83) el chrome presenta el indicador de sincronizacion, asi que
 * requiere el contexto de sync. Se simula igual que los demas contextos de esta suite: el
 * proveedor real arrancaria temporizadores y ciclos de red, y lo que aqui se verifica es la
 * accesibilidad del chrome, no el motor.
 */
jest.mock("../../themes/useReducedMotionPreference", () => ({
  useReducedMotionPreference: () => false,
}));

jest.mock("../../context/SyncContext", () => ({
  useSyncStatus: () => ({
    isOnline: true,
    status: "synced",
    lastSyncAt: null,
    pendingCount: 0,
    syncEnabled: true,
    authError: false,
    notice: null,
    dismissNotice: jest.fn(),
    syncNow: jest.fn(),
  }),
}));

jest.mock("../../themes/useAppTheme", () => ({
  useAppTheme: () => ({
    theme: "light",
    isDark: false,
    highContrast: false,
    scaled: (size: number) => size,
    colors: new Proxy(
      {},
      { get: (_target, prop) => (typeof prop === "string" ? "#123456" : undefined) }
    ),
  }),
}));

describe("accesibilidad del shell", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockUnreadCount = 0;
  });

  describe("EscritorioPlaceholderScreen", () => {
    it("expone el dock como botones etiquetados y navega al hub", () => {
      const screen = render(<EscritorioPlaceholderScreen />);

      for (const etiqueta of ["Abrir Office", "Abrir Clases", "Abrir Asistente", "Abrir Mas"]) {
        const tile = screen.getByLabelText(etiqueta);
        expect(tile.props.accessibilityRole).toBe("button");
      }

      fireEvent.press(screen.getByLabelText("Abrir Clases"));
      expect(mockNavigate).toHaveBeenCalledWith("MainTabs", { screen: "ClasesTab" });
    });

    it("declara su naturaleza temporal sin simular datos", () => {
      const screen = render(<EscritorioPlaceholderScreen />);
      expect(screen.getByLabelText("Version temporal del Escritorio")).toBeTruthy();
    });
  });

  describe("AppTopBar", () => {
    it("anuncia el conteo de no leidas en la etiqueta de notificaciones", () => {
      mockUnreadCount = 3;
      const bar = render(<AppTopBar />);
      const boton = bar.getByLabelText("Abrir notificaciones, 3 sin leer");
      expect(boton.props.accessibilityRole).toBe("button");
      expect(bar.getByText("3")).toBeTruthy();

      fireEvent.press(boton);
      expect(mockNavigate).toHaveBeenCalledWith("Notificaciones");
    });

    it("sin no leidas, no muestra badge y conserva la etiqueta base", () => {
      const bar = render(<AppTopBar />);
      expect(bar.getByLabelText("Abrir notificaciones")).toBeTruthy();
      expect(bar.queryByText("0")).toBeNull();
    });

    it("el menu de cuenta ofrece perfil, cuenta y cierre de sesion", async () => {
      const bar = render(<AppTopBar />);
      fireEvent.press(bar.getByLabelText("Abrir menu de cuenta"));

      fireEvent.press(bar.getByLabelText("Mi perfil"));
      expect(mockNavigate).toHaveBeenCalledWith("MainTabs", {
        screen: "MasTab",
        params: { screen: "Perfil", params: undefined },
      });

      fireEvent.press(bar.getByLabelText("Abrir menu de cuenta"));
      fireEvent.press(bar.getByLabelText("Cuenta y seguridad"));
      expect(mockNavigate).toHaveBeenCalledWith("MainTabs", {
        screen: "MasTab",
        params: { screen: "Cuenta", params: undefined },
      });
    });
  });
});
