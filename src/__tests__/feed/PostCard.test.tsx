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

jest.mock("expo-linear-gradient", () => ({
  LinearGradient: "LinearGradient",
}));

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

  it("muestra card de reto/examen cuando isChallenge (sin_contestar)", () => {
    const challengePost: Post = {
      ...basePost,
      isChallenge: true,
      challengeData: {
        titulo: "Reto de Matemáticas",
        descripcion: "15 min · 10 preguntas",
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

  it("muestra variante 'contestado' con puntaje y ranking", () => {
    const answeredPost: Post = {
      ...basePost,
      isChallenge: true,
      challengeState: "contestado",
      challengeData: {
        titulo: "Reto Contestado",
        descripcion: "Ya respondido",
        score: 8,
        totalPreguntas: 10,
        ranking: 3,
        totalParticipantes: 20,
      },
    };

    const { getByText } = render(
      <PostCard
        post={answeredPost}
        currentUserId="user5"
        onLike={mockOnLike}
        onComment={mockOnComment}
        onSave={mockOnSave}
        onShare={mockOnShare}
      />
    );

    expect(getByText("Reto Contestado")).toBeTruthy();
    expect(getByText("8/10")).toBeTruthy();
    expect(getByText("#3 de 20")).toBeTruthy();
    expect(getByText("Ver mis respuestas")).toBeTruthy();
    expect(getByText("Reintentar")).toBeTruthy();
  });

  it("muestra variante 'cerrado' con mensaje de cierre", () => {
    const closedPost: Post = {
      ...basePost,
      isChallenge: true,
      challengeState: "cerrado",
      challengeData: {
        titulo: "Reto Cerrado",
        descripcion: "Expirado",
      },
    };

    const { getByText } = render(
      <PostCard
        post={closedPost}
        currentUserId="user5"
        onLike={mockOnLike}
        onComment={mockOnComment}
        onSave={mockOnSave}
        onShare={mockOnShare}
      />
    );

    expect(getByText("Reto Cerrado")).toBeTruthy();
    expect(getByText("RETO CERRADO")).toBeTruthy();
    expect(getByText("Este reto ya no acepta respuestas")).toBeTruthy();
    expect(getByText("Cerrado")).toBeTruthy();
    expect(getByText("Ver resultados")).toBeTruthy();
  });

  it("muestra variante 'propio' con estadísticas del creador", () => {
    const ownPost: Post = {
      ...basePost,
      autorId: "user5",
      isChallenge: true,
      challengeData: {
        titulo: "Mi Reto",
        descripcion: "Creado por mí",
        participantesActivos: 12,
        promedio: 7.2,
        mejorPuntaje: 10,
      },
    };

    const { getByText } = render(
      <PostCard
        post={ownPost}
        currentUserId="user5"
        onLike={mockOnLike}
        onComment={mockOnComment}
        onSave={mockOnSave}
        onShare={mockOnShare}
      />
    );

    expect(getByText("Mi Reto")).toBeTruthy();
    expect(getByText("TU RETO")).toBeTruthy();
    expect(getByText("12")).toBeTruthy();
    expect(getByText("7.2")).toBeTruthy();
    expect(getByText("Ver estadísticas")).toBeTruthy();
    expect(getByText("Editar reto")).toBeTruthy();
  });
});
