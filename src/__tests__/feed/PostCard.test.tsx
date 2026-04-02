import React from "react";
import { render, fireEvent } from "@testing-library/react-native";
import PostCard from "../../components/PostCard";
import { Post } from "../../../types";

const mockGetItem = jest.fn().mockResolvedValue(null);
const mockSetItem = jest.fn().mockResolvedValue(undefined);

jest.mock("@react-native-async-storage/async-storage", () => ({
  getItem: (...args: unknown[]) => mockGetItem(...args),
  setItem: (...args: unknown[]) => mockSetItem(...args),
}));

jest.mock("@expo/vector-icons/MaterialIcons", () => "MaterialIcons");

jest.mock("../../context/ThemeContext", () => ({
  useTheme: () => ({
    theme: "light",
    isDark: false,
    colors: {
      primary: "#1676D2",
      surfaceContainerLowest: "#FFFFFF",
      surfaceContainerLow: "#f1f4f8",
      onSurface: "#181c1f",
      onSurfaceVariant: "#43474e",
      outlineVariant: "#c0c7d4",
      primaryContainer: "#0576d2",
      secondaryContainer: "#60e2ff",
      errorContainer: "#ffdad6",
      shadowBlue: "rgba(0,93,168,0.06)",
    },
  }),
}));

const basePost: Post = {
  id: 1,
  autorId: "user1",
  autorNombre: "María García",
  autorRol: "Docente",
  contenido: "Compartiendo mi planeación de matemáticas",
  likes: 5,
  likedBy: ["user2", "user3"],
  commentsCount: 2,
  savedBy: ["user4"],
  attachments: [],
  fechaCreacion: new Date().toISOString(),
  fechaModificacion: new Date().toISOString(),
  syncStatus: "synced",
};

describe("PostCard", () => {
  const mockOnLike = jest.fn();
  const mockOnComment = jest.fn();
  const mockOnSave = jest.fn();
  const mockOnShare = jest.fn();
  const mockOnPress = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renderiza el nombre del autor y contenido", () => {
    const { getByText } = render(
      <PostCard
        post={basePost}
        currentUserId="user5"
        onLike={mockOnLike}
        onComment={mockOnComment}
        onSave={mockOnSave}
        onShare={mockOnShare}
      />
    );

    expect(getByText("María García")).toBeTruthy();
    expect(getByText("Compartiendo mi planeación de matemáticas")).toBeTruthy();
  });

  it("muestra las iniciales del avatar", () => {
    const { getByText } = render(
      <PostCard
        post={basePost}
        currentUserId="user5"
        onLike={mockOnLike}
        onComment={mockOnComment}
        onSave={mockOnSave}
        onShare={mockOnShare}
      />
    );

    expect(getByText("MG")).toBeTruthy();
  });

  it("muestra el conteo de likes", () => {
    const { getByText } = render(
      <PostCard
        post={basePost}
        currentUserId="user5"
        onLike={mockOnLike}
        onComment={mockOnComment}
        onSave={mockOnSave}
        onShare={mockOnShare}
      />
    );

    expect(getByText("5")).toBeTruthy();
  });

  it("llama onLike al tocar el botón de like", () => {
    const { getByText } = render(
      <PostCard
        post={basePost}
        currentUserId="user5"
        onLike={mockOnLike}
        onComment={mockOnComment}
        onSave={mockOnSave}
        onShare={mockOnShare}
      />
    );

    // Press the like count text's parent touchable
    const likeCount = getByText("5");
    fireEvent.press(likeCount);
    expect(mockOnLike).toHaveBeenCalledWith(1);
  });

  it("llama onPress al tocar la card", () => {
    const { getByText } = render(
      <PostCard
        post={basePost}
        currentUserId="user5"
        onLike={mockOnLike}
        onComment={mockOnComment}
        onSave={mockOnSave}
        onShare={mockOnShare}
        onPress={mockOnPress}
      />
    );

    fireEvent.press(getByText("Compartiendo mi planeación de matemáticas"));
    expect(mockOnPress).toHaveBeenCalledWith(basePost);
  });

  it("muestra el mood del post cuando está presente", () => {
    const postWithMood: Post = {
      ...basePost,
      mood: "📚",
    };

    const { getByText } = render(
      <PostCard
        post={postWithMood}
        currentUserId="user5"
        onLike={mockOnLike}
        onComment={mockOnComment}
        onSave={mockOnSave}
        onShare={mockOnShare}
      />
    );

    // Mood is rendered inline as "📚 • " + timeAgo
    expect(getByText(/📚/)).toBeTruthy();
  });

  it("muestra documento adjunto cuando existe", () => {
    const postWithDoc: Post = {
      ...basePost,
      attachments: [
        {
          type: "document",
          url: "https://example.com/doc.pdf",
          name: "Planeación_Semana1.pdf",
          size: "2.5 MB",
        },
      ],
    };

    const { getByText } = render(
      <PostCard
        post={postWithDoc}
        currentUserId="user5"
        onLike={mockOnLike}
        onComment={mockOnComment}
        onSave={mockOnSave}
        onShare={mockOnShare}
      />
    );

    expect(getByText("Planeación_Semana1.pdf")).toBeTruthy();
    expect(getByText(/2\.5 MB/)).toBeTruthy();
  });

  it("muestra card de reto/examen cuando isChallenge", () => {
    const challengePost: Post = {
      ...basePost,
      isChallenge: true,
      challengeData: {
        titulo: "Reto de Matemáticas",
        descripcion: "15 min · 10 preguntas",
        duracionMinutos: 15,
        totalPreguntas: 10,
      },
    };

    const { getByText } = render(
      <PostCard
        post={challengePost}
        currentUserId="user5"
        onLike={mockOnLike}
        onComment={mockOnComment}
        onSave={mockOnSave}
        onShare={mockOnShare}
      />
    );

    expect(getByText("Reto de Matemáticas")).toBeTruthy();
    expect(getByText("RETO")).toBeTruthy();
    expect(getByText("Contestar ahora")).toBeTruthy();
    expect(getByText("Guardar examen")).toBeTruthy();
  });
});
