import React from "react";
import { renderHook, act, waitFor } from "@testing-library/react-native";
import { Alert, Share } from "react-native";
import { useFeedViewModel } from "../../hooks/useFeedViewModel";
import { PostsProvider } from "../../context/PostsContext";

const mockGetItem = jest.fn();
const mockSetItem = jest.fn();

jest.mock("@react-native-async-storage/async-storage", () => ({
  getItem: (...args: unknown[]) => mockGetItem(...args),
  setItem: (...args: unknown[]) => mockSetItem(...args),
}));

// Mock AuthContext
const mockUsuario = { id: 1, nombre: "Ana", apellidos: "López", rol: "docente" };
let mockIsGuest = false;

jest.mock("../../context/AuthContext", () => ({
  useAuth: () => ({
    usuario: mockIsGuest ? null : mockUsuario,
    isGuest: mockIsGuest,
  }),
}));

const mockCrearRecurso = jest.fn().mockResolvedValue({ recurso: {}, syncOk: true });

jest.mock("../../context/RecursosContext", () => ({
  useRecursos: () => ({
    crearRecurso: mockCrearRecurso,
  }),
}));

jest.spyOn(Alert, "alert");
jest.spyOn(Share, "share").mockResolvedValue({ action: "sharedAction", activityType: undefined });

const wrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <PostsProvider>{children}</PostsProvider>
);

const samplePosts = [
  {
    id: 1,
    autorId: "user1",
    autorNombre: "María",
    contenido: "Post antiguo",
    likes: 0,
    likedBy: [],
    commentsCount: 0,
    savedBy: [],
    attachments: [],
    fechaCreacion: "2025-01-01T00:00:00.000Z",
    fechaModificacion: "2025-01-01T00:00:00.000Z",
    syncStatus: "synced",
  },
  {
    id: 2,
    autorId: "user2",
    autorNombre: "Pedro",
    contenido: "Post reciente",
    likes: 0,
    likedBy: [],
    commentsCount: 0,
    savedBy: [],
    attachments: [],
    fechaCreacion: "2025-06-01T00:00:00.000Z",
    fechaModificacion: "2025-06-01T00:00:00.000Z",
    syncStatus: "synced",
  },
];

describe("useFeedViewModel", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockIsGuest = false;
    mockGetItem.mockResolvedValue(JSON.stringify(samplePosts));
    mockSetItem.mockResolvedValue(undefined);
  });

  it("ordena posts por fecha descendente (más recientes primero)", async () => {
    const { result } = renderHook(() => useFeedViewModel(), { wrapper });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.posts[0].id).toBe(2); // Post reciente primero
    expect(result.current.posts[1].id).toBe(1);
  });

  it("retorna datos del usuario autenticado", async () => {
    const { result } = renderHook(() => useFeedViewModel(), { wrapper });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.userId).toBe("1");
    expect(result.current.userName).toBe("Ana López");
    expect(result.current.isGuest).toBe(false);
  });

  it("bloquea crear post si es guest y muestra alerta", async () => {
    mockIsGuest = true;

    const { result } = renderHook(() => useFeedViewModel(), { wrapper });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    act(() => {
      result.current.handleOpenCreateModal();
    });

    expect(Alert.alert).toHaveBeenCalledWith(
      "Cuenta requerida",
      expect.any(String),
      expect.any(Array)
    );
    expect(result.current.isCreateModalVisible).toBe(false);
  });

  it("abre y cierra el modal de creación para usuarios autenticados", async () => {
    const { result } = renderHook(() => useFeedViewModel(), { wrapper });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    act(() => {
      result.current.handleOpenCreateModal();
    });
    expect(result.current.isCreateModalVisible).toBe(true);

    act(() => {
      result.current.handleCloseCreateModal();
    });
    expect(result.current.isCreateModalVisible).toBe(false);
  });

  it("bloquea like si es guest", async () => {
    mockIsGuest = true;

    const { result } = renderHook(() => useFeedViewModel(), { wrapper });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    act(() => {
      result.current.handleLike(1);
    });

    expect(Alert.alert).toHaveBeenCalledWith("Cuenta requerida", expect.any(String));
  });

  it("bloquea save si es guest", async () => {
    mockIsGuest = true;

    const { result } = renderHook(() => useFeedViewModel(), { wrapper });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    act(() => {
      result.current.handleSave(1);
    });

    expect(Alert.alert).toHaveBeenCalledWith("Cuenta requerida", expect.any(String));
  });

  it("handleComment muestra alert de próximamente", async () => {
    const { result } = renderHook(() => useFeedViewModel(), { wrapper });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    act(() => {
      result.current.handleComment(1);
    });

    expect(Alert.alert).toHaveBeenCalledWith("Próximamente", expect.any(String));
  });

  it("handleShare comparte el contenido del post", async () => {
    const { result } = renderHook(() => useFeedViewModel(), { wrapper });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    await act(async () => {
      await result.current.handleShare(1);
    });

    expect(Share.share).toHaveBeenCalledWith({
      message: expect.stringContaining("María"),
    });
  });

  it("handlePublishPost crea un post y cierra el modal", async () => {
    const { result } = renderHook(() => useFeedViewModel(), { wrapper });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    act(() => {
      result.current.handleOpenCreateModal();
    });

    await act(async () => {
      await result.current.handlePublishPost({
        contenido: "Nueva publicación de prueba",
        mood: "💡",
      });
    });

    expect(result.current.isCreateModalVisible).toBe(false);
    expect(result.current.posts[0].contenido).toBe("Nueva publicación de prueba");
  });
});
