import React from "react";
import { act, renderHook, waitFor } from "@testing-library/react-native";
import { PostsProvider } from "../../context/PostsContext";
import { usePosts } from "../../hooks/usePosts";

const mockGetItem = jest.fn();
const mockSetItem = jest.fn();

jest.mock("@react-native-async-storage/async-storage", () => ({
  getItem: (...args: unknown[]) => mockGetItem(...args),
  setItem: (...args: unknown[]) => mockSetItem(...args),
}));

const wrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <PostsProvider>{children}</PostsProvider>
);

describe("PostsContext", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockGetItem.mockResolvedValue(null);
    mockSetItem.mockResolvedValue(undefined);
  });

  it("carga sin posts al iniciar con storage vacío", async () => {
    const { result } = renderHook(() => usePosts(), { wrapper });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.posts).toEqual([]);
    expect(result.current.error).toBeNull();
  });

  it("carga posts existentes desde AsyncStorage", async () => {
    const storedPosts = [
      {
        id: 1,
        autorId: "user1",
        autorNombre: "Ana",
        contenido: "Hola comunidad",
        likes: 0,
        likedBy: [],
        commentsCount: 0,
        savedBy: [],
        attachments: [],
        fechaCreacion: "2025-01-01",
        fechaModificacion: "2025-01-01",
        syncStatus: "synced",
      },
    ];
    mockGetItem.mockResolvedValue(JSON.stringify(storedPosts));

    const { result } = renderHook(() => usePosts(), { wrapper });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.posts).toHaveLength(1);
    expect(result.current.posts[0].contenido).toBe("Hola comunidad");
  });

  it("crea un post y lo persiste en AsyncStorage", async () => {
    const { result } = renderHook(() => usePosts(), { wrapper });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    await act(async () => {
      await result.current.createPost({
        autorId: "user1",
        autorNombre: "María",
        autorRol: "Docente",
        contenido: "Mi primera publicación",
        mood: "📚",
      });
    });

    expect(result.current.posts).toHaveLength(1);
    expect(result.current.posts[0].contenido).toBe("Mi primera publicación");
    expect(result.current.posts[0].autorNombre).toBe("María");
    expect(result.current.posts[0].mood).toBe("📚");
    expect(result.current.posts[0].syncStatus).toBe("pending");
    expect(mockSetItem).toHaveBeenCalledWith("APP_POSTS_DATA", expect.any(String));
  });

  it("toggleLike agrega y quita like correctamente", async () => {
    const storedPosts = [
      {
        id: 100,
        autorId: "user1",
        autorNombre: "Ana",
        contenido: "Post para likes",
        likes: 0,
        likedBy: [],
        commentsCount: 0,
        savedBy: [],
        attachments: [],
        fechaCreacion: "2025-01-01",
        fechaModificacion: "2025-01-01",
        syncStatus: "synced",
      },
    ];
    mockGetItem.mockResolvedValue(JSON.stringify(storedPosts));

    const { result } = renderHook(() => usePosts(), { wrapper });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    // Like
    act(() => {
      result.current.toggleLike(100, "user2");
    });

    expect(result.current.posts[0].likes).toBe(1);
    expect(result.current.posts[0].likedBy).toContain("user2");

    // Unlike
    act(() => {
      result.current.toggleLike(100, "user2");
    });

    expect(result.current.posts[0].likes).toBe(0);
    expect(result.current.posts[0].likedBy).not.toContain("user2");
  });

  it("toggleSave agrega y quita guardado correctamente", async () => {
    const storedPosts = [
      {
        id: 200,
        autorId: "user1",
        autorNombre: "Ana",
        contenido: "Post para guardar",
        likes: 0,
        likedBy: [],
        commentsCount: 0,
        savedBy: [],
        attachments: [],
        fechaCreacion: "2025-01-01",
        fechaModificacion: "2025-01-01",
        syncStatus: "synced",
      },
    ];
    mockGetItem.mockResolvedValue(JSON.stringify(storedPosts));

    const { result } = renderHook(() => usePosts(), { wrapper });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    // Save
    act(() => {
      result.current.toggleSave(200, "user3");
    });

    expect(result.current.posts[0].savedBy).toContain("user3");

    // Unsave
    act(() => {
      result.current.toggleSave(200, "user3");
    });

    expect(result.current.posts[0].savedBy).not.toContain("user3");
  });

  it("lanza error si se usa fuera del Provider", () => {
    expect(() => {
      renderHook(() => usePosts());
    }).toThrow("usePosts must be used within PostsProvider");
  });

  it("maneja error de carga mostrando mensaje de error", async () => {
    mockGetItem.mockRejectedValue(new Error("Storage error"));

    const { result } = renderHook(() => usePosts(), { wrapper });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.error).toBe("Error al cargar publicaciones");
    expect(result.current.posts).toEqual([]);
  });

  it("refreshPosts recarga los datos desde AsyncStorage", async () => {
    mockGetItem.mockResolvedValue(null);

    const { result } = renderHook(() => usePosts(), { wrapper });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    // Simular que ahora hay datos
    const newPosts = [
      {
        id: 300,
        autorId: "user1",
        autorNombre: "Pedro",
        contenido: "Nuevo post",
        likes: 0,
        likedBy: [],
        commentsCount: 0,
        savedBy: [],
        attachments: [],
        fechaCreacion: "2025-02-01",
        fechaModificacion: "2025-02-01",
        syncStatus: "synced",
      },
    ];
    mockGetItem.mockResolvedValue(JSON.stringify(newPosts));

    await act(async () => {
      await result.current.refreshPosts();
    });

    expect(result.current.posts).toHaveLength(1);
    expect(result.current.posts[0].autorNombre).toBe("Pedro");
  });
});
