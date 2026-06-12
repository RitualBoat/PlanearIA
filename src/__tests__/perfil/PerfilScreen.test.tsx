import React from "react";
import { render, fireEvent, waitFor } from "@testing-library/react-native";
import PerfilScreen from "../../screens/perfil/PerfilScreen";

// ─── Mocks ───

jest.mock("@expo/vector-icons/MaterialIcons", () => "MaterialIcons");

jest.mock("expo-linear-gradient", () => ({
  LinearGradient: ({ children, style, testID }: any) => {
    const React = require("react");
    return React.createElement("View", { style, testID }, children);
  },
}));

jest.mock("react-native-safe-area-context", () => ({
  SafeAreaView: ({ children }: any) => children,
}));

const mockNavigate = jest.fn();
const mockGoBack = jest.fn();
jest.mock("@react-navigation/native", () => ({
  useNavigation: () => ({
    navigate: mockNavigate,
    goBack: mockGoBack,
  }),
}));

// Auth mock — configurable
let mockAuthReturn: any = {
  usuario: {
    id: "u1",
    nombre: "Ana",
    apellidos: "López",
    email: "ana@test.com",
    biografia: "Docente de primaria",
    rol: "docente",
    pais: "México",
    fechaCreacion: new Date("2024-01-15").toISOString(),
  },
  isGuest: false,
};
jest.mock("../../context/AuthContext", () => ({
  useAuth: () => mockAuthReturn,
}));

jest.mock("../../context/PlaneacionesContext", () => ({
  usePlaneaciones: () => ({
    planeaciones: [{ temaSesion: "Fracciones", nivel: "Primaria" }],
  }),
}));

jest.mock("../../context/GruposContext", () => ({
  useGruposContext: () => ({
    grupos: [{ nombre: "3ro A", alumnos: [{ id: "a1" }] }],
  }),
}));

jest.mock("../../context/RecursosContext", () => ({
  useRecursos: () => ({
    recursos: [{ titulo: "Guía de Mate" }],
  }),
}));

jest.mock("../../context/ThemeContext", () => ({
  useTheme: () => ({
    theme: "light",
    isDark: false,
    colors: {
      primary: "#1676D2",
      background: "#EEF3FA",
      surfaceContainerLowest: "#FFFFFF",
      surfaceContainerLow: "#f1f4f8",
      surfaceContainer: "#ebeef2",
      surfaceContainerHigh: "#e3e8ef",
      onSurface: "#181c1f",
      onSurfaceVariant: "#43474e",
      outlineVariant: "#c0c7d4",
      primaryContainer: "#0576d2",
      secondaryContainer: "#d6e3f7",
      error: "#BA1A1A",
      shadowBlue: "rgba(0,93,168,0.06)",
    },
  }),
}));

jest.mock("../../components/Toast", () => {
  return () => null;
});

jest.mock("../../components/ExpandedStatsModal", () => {
  return () => null;
});

// ─── Tests ───

describe("PerfilScreen", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Reset auth to authenticated user
    mockAuthReturn = {
      usuario: {
        id: "u1",
        nombre: "Ana",
        apellidos: "López",
        email: "ana@test.com",
        biografia: "Docente de primaria",
        rol: "docente",
        pais: "México",
        fechaCreacion: new Date("2024-01-15").toISOString(),
      },
      isGuest: false,
    };
  });

  it("muestra título 'Mi Perfil' después de cargar (autenticado)", async () => {
    const { findAllByText } = render(<PerfilScreen />);
    const titles = await findAllByText("Mi Perfil");
    expect(titles.length).toBeGreaterThan(0);
  });

  it("muestra nombre del usuario autenticado", async () => {
    const { findByText } = render(<PerfilScreen />);
    expect(await findByText("Ana López")).toBeTruthy();
  });

  it("muestra email del usuario", async () => {
    const { findByText } = render(<PerfilScreen />);
    expect(await findByText("ana@test.com")).toBeTruthy();
  });

  it("muestra biografía del usuario", async () => {
    const { findByText } = render(<PerfilScreen />);
    expect(await findByText("Docente de primaria")).toBeTruthy();
  });

  it("muestra chip de rol 'Docente'", async () => {
    const { findByText } = render(<PerfilScreen />);
    expect(await findByText("Docente")).toBeTruthy();
  });

  it("muestra estadísticas", async () => {
    const { findByText } = render(<PerfilScreen />);
    expect(await findByText("PLANEACIONES")).toBeTruthy();
    expect(await findByText("GRUPOS")).toBeTruthy();
    expect(await findByText("RECURSOS")).toBeTruthy();
  });

  it("muestra botones de editar perfil y compartir", async () => {
    const { findByText } = render(<PerfilScreen />);
    expect(await findByText("Editar perfil")).toBeTruthy();
    expect(await findByText("Compartir perfil")).toBeTruthy();
  });

  it("navega a EditarPerfil al presionar 'Editar perfil'", async () => {
    const { findByText } = render(<PerfilScreen />);
    fireEvent.press(await findByText("Editar perfil"));
    expect(mockNavigate).toHaveBeenCalledWith("EditarPerfil");
  });

  // ─── Guest State ───
  describe("estado invitado", () => {
    beforeEach(() => {
      mockAuthReturn = {
        usuario: null,
        isGuest: true,
      };
    });

    it("muestra título 'Mi Perfil' para invitados", async () => {
      const { findAllByText } = render(<PerfilScreen />);
      const titles = await findAllByText("Mi Perfil");
      expect(titles.length).toBeGreaterThan(0);
    });

    it("muestra 'Invitado' como nombre", async () => {
      const { findAllByText } = render(<PerfilScreen />);
      const invitado = await findAllByText("Invitado");
      expect(invitado.length).toBeGreaterThan(0);
    });

    it("muestra CTA 'Estás navegando como invitado'", async () => {
      const { findByText } = render(<PerfilScreen />);
      expect(await findByText("Estás navegando como invitado")).toBeTruthy();
    });

    it("muestra botón 'Crear cuenta gratis'", async () => {
      const { findByText } = render(<PerfilScreen />);
      expect(await findByText("Crear cuenta gratis")).toBeTruthy();
    });

    it("navega a Registro al presionar 'Crear cuenta gratis'", async () => {
      const { findByText } = render(<PerfilScreen />);
      fireEvent.press(await findByText("Crear cuenta gratis"));
      expect(mockNavigate).toHaveBeenCalledWith("Registro");
    });

    it("muestra link 'Ya tengo cuenta'", async () => {
      const { findByText } = render(<PerfilScreen />);
      expect(await findByText(/Ya tengo cuenta/)).toBeTruthy();
    });

    it("navega a Login al presionar link de iniciar sesión", async () => {
      const { findByText } = render(<PerfilScreen />);
      fireEvent.press(await findByText(/Ya tengo cuenta/));
      expect(mockNavigate).toHaveBeenCalledWith("Login");
    });

    it("muestra sección de actividad vacía", async () => {
      const { findByText } = render(<PerfilScreen />);
      expect(await findByText("ACTIVIDAD RECIENTE")).toBeTruthy();
      expect(await findByText("Aún no tienes actividad")).toBeTruthy();
    });
  });

  // ─── Activity timeline ───
  it("muestra actividad reciente con planeaciones", async () => {
    const { findByText } = render(<PerfilScreen />);
    expect(await findByText("ACTIVIDAD RECIENTE")).toBeTruthy();
    expect(await findByText("Fracciones")).toBeTruthy();
  });
});
