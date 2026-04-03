import React from "react";
import { View, Text, StyleSheet, TouchableOpacity, Image, Platform } from "react-native";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { useTheme } from "../context/ThemeContext";
import { Post } from "../../types";

interface PostCardProps {
  post: Post;
  currentUserId?: string;
  onLike: (postId: number) => void;
  onComment: (postId: number) => void;
  onSave: (postId: number) => void;
  onShare: (postId: number) => void;
  onAddToLibrary?: (post: Post, attachment: Post["attachments"][0]) => void;
  onDownload?: (attachment: Post["attachments"][0]) => void;
  onTakeChallenge?: (post: Post) => void;
  onSaveExam?: (post: Post) => void;
  onPress?: (post: Post) => void;
  onAuthorPress?: (autorId: string) => void;
  onOptions?: (post: Post) => void;
}

const PostCard: React.FC<PostCardProps> = ({
  post,
  currentUserId,
  onLike,
  onComment,
  onSave,
  onShare,
  onAddToLibrary,
  onDownload,
  onTakeChallenge,
  onSaveExam,
  onPress,
  onAuthorPress,
  onOptions,
}) => {
  const { colors } = useTheme();
  const isLiked = currentUserId ? post.likedBy.includes(currentUserId) : false;
  const isSaved = currentUserId ? post.savedBy.includes(currentUserId) : false;

  const initials = post.autorNombre
    .split(" ")
    .map((w) => w[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  const timeAgo = getTimeAgo(post.fechaCreacion);

  const imageAttachment = post.attachments.find((a) => a.type === "image");
  const docAttachment = post.attachments.find((a) => a.type === "document");

  const cardShadow = Platform.select({
    web: { boxShadow: `0px 2px 8px ${colors.shadowBlue}` } as any,
    default: {
      shadowColor: "#005da8",
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.06,
      shadowRadius: 8,
      elevation: 2,
    },
  });

  return (
    <TouchableOpacity
      activeOpacity={0.95}
      onPress={() => onPress?.(post)}
      style={[styles.card, { backgroundColor: colors.surfaceContainerLowest }, cardShadow]}
    >
      {/* Author header */}
      <View style={styles.authorRow}>
        <TouchableOpacity style={styles.authorLeft} onPress={() => onAuthorPress?.(post.autorId)}>
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
              {post.mood ? `${post.mood} • ` : ""}
              {timeAgo}
            </Text>
          </View>
        </TouchableOpacity>
        <TouchableOpacity style={styles.moreBtn} onPress={() => onOptions?.(post)}>
          <MaterialIcons name="more-horiz" size={20} color={colors.onSurfaceVariant} />
        </TouchableOpacity>
      </View>

      {/* Content */}
      <Text style={[styles.contentText, { color: colors.onSurface }]}>{post.contenido}</Text>

      {/* Document attachment */}
      {docAttachment && (
        <View>
          <View
            style={[
              styles.docCard,
              {
                backgroundColor: `${colors.secondaryContainer}15`,
                borderColor: `${colors.secondaryContainer}30`,
              },
            ]}
          >
            <View style={[styles.docIcon, { backgroundColor: colors.secondaryContainer }]}>
              <MaterialIcons name="description" size={20} color={colors.onSurface} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={[styles.docName, { color: colors.onSurface }]}>
                {docAttachment.name || "Documento"}
              </Text>
              <Text style={{ fontSize: 11, color: colors.onSurfaceVariant }}>
                {docAttachment.size || ""} • Documento PDF
              </Text>
            </View>
            <MaterialIcons name="download" size={20} color={colors.onSurfaceVariant} />
          </View>
          <View style={styles.docActions}>
            {onAddToLibrary && (
              <TouchableOpacity
                style={[styles.docActionBtn, { backgroundColor: `${colors.primary}10` }]}
                onPress={() => onAddToLibrary(post, docAttachment)}
              >
                <MaterialIcons name="library-add" size={16} color={colors.primary} />
                <Text style={[styles.docActionText, { color: colors.primary }]}>
                  Añadir a biblioteca
                </Text>
              </TouchableOpacity>
            )}
            {onDownload && (
              <TouchableOpacity
                style={[styles.docActionBtn, { backgroundColor: `${colors.onSurfaceVariant}10` }]}
                onPress={() => onDownload(docAttachment)}
              >
                <MaterialIcons name="file-download" size={16} color={colors.onSurfaceVariant} />
                <Text style={[styles.docActionText, { color: colors.onSurfaceVariant }]}>
                  Descargar
                </Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      )}

      {/* Image attachment */}
      {imageAttachment && (
        <View style={styles.imageWrap}>
          <Image
            source={{ uri: imageAttachment.url }}
            style={styles.postImage}
            resizeMode="cover"
          />
        </View>
      )}

      {/* Challenge card */}
      {post.isChallenge && post.challengeData && (
        <View style={[styles.challengeCard, { backgroundColor: colors.surfaceContainerLow }]}>
          <View style={[styles.challengeBadge, { backgroundColor: colors.primary }]}>
            <Text style={styles.challengeBadgeText}>RETO</Text>
          </View>
          <Text style={[styles.challengeTitle, { color: colors.onSurface }]}>
            {post.challengeData.titulo}
          </Text>
          <Text style={{ color: colors.onSurfaceVariant, fontSize: 13, marginBottom: 12 }}>
            {post.challengeData.descripcion}
          </Text>
          <View style={{ flexDirection: "row", gap: 8 }}>
            <TouchableOpacity
              style={[styles.challengeBtn, { backgroundColor: colors.primary }]}
              onPress={() => onTakeChallenge?.(post)}
            >
              <MaterialIcons name="emoji-events" size={16} color="#FFF" />
              <Text style={styles.challengeBtnText}>Contestar ahora</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.challengeBtn,
                {
                  backgroundColor: "transparent",
                  borderWidth: 1,
                  borderColor: colors.outlineVariant,
                },
              ]}
              onPress={() => onSaveExam?.(post)}
            >
            >
              <Text style={{ color: colors.primary, fontWeight: "700", fontSize: 13 }}>
                Guardar examen
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* Action bar */}
      <View style={[styles.actionBar, { borderTopColor: `${colors.outlineVariant}15` }]}>
        {/* Left group: like, comment, download */}
        <View style={styles.actionGroupLeft}>
          <TouchableOpacity style={styles.actionBtn} onPress={() => onLike(post.id as number)}>
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
          </TouchableOpacity>

          <TouchableOpacity style={styles.actionBtn} onPress={() => onComment(post.id as number)}>
            <MaterialIcons name="chat-bubble-outline" size={22} color={colors.onSurfaceVariant} />
            {post.commentsCount > 0 && (
              <Text style={[styles.actionCount, { color: colors.onSurfaceVariant }]}>
                {post.commentsCount}
              </Text>
            )}
          </TouchableOpacity>

          {docAttachment && onDownload && (
            <TouchableOpacity style={styles.actionBtn} onPress={() => onDownload(docAttachment)}>
              <MaterialIcons name="download" size={22} color={colors.onSurfaceVariant} />
            </TouchableOpacity>
          )}
        </View>

        {/* Right group: bookmark, share */}
        <View style={styles.actionGroupRight}>
          <TouchableOpacity onPress={() => onSave(post.id as number)}>
            <MaterialIcons
              name={isSaved ? "bookmark" : "bookmark-border"}
              size={22}
              color={isSaved ? colors.primary : colors.onSurfaceVariant}
            />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => onShare(post.id as number)}>
            <MaterialIcons name="share" size={22} color={colors.onSurfaceVariant} />
          </TouchableOpacity>
        </View>
      </View>
    </TouchableOpacity>
  );
};

function getTimeAgo(dateStr: string): string {
  const now = Date.now();
  const date = new Date(dateStr).getTime();
  const diffMs = now - date;
  const diffMin = Math.floor(diffMs / 60000);
  if (diffMin < 1) return "Ahora";
  if (diffMin < 60) return `Hace ${diffMin} min`;
  const diffHours = Math.floor(diffMin / 60);
  if (diffHours < 24) return `Hace ${diffHours}h`;
  const diffDays = Math.floor(diffHours / 24);
  if (diffDays === 1) return "Ayer";
  if (diffDays < 7) return `Hace ${diffDays} días`;
  return new Date(dateStr).toLocaleDateString("es-MX", { day: "numeric", month: "short" });
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 12,
    overflow: "hidden",
  },
  authorRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 16,
    paddingBottom: 0,
  },
  authorLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    flex: 1,
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
  },
  avatarPlaceholder: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarInitials: {
    color: "#FFF",
    fontWeight: "700",
    fontSize: 15,
  },
  authorName: {
    fontWeight: "700",
    fontSize: 15,
  },
  authorMeta: {
    fontSize: 11,
    marginTop: 1,
    textTransform: "uppercase",
    fontWeight: "600",
    letterSpacing: 0.3,
  },
  moreBtn: {
    padding: 8,
  },
  contentText: {
    fontSize: 15,
    lineHeight: 22,
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 12,
  },
  docCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginHorizontal: 16,
    marginBottom: 12,
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
  },
  docIcon: {
    width: 40,
    height: 40,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  docName: {
    fontWeight: "700",
    fontSize: 13,
  },
  docActions: {
    flexDirection: "row",
    gap: 8,
    marginHorizontal: 16,
    marginBottom: 12,
    marginTop: -4,
  },
  docActionBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  docActionText: {
    fontSize: 12,
    fontWeight: "600",
  },
  imageWrap: {
    marginHorizontal: 0,
    marginBottom: 0,
  },
  postImage: {
    width: "100%",
    height: 220,
  },
  challengeCard: {
    marginHorizontal: 16,
    marginBottom: 12,
    padding: 16,
    borderRadius: 12,
  },
  challengeBadge: {
    alignSelf: "flex-start",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    marginBottom: 8,
  },
  challengeBadgeText: {
    color: "#FFF",
    fontSize: 10,
    fontWeight: "800",
    letterSpacing: 1,
  },
  challengeTitle: {
    fontWeight: "700",
    fontSize: 16,
    marginBottom: 4,
  },
  challengeBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 10,
  },
  challengeBtnText: {
    color: "#FFF",
    fontWeight: "700",
    fontSize: 13,
  },
  actionBar: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderTopWidth: 1,
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 8,
  },
  actionGroupLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 20,
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
    paddingVertical: 4,
  },
  actionCount: {
    fontSize: 12,
    fontWeight: "700",
  },
});

export default PostCard;
