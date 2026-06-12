import { useState, useCallback, useMemo } from "react";
import { Alert, Share } from "react-native";
import { usePosts } from "../context/PostsContext";
import { useAuth } from "../context/AuthContext";
import { useRecursos } from "../context/RecursosContext";
import { getRoleLabel, Post, PostMood, PostAttachment } from "../../types";

export function useFeedViewModel() {
  const { posts, isLoading, error, createPost, toggleLike, toggleSave, refreshPosts } = usePosts();
  const { usuario, isGuest } = useAuth();
  const { crearRecurso } = useRecursos();

  const [isCreateModalVisible, setCreateModalVisible] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const userId = usuario?.id?.toString() || "";
  const userNumericId = typeof usuario?.id === "number" ? usuario.id : Number(usuario?.id) || 0;
  const userName = usuario
    ? `${usuario.nombre}${usuario.apellidos ? ` ${usuario.apellidos}` : ""}`
    : "Usuario";
  const userRole = usuario?.rol ? getRoleLabel(usuario.rol) : "Docente";

  const sortedPosts = useMemo(
    () =>
      [...posts].sort(
        (a, b) => new Date(b.fechaCreacion).getTime() - new Date(a.fechaCreacion).getTime()
      ),
    [posts]
  );

  const handleOpenCreateModal = useCallback(() => {
    if (isGuest) {
      Alert.alert("Cuenta requerida", "Crea una cuenta para publicar en la comunidad.", [
        { text: "OK" },
      ]);
      return;
    }
    setCreateModalVisible(true);
  }, [isGuest]);

  const handleCloseCreateModal = useCallback(() => {
    setCreateModalVisible(false);
  }, []);

  const handlePublishPost = useCallback(
    async (data: { titulo?: string; contenido: string; mood?: PostMood }) => {
      await createPost({
        autorId: userId,
        autorNombre: userName,
        autorRol: userRole,
        ...data,
      });
      setCreateModalVisible(false);
    },
    [createPost, userId, userName, userRole]
  );

  const handleLike = useCallback(
    (postId: number) => {
      if (isGuest) {
        Alert.alert("Cuenta requerida", "Crea una cuenta para dar me gusta.");
        return;
      }
      toggleLike(postId, userId);
    },
    [toggleLike, userId, isGuest]
  );

  const handleSave = useCallback(
    (postId: number) => {
      if (isGuest) {
        Alert.alert("Cuenta requerida", "Crea una cuenta para guardar publicaciones.");
        return;
      }
      toggleSave(postId, userId);
    },
    [toggleSave, userId, isGuest]
  );

  const handleComment = useCallback((_postId: number) => {
    Alert.alert("Próximamente", "Los comentarios se implementarán próximamente.");
  }, []);

  const handleShare = useCallback(
    async (postId: number) => {
      const post = posts.find((p) => p.id === postId);
      if (!post) return;
      try {
        await Share.share({
          message: `${post.autorNombre} en PlanearIA:\n\n${post.contenido}`,
        });
      } catch {
        // User cancelled
      }
    },
    [posts]
  );

  const handleRefresh = useCallback(async () => {
    setIsRefreshing(true);
    await refreshPosts();
    setIsRefreshing(false);
  }, [refreshPosts]);

  const handleAddToLibrary = useCallback(
    async (post: Post, attachment: PostAttachment) => {
      if (isGuest) {
        Alert.alert("Cuenta requerida", "Crea una cuenta para guardar recursos en tu biblioteca.");
        return;
      }
      try {
        if (attachment.type === "planeacion") {
          // Si tuvieramos los datos crudos, usaríamos agregarPlaneacion.
          // Por simplicidad, agregamos una planeacion basica o recurso de enlace
          Alert.alert("Próximamente", "La clonación de planeaciones desde el feed se habilitará en breve.");
          return;
        }

        const tipo =
          attachment.type === "image"
            ? "imagen"
            : attachment.type === "document"
              ? "documento"
              : attachment.type === "recurso"
              ? "documento"
              : "enlace";
              
        await crearRecurso({
          titulo: attachment.name || post.titulo || "Recurso del feed",
          tipo: tipo as any,
          descripcion: `Guardado desde publicación de ${post.autorNombre}`,
          url: attachment.url,
          tags: ["feed", "comunidad"],
          fechaCreacion: new Date(),
          fechaModificacion: new Date(),
          asignadoComoTarea: false,
          acceso: "privado",
          origen: "manual",
          profesorId: userNumericId,
          versionActual: 1,
        });
        Alert.alert("Guardado", "El recurso se añadió a tu biblioteca.");
      } catch {
        Alert.alert("Error", "No se pudo guardar el recurso.");
      }
    },
    [isGuest, crearRecurso, userNumericId]
  );

  const handleDownload = useCallback((attachment: PostAttachment) => {
    Alert.alert("Próximamente", "La descarga directa de archivos se implementará próximamente.");
  }, []);

  const handleTakeChallenge = useCallback((_post: Post) => {
    Alert.alert("Próximamente", "El flujo de resolución de retos se implementará próximamente.");
  }, []);

  const handleSaveExam = useCallback(
    async (post: Post) => {
      if (isGuest) {
        Alert.alert("Cuenta requerida", "Crea una cuenta para guardar exámenes.");
        return;
      }
      if (!post.challengeData) return;
      try {
        await crearRecurso({
          titulo: post.challengeData.titulo,
          tipo: "examen",
          descripcion: post.challengeData.descripcion,
          tags: ["reto", "feed", "examen"],
          fechaCreacion: new Date(),
          fechaModificacion: new Date(),
          asignadoComoTarea: false,
          acceso: "privado",
          origen: "manual",
          profesorId: userNumericId,
          versionActual: 1,
        });
        Alert.alert(
          "Guardado",
          "El examen se guardó en tu biblioteca. Puedes asignarlo a tus alumnos desde la sección de Recursos."
        );
      } catch {
        Alert.alert("Error", "No se pudo guardar el examen.");
      }
    },
    [isGuest, crearRecurso, userNumericId]
  );

  return {
    posts: sortedPosts,
    isLoading,
    isRefreshing,
    error,
    isGuest,
    userId,
    userName,
    userRole,
    isCreateModalVisible,
    handleOpenCreateModal,
    handleCloseCreateModal,
    handlePublishPost,
    handleLike,
    handleComment,
    handleSave,
    handleShare,
    handleRefresh,
    handleAddToLibrary,
    handleDownload,
    handleTakeChallenge,
    handleSaveExam,
  };
}
