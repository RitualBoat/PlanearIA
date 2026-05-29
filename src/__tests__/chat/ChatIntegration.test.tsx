import React from "react";
import { render, fireEvent, waitFor } from "@testing-library/react-native";
import { Alert } from "react-native";
import ConversacionScreen from "../../screens/chat/ConversacionScreen";

jest.mock("@expo/vector-icons/MaterialIcons", () => "MaterialIcons");

jest.mock("react-native-safe-area-context", () => ({
  SafeAreaView: ({ children }: any) => children,
}));

const mockNavigate = jest.fn();
const mockGoBack = jest.fn();
const mockParams = { conversacionId: 1 };
jest.mock("@react-navigation/native", () => ({
  useNavigation: () => ({
    navigate: mockNavigate,
    goBack: mockGoBack,
    addListener: jest.fn(),
  }),
  useRoute: () => ({
    params: mockParams,
  }),
}));

const mockAgregarPlaneacion = jest.fn().mockResolvedValue(undefined);
jest.mock("../../context/PlaneacionesContext", () => ({
  usePlaneaciones: () => ({
    planeaciones: [],
    agregarPlaneacion: mockAgregarPlaneacion,
  }),
}));

const mockCrearRecurso = jest.fn().mockResolvedValue({ recurso: { id: 42 }, syncOk: true });
jest.mock("../../context/RecursosContext", () => ({
  useRecursos: () => ({
    recursos: [],
    crearRecurso: mockCrearRecurso,
  }),
}));

const mockGrupos = [
  { id: 1, nombre: "Grupo de Prueba A", carrera: "Primaria", semestre: 1 },
  { id: 2, nombre: "Grupo de Prueba B", carrera: "Secundaria", semestre: 2 },
];
jest.mock("../../context/GruposContext", () => ({
  useGruposContext: () => ({
    grupos: mockGrupos,
  }),
}));

const mockAsignarRecursosAGrupo = jest.fn().mockResolvedValue(1);
jest.mock("../../services/grupoAsignacionesService", () => ({
  asignarRecursosAGrupo: (...args: any[]) => mockAsignarRecursosAGrupo(...args),
}));

// Mock MensajesContext
const mockMensajes = [
  {
    id: 101,
    conversacionId: 1,
    remitenteId: "user-other",
    contenido: "Hola, te comparto esta planeación didáctica.",
    tipo: "planeacion" as const,
    estado: "entregado" as const,
    fechaCreacion: new Date().toISOString(),
    planeacion: {
      planeacionId: "plan-mock-1",
      titulo: "Fracciones Decimales Avanzadas",
      materia: "Matemáticas",
      grado: "5to",
    },
  },
  {
    id: 102,
    conversacionId: 1,
    remitenteId: "user-other",
    contenido: "Y también este recurso de apoyo didáctico.",
    tipo: "recurso" as const,
    estado: "entregado" as const,
    fechaCreacion: new Date().toISOString(),
    recurso: {
      recursoId: 202,
      titulo: "Ejercicios de Fracciones",
      tipo: "documento",
      formato: "pdf",
    },
  },
];

const mockConversacion = {
  id: 1,
  participantes: ["user-current", "user-other"],
  contactoId: 10,
  contactoNombre: "Prof. Laura Gómez",
  contactoColor: "#4A90D9",
  contactoEnLinea: true,
  fechaCreacion: new Date().toISOString(),
  fechaModificacion: new Date().toISOString(),
};

const mockMensajesContext = {
  conversaciones: [mockConversacion],
  mensajes: mockMensajes,
  isLoading: false,
  error: null,
  getConversacion: jest.fn(() => mockConversacion),
  getMensajesDeConversacion: jest.fn(() => mockMensajes),
  enviarMensaje: jest.fn(),
  marcarComoLeido: jest.fn(),
  eliminarConversacion: jest.fn(),
  reintentarMensaje: jest.fn(),
};

jest.mock("../../context/MensajesContext", () => ({
  useMensajes: () => mockMensajesContext,
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
      success: "#2E7D32",
      shadowBlue: "rgba(0,93,168,0.06)",
    },
  }),
}));

describe("ChatIntegration - Cross-Functional Integration Tests", () => {
  let alertSpy: jest.SpyInstance;

  beforeEach(() => {
    jest.clearAllMocks();
    alertSpy = jest.spyOn(Alert, "alert").mockImplementation(jest.fn());
  });

  afterEach(() => {
    alertSpy.mockRestore();
  });

  it("renderiza la pantalla de conversación y los mensajes compartidos", () => {
    const { getByText } = render(<ConversacionScreen />);

    // Header de conversación
    expect(getByText("Prof. Laura Gómez")).toBeTruthy();

    // Mensajes e información compartida
    expect(getByText("Fracciones Decimales Avanzadas")).toBeTruthy();
    expect(getByText("Ejercicios de Fracciones")).toBeTruthy();
  });

  it("permite añadir una planeación compartida a la biblioteca personal", async () => {
    const { getAllByText } = render(<ConversacionScreen />);

    // Buscar botón de añadir a biblioteca (para la planeación, que está renderizada)
    const addButtons = getAllByText("Añadir a mi biblioteca");
    expect(addButtons.length).toBeGreaterThan(0);

    // Presionamos el primero (que corresponde a la planeación)
    fireEvent.press(addButtons[0]);

    await waitFor(() => {
      expect(mockAgregarPlaneacion).toHaveBeenCalledWith(
        expect.objectContaining({
          id: "plan-mock-1",
          temaSesion: "Fracciones Decimales Avanzadas",
          asignatura: "Matemáticas",
        })
      );
      expect(alertSpy).toHaveBeenCalledWith("Añadido", "La planeación se agregó a tu biblioteca.");
    });
  });

  it("permite añadir un recurso compartido a la biblioteca personal", async () => {
    const { getAllByText } = render(<ConversacionScreen />);

    // Buscar botón de añadir a biblioteca
    const addButtons = getAllByText("Añadir a mi biblioteca");
    // Presionamos el segundo (que corresponde al recurso)
    fireEvent.press(addButtons[1]);

    await waitFor(() => {
      expect(mockCrearRecurso).toHaveBeenCalledWith(
        expect.objectContaining({
          titulo: "Ejercicios de Fracciones",
          tags: ["compartido"],
        })
      );
      expect(alertSpy).toHaveBeenCalledWith("Añadido", "El recurso se agregó a tu biblioteca.");
    });
  });

  it("permite asignar un recurso compartido del chat a un grupo escolar", async () => {
    const { getAllByText, getByText } = render(<ConversacionScreen />);

    // Buscamos los botones de asignar a grupo
    const assignButtons = getAllByText("Asignar a Grupo");
    expect(assignButtons.length).toBeGreaterThan(0);

    // Presionamos el botón de asignar en el recurso (segundo botón)
    fireEvent.press(assignButtons[1]);

    // Debe abrirse el selector de grupo modal y listar los grupos
    await waitFor(() => {
      expect(getByText("Grupo de Prueba A")).toBeTruthy();
      expect(getByText("Grupo de Prueba B")).toBeTruthy();
    });

    // Seleccionamos un grupo
    fireEvent.press(getByText("Grupo de Prueba A"));

    // Se debe llamar a crearRecurso y luego asignarRecursosAGrupo(1, [42])
    await waitFor(() => {
      expect(mockCrearRecurso).toHaveBeenCalled();
      expect(mockAsignarRecursosAGrupo).toHaveBeenCalledWith(1, [42]);
      expect(alertSpy).toHaveBeenCalledWith(
        "Éxito",
        "El recurso fue añadido a la biblioteca y asignado al grupo."
      );
    });
  });
});
