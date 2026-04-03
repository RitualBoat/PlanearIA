import React from "react";
import { render } from "@testing-library/react-native";
import PostDetailScreen from "../../screens/feed/PostDetailScreen";

jest.mock("@expo/vector-icons/MaterialIcons", () => "MaterialIcons");

jest.mock("expo-linear-gradient", () => ({
  LinearGradient: ({ children }: any) => children,
}));

jest.mock("react-native-safe-area-context", () => ({
  SafeAreaView: ({ children }: any) => children,
}));

jest.mock("@react-navigation/native", () => ({
  useNavigation: () => ({ goBack: jest.fn(), navigate: jest.fn() }),
  useRoute: () => ({
    params: { postId: 1, userId: "u1" },
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

const mockPosts = [
  {
    id: 1,
    autorId: "u2",
    autorNombre: "María García",
    autorRol: "Docente",
    contenido: "Contenido de prueba para el detalle",
    titulo: "Post de prueba",
    likes: 5,
    likedBy: ["u3"],
    commentsCount: 2,
    savedBy: [],
    attachments: [],
    fechaCreacion: new Date().toISOString(),
    fechaModificacion: new Date().toISOString(),
    syncStatus: "synced",
  },
];

jest.mock("../../context/PostsContext", () => ({
  usePosts: () => ({
    posts: mockPosts,
    toggleLike: jest.fn(),
    toggleSave: jest.fn(),
  }),
}));

describe("PostDetailScreen", () => {
  it("renderiza el header con título Publicación", () => {
    const { getByText } = render(<PostDetailScreen />);
    expect(getByText("Publicación")).toBeTruthy();
  });

  it("muestra el autor del post", () => {
    const { getByText } = render(<PostDetailScreen />);
    expect(getByText("María García")).toBeTruthy();
  });

  it("muestra el título del post", () => {
    const { getByText } = render(<PostDetailScreen />);
    expect(getByText("Post de prueba")).toBeTruthy();
  });

  it("muestra el contenido del post", () => {
    const { getByText } = render(<PostDetailScreen />);
    expect(getByText("Contenido de prueba para el detalle")).toBeTruthy();
  });

  it("muestra el conteo de likes", () => {
    const { getByText } = render(<PostDetailScreen />);
    expect(getByText("5")).toBeTruthy();
  });

  it("muestra sección de comentarios", () => {
    const { getByText } = render(<PostDetailScreen />);
    expect(getByText("COMENTARIOS (2)")).toBeTruthy();
  });

  it("muestra placeholder de sin comentarios", () => {
    const { getByText } = render(<PostDetailScreen />);
    expect(getByText("Sé el primero en comentar")).toBeTruthy();
  });

  it("muestra el input de comentario", () => {
    const { getByPlaceholderText } = render(<PostDetailScreen />);
    expect(getByPlaceholderText("Escribe un comentario...")).toBeTruthy();
  });
});

describe("PostDetailScreen - Post no encontrado", () => {
  it("muestra mensaje cuando el post no existe", () => {
    // Override only the route params via a separate mock
    const useRouteSpy = jest.spyOn(require("@react-navigation/native"), "useRoute");
    useRouteSpy.mockReturnValue({ params: { postId: 999, userId: "u1" } });

    const { getByText } = render(<PostDetailScreen />);
    expect(getByText("Publicación no encontrada")).toBeTruthy();

    useRouteSpy.mockRestore();
  });
});
