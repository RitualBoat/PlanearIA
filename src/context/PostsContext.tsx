import React, { createContext, useContext, useState, useCallback, useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Post, PostMood } from "../../types";

const POSTS_STORAGE_KEY = "APP_POSTS_DATA";

interface PostsContextData {
  posts: Post[];
  isLoading: boolean;
  error: string | null;
  createPost: (data: {
    autorId: string;
    autorNombre: string;
    autorRol?: string;
    titulo?: string;
    contenido: string;
    mood?: PostMood;
  }) => Promise<void>;
  toggleLike: (postId: number, userId: string) => void;
  toggleSave: (postId: number, userId: string) => void;
  refreshPosts: () => Promise<void>;
}

const PostsContext = createContext<PostsContextData | undefined>(undefined);

export const PostsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load from AsyncStorage on mount
  useEffect(() => {
    loadPosts();
  }, []);

  const loadPosts = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const stored = await AsyncStorage.getItem(POSTS_STORAGE_KEY);
      if (stored) {
        setPosts(JSON.parse(stored));
      }
    } catch {
      setError("Error al cargar publicaciones");
    } finally {
      setIsLoading(false);
    }
  };

  const savePosts = async (updatedPosts: Post[]) => {
    try {
      await AsyncStorage.setItem(POSTS_STORAGE_KEY, JSON.stringify(updatedPosts));
    } catch {
      // Silent fail on save — offline-first
    }
  };

  const createPost = useCallback(
    async (data: {
      autorId: string;
      autorNombre: string;
      autorRol?: string;
      titulo?: string;
      contenido: string;
      mood?: PostMood;
    }) => {
      const newPost: Post = {
        id: Date.now(),
        autorId: data.autorId,
        autorNombre: data.autorNombre,
        autorRol: data.autorRol,
        titulo: data.titulo,
        contenido: data.contenido,
        mood: data.mood,
        attachments: [],
        likes: 0,
        likedBy: [],
        commentsCount: 0,
        savedBy: [],
        fechaCreacion: new Date().toISOString(),
        fechaModificacion: new Date().toISOString(),
        syncStatus: "pending",
      };
      const updated = [newPost, ...posts];
      setPosts(updated);
      await savePosts(updated);
    },
    [posts]
  );

  const toggleLike = useCallback(
    (postId: number, userId: string) => {
      const updated = posts.map((p) => {
        if (p.id !== postId) return p;
        const alreadyLiked = p.likedBy.includes(userId);
        return {
          ...p,
          likes: alreadyLiked ? p.likes - 1 : p.likes + 1,
          likedBy: alreadyLiked ? p.likedBy.filter((id) => id !== userId) : [...p.likedBy, userId],
          fechaModificacion: new Date().toISOString(),
          syncStatus: "pending" as const,
        };
      });
      setPosts(updated);
      savePosts(updated);
    },
    [posts]
  );

  const toggleSave = useCallback(
    (postId: number, userId: string) => {
      const updated = posts.map((p) => {
        if (p.id !== postId) return p;
        const alreadySaved = p.savedBy.includes(userId);
        return {
          ...p,
          savedBy: alreadySaved ? p.savedBy.filter((id) => id !== userId) : [...p.savedBy, userId],
          fechaModificacion: new Date().toISOString(),
          syncStatus: "pending" as const,
        };
      });
      setPosts(updated);
      savePosts(updated);
    },
    [posts]
  );

  const refreshPosts = useCallback(async () => {
    await loadPosts();
  }, []);

  return (
    <PostsContext.Provider
      value={{
        posts,
        isLoading,
        error,
        createPost,
        toggleLike,
        toggleSave,
        refreshPosts,
      }}
    >
      {children}
    </PostsContext.Provider>
  );
};

export function usePosts(): PostsContextData {
  const ctx = useContext(PostsContext);
  if (!ctx) throw new Error("usePosts must be used within PostsProvider");
  return ctx;
}
