import React, { useState } from "react";
import {
  Pressable,
  View,
  Text,
  StyleSheet,
  Image,
  FlatList,
  TextInput,
  Platform,
  useWindowDimensions,
  KeyboardAvoidingView,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { LinearGradient } from "expo-linear-gradient";
import { useNavigation, useRoute, RouteProp } from "@react-navigation/native";
import { useTheme } from "../../context/ThemeContext";
import { usePosts } from "../../context/PostsContext";
import { Post, PostComment } from "../../../types";
import { RootStackParamList } from "../../navigation/StackNavigator";

type PostDetailRouteProp = RouteProp<RootStackParamList, "PostDetail">;

/* Helper */
function getTimeAgo(dateStr: string): string {
  const now = Date.now();
  const date = new Date(dateStr).getTime();
  const diffMs = now - date;
  const diffMin = Math.floor(diffMs / 60000);
  if (diffMin < 1) return "Ahora";
  if (diffMin < 60) return `${diffMin}m`;
  const diffHours = Math.floor(diffMin / 60);
  if (diffHours < 24) return `${diffHours}h`;
  const diffDays = Math.floor(diffHours / 24);
  if (diffDays < 7) return `${diffDays}d`;
  return new Date(dateStr).toLocaleDateString("es-MX", { day: "numeric", month: "short" });
}

const MOCK_COMMENTS: PostComment[] = [];

const PostDetailScreen: React.FC = () => {
  const { colors } = useTheme();
  const { width } = useWindowDimensions();
  const navigation = useNavigation<any>();
  const route = useRoute<PostDetailRouteProp>();
  const { posts, toggleLike, toggleSave } = usePosts();

  const postId = route.params?.postId;
  const userId = route.params?.userId || "";
  const post = posts.find((p) => p.id === postId);

  const [commentText, setCommentText] = useState("");

  const isDesktop = width >= 768;

  if (!post) {
    return (
      <SafeAreaView style={[styles.safe, { backgroundColor: colors.background }]} edges={["top"]}>
        <View style={styles.header}>
          <Pressable
            onPress={() => navigation.goBack()}
            style={({ pressed }) => [styles.headerBtn, pressed && { opacity: 0.6 }]}
          >
            <MaterialIcons name="arrow-back" size={24} color={colors.primary} />
          </Pressable>
          <Text style={[styles.headerTitle, { color: colors.onSurface }]}>Publicación</Text>
          <View style={{ width: 40 }} />
        </View>
        <View style={styles.notFoundContainer}>
          <MaterialIcons name="article" size={56} color={colors.outlineVariant} />
          <Text style={[styles.notFoundText, { color: colors.onSurfaceVariant }]}>
            Publicación no encontrada
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  const isLiked = userId ? post.likedBy.includes(userId) : false;
  const isSaved = userId ? post.savedBy.includes(userId) : false;

  const initials = post.autorNombre
    .split(" ")
    .map((w) => w[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  const timeAgo = getTimeAgo(post.fechaCreacion);
  const imageAttachment = post.attachments.find((a) => a.type === "image");

  const handleSendComment = () => {
    if (!commentText.trim()) return;
    // Comments are a stub for now
    setCommentText("");
  };

  /* Mock comments for display */
  const mockComments = MOCK_COMMENTS;

  const renderComment = ({ item }: { item: PostComment }) => {
    const commentInitials = item.autorNombre
      .split(" ")
      .map((w) => w[0])
      .slice(0, 2)
      .join("")
      .toUpperCase();

    return (
      <View style={styles.commentRow}>
        <View style={[styles.commentAvatar, { backgroundColor: colors.primaryContainer }]}>
          <Text style={styles.commentAvatarText}>{commentInitials}</Text>
        </View>
        <View style={{ flex: 1 }}>
          <View style={styles.commentHeader}>
            <Text style={[styles.commentAuthor, { color: colors.onSurface }]}>
              {item.autorNombre}
            </Text>
            <Text style={[styles.commentTime, { color: colors.onSurfaceVariant }]}>
              {getTimeAgo(item.fechaCreacion)}
            </Text>
          </View>
          <Text style={[styles.commentText, { color: colors.onSurfaceVariant }]}>
            {item.contenido}
          </Text>
          <View style={styles.commentActions}>
            <Pressable
              style={({ pressed }) => [styles.commentActionBtn, pressed && { opacity: 0.6 }]}
            >
              <MaterialIcons name="thumb-up" size={14} color={colors.primary} />
              <Text style={[styles.commentActionText, { color: colors.primary }]}>
                {item.likes > 0 ? item.likes : "Me gusta"}
              </Text>
            </Pressable>
            <Pressable
              style={({ pressed }) => [styles.commentActionBtn, pressed && { opacity: 0.6 }]}
            >
              <Text style={[styles.commentReplyText, { color: colors.onSurfaceVariant }]}>
                RESPONDER
              </Text>
            </Pressable>
          </View>
        </View>
      </View>
    );
  };

  const renderPostContent = () => (
    <View>
      {/* Post image */}
      {imageAttachment && (
        <Image source={{ uri: imageAttachment.url }} style={styles.postImage} resizeMode="cover" />
      )}

      {/* Author info */}
      <View style={styles.authorRow}>
        {post.autorAvatar ? (
          <Image source={{ uri: post.autorAvatar }} style={styles.avatar} />
        ) : (
          <View style={[styles.avatarPlaceholder, { backgroundColor: colors.primary }]}>
            <Text style={styles.avatarInitials}>{initials}</Text>
          </View>
        )}
        <View>
          <Text style={[styles.authorName, { color: colors.onSurface }]}>{post.autorNombre}</Text>
          <Text style={[styles.authorMeta, { color: colors.onSurfaceVariant }]}>
            {post.autorRol ? `${post.autorRol} • ` : ""}
            {timeAgo}
          </Text>
        </View>
      </View>

      {/* Title */}
      {post.titulo && (
        <Text style={[styles.postTitle, { color: colors.primary }]}>{post.titulo}</Text>
      )}

      {/* Content */}
      <Text style={[styles.postBody, { color: colors.onSurfaceVariant }]}>{post.contenido}</Text>

      {/* Action bar */}
      <View
        style={[
          styles.actionBar,
          {
            borderTopColor: colors.surfaceContainerLow,
            borderBottomColor: colors.surfaceContainerLow,
          },
        ]}
      >
        <View style={styles.actionGroupLeft}>
          <Pressable
            style={({ pressed }) => [styles.actionBtn, pressed && { opacity: 0.6 }]}
            onPress={() => toggleLike(post.id as number, userId)}
          >
            <MaterialIcons
              name={isLiked ? "favorite" : "favorite-border"}
              size={22}
              color={isLiked ? colors.primary : colors.onSurfaceVariant}
            />
            {post.likes > 0 && (
              <Text
                style={[
                  styles.actionCount,
                  { color: isLiked ? colors.primary : colors.onSurfaceVariant },
                ]}
              >
                {post.likes}
              </Text>
            )}
          </Pressable>

          <Pressable style={({ pressed }) => [styles.actionBtn, pressed && { opacity: 0.6 }]}>
            <MaterialIcons name="chat-bubble-outline" size={22} color={colors.onSurfaceVariant} />
            {post.commentsCount > 0 && (
              <Text style={[styles.actionCount, { color: colors.onSurfaceVariant }]}>
                {post.commentsCount}
              </Text>
            )}
          </Pressable>

          <Pressable style={({ pressed }) => [styles.actionBtn, pressed && { opacity: 0.6 }]}>
            <MaterialIcons name="download" size={22} color={colors.onSurfaceVariant} />
          </Pressable>
        </View>

        <View style={styles.actionGroupRight}>
          <Pressable
            style={({ pressed }) => pressed && { opacity: 0.6 }}
            onPress={() => toggleSave(post.id as number, userId)}
          >
            <MaterialIcons
              name={isSaved ? "bookmark" : "bookmark-border"}
              size={22}
              color={isSaved ? colors.primary : colors.onSurfaceVariant}
            />
          </Pressable>
          <Pressable style={({ pressed }) => pressed && { opacity: 0.6 }}>
            <MaterialIcons name="share" size={22} color={colors.onSurfaceVariant} />
          </Pressable>
        </View>
      </View>

      {/* Comments header */}
      <View style={styles.commentsHeader}>
        <Text style={[styles.commentsLabel, { color: colors.onSurfaceVariant }]}>
          COMENTARIOS ({post.commentsCount})
        </Text>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: colors.background }]} edges={["top"]}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: colors.background }]}>
        <Pressable
          onPress={() => navigation.goBack()}
          style={({ pressed }) => [styles.headerBtn, pressed && { opacity: 0.6 }]}
        >
          <MaterialIcons name="arrow-back" size={24} color={colors.primary} />
        </Pressable>
        <Text style={[styles.headerTitle, { color: colors.onSurface }]}>Publicación</Text>
        <Pressable style={({ pressed }) => [styles.headerBtn, pressed && { opacity: 0.6 }]}>
          <MaterialIcons name="more-vert" size={24} color={colors.onSurfaceVariant} />
        </Pressable>
      </View>

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        keyboardVerticalOffset={Platform.OS === "ios" ? 100 : 0}
      >
        <View
          style={[
            styles.contentContainer,
            isDesktop && { maxWidth: 640, alignSelf: "center", width: "100%" },
          ]}
        >
          <FlatList
            data={mockComments}
            keyExtractor={(item) => item.id.toString()}
            renderItem={renderComment}
            ListHeaderComponent={renderPostContent}
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
            ListEmptyComponent={
              <View style={styles.noCommentsContainer}>
                <MaterialIcons name="chat-bubble-outline" size={32} color={colors.outlineVariant} />
                <Text style={[styles.noCommentsText, { color: colors.onSurfaceVariant }]}>
                  Sé el primero en comentar
                </Text>
              </View>
            }
          />
        </View>

        {/* Bottom comment input */}
        <View
          style={[
            styles.commentInputBar,
            {
              backgroundColor: `${colors.background}E6`,
              borderTopColor: `${colors.outlineVariant}30`,
            },
          ]}
        >
          <View
            style={[
              styles.commentInputContainer,
              {
                backgroundColor: colors.surfaceContainerLowest,
                ...Platform.select({
                  web: { boxShadow: `0px 2px 8px ${colors.shadowBlue}` } as any,
                  default: {
                    shadowColor: "#005da8",
                    shadowOffset: { width: 0, height: 2 },
                    shadowOpacity: 0.06,
                    shadowRadius: 8,
                    elevation: 2,
                  },
                }),
              },
            ]}
          >
            <View style={[styles.commentInputAvatar, { backgroundColor: colors.primary }]}>
              <Text style={styles.commentInputAvatarText}>{(userId || "U")[0].toUpperCase()}</Text>
            </View>
            <TextInput
              style={[styles.commentInput, { color: colors.onSurface }]}
              placeholder="Escribe un comentario..."
              placeholderTextColor={colors.onSurfaceVariant}
              value={commentText}
              onChangeText={setCommentText}
              multiline={false}
            />
            <Pressable
              onPress={handleSendComment}
              disabled={!commentText.trim()}
              style={({ pressed }) => [
                { opacity: commentText.trim() ? 1 : 0.4 },
                pressed && { opacity: 0.6 },
              ]}
            >
              <LinearGradient
                colors={[colors.primary, colors.primaryContainer]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.sendBtn}
              >
                <MaterialIcons name="arrow-upward" size={18} color="#FFF" />
              </LinearGradient>
            </Pressable>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safe: { flex: 1 },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    height: 56,
    paddingHorizontal: 16,
  },
  headerBtn: {
    width: 40,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "700",
    letterSpacing: -0.3,
  },
  contentContainer: {
    flex: 1,
  },
  listContent: {
    paddingBottom: 100,
  },
  notFoundContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
  },
  notFoundText: {
    fontSize: 16,
    fontWeight: "600",
  },
  /* Post content */
  postImage: {
    width: "100%",
    aspectRatio: 4 / 3,
  },
  authorRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    padding: 24,
    paddingBottom: 16,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  avatarPlaceholder: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarInitials: {
    color: "#FFF",
    fontWeight: "700",
    fontSize: 14,
  },
  authorName: {
    fontWeight: "700",
    fontSize: 14,
  },
  authorMeta: {
    fontSize: 10,
    fontWeight: "700",
    letterSpacing: 0.8,
    textTransform: "uppercase",
    marginTop: 2,
  },
  postTitle: {
    fontSize: 20,
    fontWeight: "800",
    letterSpacing: -0.3,
    paddingHorizontal: 24,
    marginBottom: 12,
  },
  postBody: {
    fontSize: 15,
    lineHeight: 24,
    paddingHorizontal: 24,
    paddingBottom: 16,
  },
  /* Action bar */
  actionBar: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 24,
    paddingVertical: 16,
    borderTopWidth: 1,
    borderBottomWidth: 1,
  },
  actionGroupLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 24,
  },
  actionGroupRight: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
  },
  actionBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  actionCount: {
    fontSize: 12,
    fontWeight: "700",
  },
  /* Comments */
  commentsHeader: {
    paddingHorizontal: 24,
    paddingTop: 20,
    paddingBottom: 16,
  },
  commentsLabel: {
    fontSize: 10,
    fontWeight: "700",
    letterSpacing: 1.5,
    textTransform: "uppercase",
  },
  noCommentsContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 40,
    gap: 8,
  },
  noCommentsText: {
    fontSize: 14,
    fontWeight: "600",
  },
  commentRow: {
    flexDirection: "row",
    gap: 12,
    paddingHorizontal: 24,
    paddingVertical: 12,
  },
  commentAvatar: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  commentAvatarText: {
    color: "#FFF",
    fontWeight: "700",
    fontSize: 10,
  },
  commentHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 4,
  },
  commentAuthor: {
    fontWeight: "700",
    fontSize: 14,
  },
  commentTime: {
    fontSize: 10,
  },
  commentText: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 8,
  },
  commentActions: {
    flexDirection: "row",
    gap: 16,
  },
  commentActionBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  commentActionText: {
    fontSize: 11,
    fontWeight: "700",
  },
  commentReplyText: {
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 0.5,
    textTransform: "uppercase",
  },
  /* Bottom input */
  commentInputBar: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderTopWidth: 1,
    paddingBottom: Platform.OS === "ios" ? 32 : 12,
  },
  commentInputContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  commentInputAvatar: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  commentInputAvatarText: {
    color: "#FFF",
    fontWeight: "700",
    fontSize: 10,
  },
  commentInput: {
    flex: 1,
    fontSize: 14,
    paddingVertical: 0,
  },
  sendBtn: {
    width: 32,
    height: 32,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
  },
});

export default PostDetailScreen;
