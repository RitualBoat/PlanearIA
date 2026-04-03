import React from "react";
import { View, Text, StyleSheet, TouchableOpacity, Image, Platform } from "react-native";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { LinearGradient } from "expo-linear-gradient";
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

      {/* Challenge card — 4 variants */}
      {post.isChallenge &&
        post.challengeData &&
        (() => {
          const state =
            post.challengeState || (post.autorId === currentUserId ? "propio" : "sin_contestar");
          const cd = post.challengeData;

          if (state === "contestado") {
            /* ── Variant: Contestado (answered) ── */
            return (
              <View style={[styles.challengeCard, { backgroundColor: colors.surfaceContainerLow }]}>
                <View style={[styles.challengeBadge, { backgroundColor: `${colors.primary}15` }]}>
                  <MaterialIcons name="emoji-events" size={12} color={colors.primary} />
                  <Text style={[styles.challengeBadgeText, { color: colors.primary }]}>RETO</Text>
                </View>
                <Text style={[styles.challengeTitle, { color: colors.onSurface }]}>
                  {cd.titulo}
                </Text>
                {/* Score grid */}
                <View style={styles.challengeStatsGrid}>
                  <View
                    style={[
                      styles.challengeStatBox,
                      { backgroundColor: colors.surfaceContainerLowest },
                    ]}
                  >
                    <Text style={[styles.challengeStatValue, { color: "#1b6d24" }]}>
                      {cd.score ?? 8}/{cd.totalPreguntas ?? 10}
                    </Text>
                    <Text style={[styles.challengeStatLabel, { color: colors.onSurfaceVariant }]}>
                      Tu puntaje
                    </Text>
                  </View>
                  <View
                    style={[
                      styles.challengeStatBox,
                      { backgroundColor: colors.surfaceContainerLowest },
                    ]}
                  >
                    <Text style={[styles.challengeStatValue, { color: colors.primary }]}>
                      #{cd.ranking ?? 5} de {cd.totalParticipantes ?? 32}
                    </Text>
                    <Text style={[styles.challengeStatLabel, { color: colors.onSurfaceVariant }]}>
                      Tu ranking
                    </Text>
                  </View>
                </View>
                <View style={styles.challengeBtnRow}>
                  <TouchableOpacity
                    style={[styles.challengeOutlineBtn, { borderColor: `${colors.primary}20` }]}
                    onPress={() => onTakeChallenge?.(post)}
                  >
                    <Text style={[styles.challengeOutlineBtnText, { color: colors.primary }]}>
                      Ver mis respuestas
                    </Text>
                  </TouchableOpacity>
                  <LinearGradient
                    colors={["#004580", "#005da8"]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={styles.challengeGradientBtn}
                  >
                    <TouchableOpacity
                      style={styles.challengeGradientInner}
                      onPress={() => onTakeChallenge?.(post)}
                      activeOpacity={0.9}
                    >
                      <MaterialIcons name="refresh" size={16} color="#FFF" />
                      <Text style={styles.challengeBtnText}>Reintentar</Text>
                    </TouchableOpacity>
                  </LinearGradient>
                </View>
              </View>
            );
          }

          if (state === "cerrado") {
            /* ── Variant: Cerrado (closed) ── */
            return (
              <View style={[styles.challengeCard, { backgroundColor: colors.surfaceContainerLow }]}>
                <View
                  style={[
                    styles.challengeBadge,
                    { backgroundColor: `${colors.onSurfaceVariant}15` },
                  ]}
                >
                  <Text style={[styles.challengeBadgeText, { color: colors.onSurfaceVariant }]}>
                    RETO CERRADO
                  </Text>
                </View>
                <Text style={[styles.challengeTitle, { color: colors.onSurface }]}>
                  {cd.titulo}
                </Text>
                <View
                  style={[
                    styles.challengeAlertBox,
                    { backgroundColor: `${colors.onSurfaceVariant}08` },
                  ]}
                >
                  <MaterialIcons name="event-busy" size={16} color={colors.onSurfaceVariant} />
                  <Text style={[styles.challengeAlertText, { color: colors.onSurfaceVariant }]}>
                    Este reto ya no acepta respuestas
                  </Text>
                </View>
                <View style={styles.challengeBtnRow}>
                  <TouchableOpacity
                    style={[
                      styles.challengeDisabledBtn,
                      { backgroundColor: `${colors.onSurfaceVariant}08` },
                    ]}
                    disabled
                  >
                    <MaterialIcons name="lock" size={14} color={`${colors.onSurfaceVariant}50`} />
                    <Text
                      style={{
                        color: `${colors.onSurfaceVariant}50`,
                        fontWeight: "700",
                        fontSize: 13,
                      }}
                    >
                      Cerrado
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.challengeOutlineBtn, { borderColor: `${colors.primary}20` }]}
                    onPress={() => onTakeChallenge?.(post)}
                  >
                    <Text style={[styles.challengeOutlineBtnText, { color: colors.primary }]}>
                      Ver resultados
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            );
          }

          if (state === "propio") {
            /* ── Variant: Propio (own challenge) ── */
            return (
              <View style={[styles.challengeCard, { backgroundColor: colors.surfaceContainerLow }]}>
                <View style={[styles.challengeBadge, { backgroundColor: "#004580" }]}>
                  <MaterialIcons name="auto-awesome" size={12} color="#FFF" />
                  <Text style={styles.challengeOwnerBadgeText}>TU RETO</Text>
                </View>
                <Text style={[styles.challengeTitle, { color: colors.onSurface }]}>
                  {cd.titulo}
                </Text>
                {/* Stats 3-col grid */}
                <View style={styles.challengeStatsGrid3}>
                  <View
                    style={[
                      styles.challengeStat3Col,
                      { backgroundColor: colors.surfaceContainerLowest },
                    ]}
                  >
                    <Text style={[styles.challengeStatValue, { color: "#1b6d24" }]}>
                      {cd.participantesActivos ?? 12}
                    </Text>
                    <Text style={[styles.challengeStatLabel, { color: colors.onSurfaceVariant }]}>
                      P. Activos
                    </Text>
                  </View>
                  <View
                    style={[
                      styles.challengeStat3Col,
                      { backgroundColor: colors.surfaceContainerLowest },
                    ]}
                  >
                    <Text style={[styles.challengeStatValue, { color: colors.primary }]}>
                      {cd.promedio ?? 7.2}
                    </Text>
                    <Text style={[styles.challengeStatLabel, { color: colors.onSurfaceVariant }]}>
                      Promedio
                    </Text>
                  </View>
                  <View
                    style={[
                      styles.challengeStat3Col,
                      { backgroundColor: colors.surfaceContainerLowest },
                    ]}
                  >
                    <Text style={[styles.challengeStatValue, { color: "#1b6d24" }]}>
                      {cd.mejorPuntaje ?? 10}
                    </Text>
                    <Text style={[styles.challengeStatLabel, { color: colors.onSurfaceVariant }]}>
                      Mejor
                    </Text>
                  </View>
                </View>
                <View style={styles.challengeBtnRow}>
                  <LinearGradient
                    colors={["#004580", "#005da8"]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={[styles.challengeGradientBtn, { flex: 1 }]}
                  >
                    <TouchableOpacity
                      style={styles.challengeGradientInner}
                      onPress={() => onTakeChallenge?.(post)}
                      activeOpacity={0.9}
                    >
                      <MaterialIcons name="bar-chart" size={16} color="#FFF" />
                      <Text style={styles.challengeBtnText}>Ver estadísticas</Text>
                    </TouchableOpacity>
                  </LinearGradient>
                  <TouchableOpacity
                    style={[
                      styles.challengeSecondaryBtn,
                      { backgroundColor: `${colors.onSurfaceVariant}08` },
                    ]}
                    onPress={() => onSaveExam?.(post)}
                  >
                    <Text
                      style={{ color: colors.onSurfaceVariant, fontWeight: "700", fontSize: 13 }}
                    >
                      Editar reto
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            );
          }

          /* ── Default: Sin contestar ── */
          return (
            <View style={[styles.challengeCard, { backgroundColor: colors.surfaceContainerLow }]}>
              <View style={[styles.challengeBadge, { backgroundColor: colors.primary }]}>
                <Text style={styles.challengeOwnerBadgeText}>RETO</Text>
              </View>
              <Text style={[styles.challengeTitle, { color: colors.onSurface }]}>{cd.titulo}</Text>
              <Text style={{ color: colors.onSurfaceVariant, fontSize: 13, marginBottom: 12 }}>
                {cd.descripcion}
              </Text>
              <View style={styles.challengeBtnRow}>
                <LinearGradient
                  colors={["#004580", "#005da8"]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={[styles.challengeGradientBtn, { flex: 1 }]}
                >
                  <TouchableOpacity
                    style={styles.challengeGradientInner}
                    onPress={() => onTakeChallenge?.(post)}
                    activeOpacity={0.9}
                  >
                    <MaterialIcons name="emoji-events" size={16} color="#FFF" />
                    <Text style={styles.challengeBtnText}>Contestar ahora</Text>
                  </TouchableOpacity>
                </LinearGradient>
                <TouchableOpacity
                  style={[
                    styles.challengeSecondaryBtn,
                    { backgroundColor: `${colors.onSurfaceVariant}08` },
                  ]}
                  onPress={() => onSaveExam?.(post)}
                >
                  <Text style={{ color: colors.onSurfaceVariant, fontWeight: "700", fontSize: 13 }}>
                    Guardar examen
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          );
        })()}

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
    borderRadius: 16,
    gap: 8,
  },
  challengeBadge: {
    alignSelf: "flex-start",
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    marginBottom: 4,
  },
  challengeBadgeText: {
    fontSize: 10,
    fontWeight: "800",
    letterSpacing: 1,
  },
  challengeOwnerBadgeText: {
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
  challengeBtnRow: {
    flexDirection: "row",
    gap: 8,
    marginTop: 4,
  },
  challengeGradientBtn: {
    borderRadius: 10,
    flex: 1,
  },
  challengeGradientInner: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    paddingVertical: 10,
  },
  challengeBtnText: {
    color: "#FFF",
    fontWeight: "700",
    fontSize: 13,
  },
  challengeOutlineBtn: {
    flex: 1,
    borderWidth: 2,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 10,
  },
  challengeOutlineBtnText: {
    fontWeight: "700",
    fontSize: 13,
  },
  challengeSecondaryBtn: {
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  challengeDisabledBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    borderRadius: 10,
    paddingVertical: 10,
  },
  challengeStatsGrid: {
    flexDirection: "row",
    gap: 8,
    marginVertical: 8,
  },
  challengeStatBox: {
    flex: 1,
    borderRadius: 12,
    padding: 12,
    alignItems: "center",
    gap: 4,
  },
  challengeStatsGrid3: {
    flexDirection: "row",
    gap: 6,
    marginVertical: 8,
  },
  challengeStat3Col: {
    flex: 1,
    borderRadius: 10,
    padding: 10,
    alignItems: "center",
    gap: 2,
  },
  challengeStatValue: {
    fontWeight: "800",
    fontSize: 16,
  },
  challengeStatLabel: {
    fontSize: 10,
    fontWeight: "600",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  challengeAlertBox: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    padding: 12,
    borderRadius: 10,
    marginBottom: 4,
  },
  challengeAlertText: {
    fontSize: 12,
    fontWeight: "600",
    flex: 1,
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
