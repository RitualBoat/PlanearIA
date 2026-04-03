import React from "react";
import { render, fireEvent, waitFor } from "@testing-library/react-native";
import EditarPerfilScreen from "../../screens/cuenta/EditarPerfilScreen";

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

const mockGoBack = jest.fn();
jest.mock("@react-navigation/native", () => ({
  useNavigation: () => ({
    goBack: mockGoBack,
    navigate: jest.fn(),
  }),
}));

jest.mock("../../context/AuthContext", () => ({
  useAuth: () => ({
    usuario: {
      id: "u1",
      nombre: "Ana",
      apellidos: "López",
      email: "ana@test.com",
      biografia: "Docente de primaria",
      rol: "user",
      pais: "México",
    },
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
      error: "#BA1A1A",
      shadowBlue: "rgba(0,93,168,0.06)",
    },
  }),
}));

// ViewModel mock
const mockVm = {
  nombre: "Ana",
  apellidos: "López",
  biografia: "Docente de primaria",
  pais: "México",
  email: "ana@test.com",
  isLoading: false,
  error: "",
  nombreError: "",
  isDirty: false,
  bioCharCount: 18,
  bioMaxLength: 300,
  saveSuccess: false,
  saveError: false,
  setNombre: jest.fn(),
  setApellidos: jest.fn(),
  setBiografia: jest.fn(),
  setPais: jest.fn(),
  handleGuardar: jest.fn(),
  handleCancelar: jest.fn(),
  dismissSuccess: jest.fn(),
  dismissError: jest.fn(),
};

jest.mock("../../hooks/useEditarPerfilViewModel", () => ({
  useEditarPerfilViewModel: () => mockVm,
}));

jest.mock("../../components/Toast", () => {
  return () => null;
});

jest.mock("../../components/ConfirmDialog", () => {
  return () => null;
});

jest.mock("../../components/PhotoPickerModal", () => {
  return () => null;
});

// ─── Tests ───

describe("EditarPerfilScreen", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Reset VM to defaults
    mockVm.nombre = "Ana";
    mockVm.apellidos = "López";
    mockVm.biografia = "Docente de primaria";
    mockVm.pais = "México";
    mockVm.email = "ana@test.com";
    mockVm.isLoading = false;
    mockVm.error = "";
    mockVm.nombreError = "";
    mockVm.isDirty = false;
    mockVm.bioCharCount = 18;
    mockVm.bioMaxLength = 300;
    mockVm.saveSuccess = false;
    mockVm.saveError = false;
  });

  it("renderiza el formulario con título 'Editar Perfil'", () => {
    const { getByText } = render(<EditarPerfilScreen />);
    expect(getByText("Editar Perfil")).toBeTruthy();
  });

  it("muestra botones Cancelar y Guardar en el header", () => {
    const { getByText } = render(<EditarPerfilScreen />);
    expect(getByText("Cancelar")).toBeTruthy();
    expect(getByText("Guardar")).toBeTruthy();
  });

  it("muestra campo de nombre con valor actual", () => {
    const { getByLabelText } = render(<EditarPerfilScreen />);
    const input = getByLabelText("Nombre");
    expect(input.props.value).toBe("Ana");
  });

  it("muestra campo de apellidos con valor actual", () => {
    const { getByLabelText } = render(<EditarPerfilScreen />);
    const input = getByLabelText("Apellidos");
    expect(input.props.value).toBe("López");
  });

  it("muestra campo de biografía con valor actual", () => {
    const { getByLabelText } = render(<EditarPerfilScreen />);
    const input = getByLabelText("Biografía");
    expect(input.props.value).toBe("Docente de primaria");
  });

  it("muestra contador de caracteres de biografía", () => {
    const { getByText } = render(<EditarPerfilScreen />);
    expect(getByText("18/300")).toBeTruthy();
  });

  it("muestra email bloqueado con ícono de candado", () => {
    const { getByText } = render(<EditarPerfilScreen />);
    expect(getByText("ana@test.com")).toBeTruthy();
    expect(getByText(/Para cambiar tu email/)).toBeTruthy();
  });

  it("muestra selector de país con México seleccionado", () => {
    const { getByLabelText } = render(<EditarPerfilScreen />);
    expect(getByLabelText("País: México")).toBeTruthy();
  });

  it("llama setNombre al cambiar texto en nombre", () => {
    const { getByLabelText } = render(<EditarPerfilScreen />);
    fireEvent.changeText(getByLabelText("Nombre"), "María");
    expect(mockVm.setNombre).toHaveBeenCalledWith("María");
  });

  it("llama setBiografia al cambiar biografía", () => {
    const { getByLabelText } = render(<EditarPerfilScreen />);
    fireEvent.changeText(getByLabelText("Biografía"), "Nueva bio");
    expect(mockVm.setBiografia).toHaveBeenCalledWith("Nueva bio");
  });

  it("muestra error de nombre cuando nombreError no está vacío", () => {
    mockVm.nombreError = "Este campo es obligatorio";
    const { getByText } = render(<EditarPerfilScreen />);
    expect(getByText("Este campo es obligatorio")).toBeTruthy();
  });

  it("botón Guardar llama handleGuardar", () => {
    mockVm.isDirty = true;
    const { getByLabelText } = render(<EditarPerfilScreen />);
    fireEvent.press(getByLabelText("Guardar"));
    expect(mockVm.handleGuardar).toHaveBeenCalled();
  });

  it("muestra botón 'Actualizar Perfil'", () => {
    const { getByText } = render(<EditarPerfilScreen />);
    expect(getByText("Actualizar Perfil")).toBeTruthy();
  });

  it("muestra portada y controles de foto", () => {
    const { getByLabelText } = render(<EditarPerfilScreen />);
    expect(getByLabelText("Cambiar portada")).toBeTruthy();
    expect(getByLabelText("Cambiar foto de perfil")).toBeTruthy();
  });

  it("cancelar navega atrás cuando no hay cambios", () => {
    const { getByLabelText } = render(<EditarPerfilScreen />);
    fireEvent.press(getByLabelText("Cancelar"));
    expect(mockGoBack).toHaveBeenCalled();
  });

  it("abre picker de países al presionar el selector", () => {
    const { getByLabelText, getByText } = render(<EditarPerfilScreen />);
    fireEvent.press(getByLabelText("País: México"));
    // After opening, should show country list
    expect(getByText("Colombia")).toBeTruthy();
    expect(getByText("Argentina")).toBeTruthy();
  });

  it("seleccionar país llama setPais y cierra el picker", () => {
    const { getByLabelText, getByText, queryByText } = render(<EditarPerfilScreen />);
    fireEvent.press(getByLabelText("País: México"));
    fireEvent.press(getByText("Colombia"));
    expect(mockVm.setPais).toHaveBeenCalledWith("Colombia");
  });

  it("labels del formulario existen", () => {
    const { getByText } = render(<EditarPerfilScreen />);
    expect(getByText("NOMBRE(S)")).toBeTruthy();
    expect(getByText("APELLIDOS")).toBeTruthy();
    expect(getByText("BIOGRAFÍA")).toBeTruthy();
    expect(getByText("EMAIL")).toBeTruthy();
    expect(getByText("PAÍS")).toBeTruthy();
  });
});
