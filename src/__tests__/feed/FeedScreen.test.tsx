import React from "react";
import { render, fireEvent } from "@testing-library/react-native";
import FeedScreen from "../../screens/feed/FeedScreen";

jest.mock("@expo/vector-icons/MaterialIcons", () => "MaterialIcons");

jest.mock("expo-linear-gradient", () => ({
  LinearGradient: ({ children }: any) => children,
}));

jest.mock("react-native-safe-area-context", () => ({
  SafeAreaView: ({ children }: any) => children,
}));

jest.mock("@react-navigation/native", () => ({
  useNavigation: () => ({ navigate: jest.fn() }),
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

const mockViewModel = {
  posts: [],
  isLoading: false,
  isRefreshing: false,
  error: null as string | null,
  isGuest: false,
  userId: "u1",
  userName: "Ana López",
  userRole: "Docente",
  isCreateModalVisible: false,
  handleOpenCreateModal: jest.fn(),
  handleCloseCreateModal: jest.fn(),
  handlePublishPost: jest.fn(),
  handleLike: jest.fn(),
  handleComment: jest.fn(),
  handleSave: jest.fn(),
  handleShare: jest.fn(),
  handleRefresh: jest.fn(),
  handleAddToLibrary: jest.fn(),
  handleDownload: jest.fn(),
  handleTakeChallenge: jest.fn(),
  handleSaveExam: jest.fn(),
};

jest.mock("../../hooks/useFeedViewModel", () => ({
  useFeedViewModel: () => mockViewModel,
}));

// Mock PostCard & CreatePostModal to simplify
jest.mock("../../components/PostCard", () => {
  const { Text } = require("react-native");
  return ({ post }: any) => <Text testID={`post-${post.id}`}>{post.contenido}</Text>;
});

jest.mock("../../components/CreatePostModal", () => {
  return () => null;
});

describe("FeedScreen", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockViewModel.posts = [];
    mockViewModel.isLoading = false;
    mockViewModel.error = null;
    mockViewModel.isRefreshing = false;
  });

  it("muestra skeleton cuando isLoading=true", () => {
    mockViewModel.isLoading = true;

    const { getByText, queryByText } = render(<FeedScreen />);

    expect(getByText("Comunidad")).toBeTruthy();
    // Should not show empty or error state text
    expect(queryByText(/Bienvenido/i)).toBeNull();
    expect(queryByText(/No pudimos/i)).toBeNull();
  });

  it("muestra estado vacío cuando no hay posts", () => {
    mockViewModel.posts = [];

    const { getByText } = render(<FeedScreen />);

    expect(getByText(/Bienvenido a la comunidad/i)).toBeTruthy();
    expect(getByText(/Comparte tus experiencias/i)).toBeTruthy();
    expect(getByText(/Crear mi primera publicación/i)).toBeTruthy();
  });

  it("muestra estado de error", () => {
    mockViewModel.error = "Network error";

    const { getByText } = render(<FeedScreen />);

    expect(getByText(/No pudimos cargar/i)).toBeTruthy();
    expect(getByText(/Reintentar/i)).toBeTruthy();
  });

  it("renderiza posts cuando hay datos", () => {
    mockViewModel.posts = [
      {
        id: 1,
        autorId: "u2",
        autorNombre: "Carlos",
        autorRol: "Docente",
        contenido: "Hola mundo",
        fechaCreacion: new Date().toISOString(),
        likes: [],
        comentarios: [],
        compartidos: 0,
        guardadoPor: [],
      },
      {
        id: 2,
        autorId: "u3",
        autorNombre: "María",
        autorRol: "Docente",
        contenido: "Segundo post",
        fechaCreacion: new Date().toISOString(),
        likes: [],
        comentarios: [],
        compartidos: 0,
        guardadoPor: [],
      },
    ] as any;

    const { getByText } = render(<FeedScreen />);

    expect(getByText("Hola mundo")).toBeTruthy();
    expect(getByText("Segundo post")).toBeTruthy();
  });

  it("muestra header con título Comunidad", () => {
    const { getByText } = render(<FeedScreen />);

    expect(getByText("Comunidad")).toBeTruthy();
  });

  it("muestra barra de creación con iniciales del usuario", () => {
    mockViewModel.posts = [
      {
        id: 1,
        autorId: "u1",
        autorNombre: "Test",
        autorRol: "Docente",
        contenido: "Test",
        fechaCreacion: new Date().toISOString(),
        likes: [],
        comentarios: [],
        compartidos: 0,
        guardadoPor: [],
      },
    ] as any;

    const { getByText } = render(<FeedScreen />);

    // Initials for "Ana López" => "AL"
    expect(getByText("AL")).toBeTruthy();
  });
});
