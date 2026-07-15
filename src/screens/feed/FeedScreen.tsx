import React, { useState, useEffect, useMemo } from "react";
import {
  Pressable,
  View,
  Text,
  StyleSheet,
  FlatList,
  RefreshControl,
  useWindowDimensions,
  Platform,
} from "react-native";
import Animated, { useSharedValue, withRepeat, withTiming, useAnimatedStyle, interpolateColor } from "react-native-reanimated";
import { SafeAreaView } from "react-native-safe-area-context";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { LinearGradient } from "expo-linear-gradient";
import { useNavigation, useRoute } from "@react-navigation/native";
import { useTheme } from "../../context/ThemeContext";
import { useFeedViewModel } from "../../hooks/useFeedViewModel";
import PostCard from "../../components/PostCard";
import CreatePostModal from "../../components/CreatePostModal";
import PostOptionsSheet from "../../components/PostOptionsSheet";
import ReportPostModal from "../../components/ReportPostModal";
import { Post } from "../../../types";

/* ── Skeleton shimmer ── */
const ShimmerBlock: React.FC<{
  width: number | string;
  height: number;
  borderRadius?: number;
  style?: any;
}> = ({ width, height, borderRadius = 8, style }) => {
  const anim = useSharedValue(0);
  const { colors } = useTheme();

  useEffect(() => {
    anim.value = withRepeat(withTiming(1, { duration: 750 }), -1, true);
  }, [anim]);

  const animatedStyle = useAnimatedStyle(() => ({
    width: typeof width === "number" ? width : ("100%" as any),
    height,
    borderRadius,
    backgroundColor: interpolateColor(
      anim.value,
      [0, 1],
      [colors.surfaceContainerHigh, colors.surfaceContainerLow]
    ),
  }));

  return (
    <Animated.View style={[animatedStyle, style]} />
  );
};

const SkeletonPostCard: React.FC = () => {
  const { colors } = useTheme();
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
    <View
      style={[
        { backgroundColor: colors.surfaceContainerLowest, borderRadius: 12, padding: 16, gap: 12 },
        cardShadow,
      ]}
    >
      <View style={{ flexDirection: "row", alignItems: "center", gap: 12 }}>
        <ShimmerBlock width={44} height={44} borderRadius={22} />
        <View style={{ flex: 1, gap: 6 }}>
          <ShimmerBlock width="50%" height={14} />
          <ShimmerBlock width="30%" height={10} />
        </View>
        <ShimmerBlock width={24} height={24} borderRadius={12} />
      </View>
      <ShimmerBlock width="100%" height={14} />
      <ShimmerBlock width="100%" height={14} />
      <ShimmerBlock width="80%" height={14} />
      <ShimmerBlock width="100%" height={180} borderRadius={12} />
      <View style={{ flexDirection: "row", justifyContent: "space-between", paddingTop: 8 }}>
        <ShimmerBlock width={60} height={20} borderRadius={10} />
        <ShimmerBlock width={60} height={20} borderRadius={10} />
        <ShimmerBlock width={60} height={20} borderRadius={10} />
      </View>
    </View>
  );
};

const FeedScreen: React.FC = () => {
  const { colors } = useTheme();
  const { width } = useWindowDimensions();
  const vm = useFeedViewModel();
  const navigation = useNavigation<any>();
  const route = useRoute<any>();

  const isDesktop = width >= 768;

  const refreshControl = useMemo(
    () => (
      <RefreshControl
        refreshing={vm.isRefreshing}
        onRefresh={vm.handleRefresh}
        tintColor={colors.primary}
        colors={[colors.primary]}
      />
    ),
    [vm.isRefreshing, vm.handleRefresh, colors.primary]
  );

  const [optionsPost, setOptionsPost] = useState<Post | null>(null);
  const [showReportModal, setShowReportModal] = useState(false);

  useEffect(() => {
    if (route.params?.openCreatePost) {
      if (route.params.attachmentToShare) {
        // En una implementación completa el ViewModel recibiría el attachment inicial
        // Por ahora, solo abrimos el modal
        vm.handleOpenCreateModal();
      } else {
        vm.handleOpenCreateModal();
      }
      // Limpiamos los parámetros para que no se vuelva a abrir
      navigation.setParams({ openCreatePost: undefined, attachmentToShare: undefined });
    }
  }, [route.params, vm.handleOpenCreateModal, navigation]);

  /* ── Post creation bar ── */
  const renderCreateBar = () => {
    const initials = vm.userName
      .split(" ")
      .map((w) => w[0])
      .slice(0, 2)
      .join("")
      .toUpperCase();

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
      <View
        style={[styles.createBar, { backgroundColor: colors.surfaceContainerLowest }, cardShadow]}
      >
        <View style={styles.createBarTop}>
          <View style={[styles.createAvatar, { backgroundColor: colors.primary }]}>
            <Text style={styles.createAvatarText}>{initials}</Text>
          </View>
          <Pressable
            style={({ pressed }) => [
              styles.createInput,
              { backgroundColor: colors.surfaceContainerLow },
              pressed && { opacity: 0.6 },
            ]}
            onPress={vm.handleOpenCreateModal}
          >
            <Text
              style={{ color: `${colors.onSurfaceVariant}90`, fontSize: 14, fontWeight: "500" }}
            >
              ¿Qué quieres compartir hoy?
            </Text>
          </Pressable>
        </View>
        <View style={styles.createBarActions}>
          <Pressable
            style={({ pressed }) => [styles.createBarBtn, pressed && { opacity: 0.6 }]}
            onPress={vm.handleOpenCreateModal}
          >
            <MaterialIcons name="image" size={20} color={colors.onSurfaceVariant} />
          </Pressable>
          <Pressable
            style={({ pressed }) => [styles.createBarBtn, pressed && { opacity: 0.6 }]}
            onPress={vm.handleOpenCreateModal}
          >
            <MaterialIcons name="attach-file" size={20} color={colors.onSurfaceVariant} />
          </Pressable>
          <Pressable
            style={({ pressed }) => [styles.createBarBtn, pressed && { opacity: 0.6 }]}
            onPress={vm.handleOpenCreateModal}
          >
            <MaterialIcons name="mood" size={20} color={colors.onSurfaceVariant} />
          </Pressable>
          <Pressable
            style={({ pressed }) => pressed && { opacity: 0.6 }}
            onPress={vm.handleOpenCreateModal}
          >
            <LinearGradient
              colors={[colors.primary, colors.primaryContainer]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.publishSmallBtn}
            >
              <Text style={styles.publishSmallBtnText}>Publicar</Text>
            </LinearGradient>
          </Pressable>
        </View>
      </View>
    );
  };

  /* ── Empty state ── */
  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      {/* Decorative glow */}
      <View style={[styles.emptyGlow, { backgroundColor: `${colors.primaryContainer}08` }]} />
      <View
        style={[
          styles.emptyImageBox,
          {
            backgroundColor: colors.surfaceContainerLow,
            borderColor: `${colors.outlineVariant}15`,
          },
        ]}
      >
        <MaterialIcons name="groups" size={56} color={colors.primary} />
        {/* Floating icon */}
        <View
          style={[
            styles.emptyFloatingIcon,
            {
              backgroundColor: colors.surfaceContainerLowest,
              ...Platform.select({
                web: { boxShadow: "0px 4px 12px rgba(0,69,128,0.1)" } as any,
                default: {
                  shadowColor: "#004580",
                  shadowOffset: { width: 0, height: 4 },
                  shadowOpacity: 0.1,
                  shadowRadius: 12,
                  elevation: 4,
                },
              }),
            },
          ]}
        >
          <MaterialIcons name="group-add" size={20} color={colors.primary} />
        </View>
      </View>
      <Text style={[styles.emptyTitle, { color: colors.primary }]}>
        ¡Bienvenido a la comunidad docente!
      </Text>
      <Text style={[styles.emptyDesc, { color: colors.onSurfaceVariant }]}>
        Sé el primero en compartir tus experiencias, recursos y planeaciones con otros docentes.
        {"\n"}Usa el botón <Text style={{ fontWeight: "800", color: colors.primary }}>+</Text> para
        crear tu primera publicación.
      </Text>
      {/* Decorative separator */}
      <View style={[styles.emptySeparator, { backgroundColor: `${colors.primary}15` }]} />
    </View>
  );

  /* ── Error state ── */
  const renderErrorState = () => (
    <View style={styles.emptyContainer}>
      <View style={styles.errorIconContainer}>
        {/* Background glow */}
        <View style={[styles.errorGlow, { backgroundColor: colors.surfaceContainerLow }]} />
        <View
          style={[
            styles.errorIconBox,
            {
              backgroundColor: colors.surfaceContainerLowest,
              ...Platform.select({
                web: { boxShadow: "0px 24px 48px rgba(0,72,132,0.08)" } as any,
                default: {
                  shadowColor: "#004884",
                  shadowOffset: { width: 0, height: 24 },
                  shadowOpacity: 0.08,
                  shadowRadius: 48,
                  elevation: 4,
                },
              }),
            },
          ]}
        >
          <MaterialIcons name="cloud-off" size={48} color={colors.primaryContainer} />
        </View>
        {/* Error overlay badge */}
        <View
          style={[
            styles.errorBadge,
            {
              backgroundColor: colors.error,
              borderColor: colors.background,
            },
          ]}
        >
          <MaterialIcons name="wifi-off" size={14} color="#FFF" />
        </View>
      </View>
      <Text style={[styles.emptyTitle, { color: colors.onSurface }]}>
        No pudimos cargar las publicaciones
      </Text>
      <Text style={[styles.emptyDesc, { color: colors.onSurfaceVariant }]}>
        Revisa tu conexión e intenta de nuevo
      </Text>
      <Pressable
        onPress={vm.handleRefresh}
        style={({ pressed }) => [
          styles.retryBtn,
          { borderColor: colors.primaryContainer },
          pressed && { opacity: 0.85 },
        ]}
      >
        <MaterialIcons name="refresh" size={20} color={colors.primaryContainer} />
        <Text style={[styles.retryBtnText, { color: colors.primaryContainer }]}>Reintentar</Text>
      </Pressable>
      <View style={[styles.errorTipContainer, { borderTopColor: `${colors.outlineVariant}30` }]}>
        <Text style={[styles.errorTipText, { color: colors.onSurfaceVariant }]}>
          Si el problema persiste, tus publicaciones guardadas siguen disponibles offline.
        </Text>
      </View>
    </View>
  );

  /* ── Loading state ── */
  if (vm.isLoading) {
    return (
      <SafeAreaView style={[styles.safe, { backgroundColor: colors.background }]} edges={["top"]}>
        <View style={styles.headerBar}>
          <Text style={[styles.headerTitle, { color: colors.primary }]}>Comunidad</Text>
          <View style={{ width: 40 }} />
        </View>
        <View style={[styles.feedContainer, isDesktop && styles.feedContainerDesktop]}>
          <View style={{ gap: 16, padding: 16, maxWidth: 640, width: "100%", alignSelf: "center" }}>
            {[1, 2, 3].map((i) => (
              <SkeletonPostCard key={i} />
            ))}
          </View>
        </View>
      </SafeAreaView>
    );
  }

  /* ── Main feed ── */
  const renderItem = ({ item }: { item: Post }) => (
    <PostCard
      post={item}
      currentUserId={vm.userId}
      onLike={vm.handleLike}
      onComment={(postId) => {
        navigation.navigate("PostDetail", { postId, userId: vm.userId });
      }}
      onSave={vm.handleSave}
      onShare={vm.handleShare}
      onAddToLibrary={vm.handleAddToLibrary}
      onDownload={vm.handleDownload}
      onTakeChallenge={(post) => {
        if (vm.isGuest) {
          vm.handleTakeChallenge(post);
          return;
        }
        navigation.navigate("RetoResolucion", {
          titulo: post.challengeData?.titulo,
          descripcion: post.challengeData?.descripcion,
          tiempoLimite: post.challengeData?.tiempoLimite,
          preguntas: post.challengeData?.preguntas,
        });
      }}
      onSaveExam={vm.handleSaveExam}
      onPress={(post) => {
        navigation.navigate("PostDetail", { postId: post.id, userId: vm.userId });
      }}
      onOptions={(post) => setOptionsPost(post)}
    />
  );

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: colors.background }]} edges={["top"]}>
      {/* Header */}
      <View style={styles.headerBar}>
        <Text style={[styles.headerTitle, { color: colors.primary }]}>Comunidad</Text>
        <View style={{ width: 40 }} />
      </View>

      <View style={[styles.feedContainer, isDesktop && styles.feedContainerDesktop]}>
        {vm.error ? (
          renderErrorState()
        ) : (
          <FlatList
            data={vm.posts}
            keyExtractor={(item) => item.id.toString()}
            renderItem={renderItem}
            contentContainerStyle={[
              styles.listContent,
              isDesktop && { maxWidth: 640, alignSelf: "center", width: "100%" },
            ]}
            ListHeaderComponent={renderCreateBar}
            ListEmptyComponent={renderEmptyState}
            refreshControl={refreshControl}
            ItemSeparatorComponent={() => <View style={{ height: 16 }} />}
            showsVerticalScrollIndicator={false}
          />
        )}
      </View>

      {/* FAB */}
      <Pressable
        style={({ pressed }) => [styles.fabWrap, pressed && { opacity: 0.85 }]}
        onPress={vm.handleOpenCreateModal}
      >
        <LinearGradient
          colors={[colors.primary, colors.primaryContainer]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.fab}
        >
          <MaterialIcons name="add" size={28} color="#FFF" />
        </LinearGradient>
      </Pressable>

      {/* Create post modal */}
      <CreatePostModal
        visible={vm.isCreateModalVisible}
        onClose={vm.handleCloseCreateModal}
        onPublish={vm.handlePublishPost}
        authorName={vm.userName}
      />

      {/* Post options sheet */}
      <PostOptionsSheet
        visible={!!optionsPost}
        onClose={() => setOptionsPost(null)}
        isOwnPost={optionsPost?.autorId === vm.userId}
        onEdit={() => {
          // Stub
        }}
        onDelete={() => {
          // Stub
        }}
        onSaveToLibrary={() => {
          if (optionsPost) vm.handleSave(optionsPost.id as number);
        }}
        onReport={() => {
          setOptionsPost(null);
          setShowReportModal(true);
        }}
      />

      {/* Report modal */}
      <ReportPostModal
        visible={showReportModal}
        onClose={() => setShowReportModal(false)}
        onSubmit={() => {
          setShowReportModal(false);
        }}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safe: { flex: 1 },
  headerBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: "800",
    letterSpacing: -0.3,
  },
  notifBtn: {
    position: "relative",
    padding: 8,
  },
  notifDot: {
    position: "absolute",
    top: 8,
    right: 8,
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  feedContainer: {
    flex: 1,
  },
  feedContainerDesktop: {
    flexDirection: "row",
    justifyContent: "center",
  },
  listContent: {
    padding: 16,
    paddingBottom: 100,
    gap: 16,
  },
  createBar: {
    borderRadius: 12,
    padding: 16,
    gap: 12,
  },
  createBarTop: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  createAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  createAvatarText: {
    color: "#FFF",
    fontWeight: "700",
    fontSize: 14,
  },
  createInput: {
    flex: 1,
    height: 40,
    borderRadius: 20,
    paddingHorizontal: 16,
    justifyContent: "center",
  },
  createBarActions: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingLeft: 4,
  },
  createBarBtn: {
    padding: 8,
  },
  publishSmallBtn: {
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 20,
  },
  publishSmallBtnText: {
    color: "#FFF",
    fontWeight: "700",
    fontSize: 13,
  },
  emptyContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 32,
    paddingVertical: 60,
    gap: 16,
  },
  /* Empty state styles */
  emptyGlow: {
    position: "absolute",
    top: -40,
    width: 200,
    height: 200,
    borderRadius: 100,
    opacity: 0.6,
  },
  emptyImageBox: {
    width: 128,
    height: 128,
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 24,
    borderWidth: 1,
    transform: [{ rotate: "-3deg" }],
  },
  emptyFloatingIcon: {
    position: "absolute",
    top: -12,
    right: -8,
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    transform: [{ rotate: "12deg" }],
  },
  emptyTitle: {
    fontSize: 28,
    fontWeight: "800",
    textAlign: "center",
    letterSpacing: -0.3,
    lineHeight: 32,
  },
  emptyDesc: {
    fontSize: 16,
    textAlign: "center",
    lineHeight: 24,
    paddingHorizontal: 8,
  },
  emptyCTABtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 12,
    marginTop: 8,
    ...Platform.select({
      web: { boxShadow: "0px 4px 12px rgba(0,69,128,0.15)" } as any,
      default: {
        shadowColor: "#004580",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.15,
        shadowRadius: 12,
        elevation: 4,
      },
    }),
  },
  emptyCTAText: {
    color: "#FFF",
    fontWeight: "700",
    fontSize: 16,
  },
  emptySeparator: {
    width: 96,
    height: 4,
    borderRadius: 2,
    marginTop: 40,
  },
  /* Error state styles */
  errorIconContainer: {
    position: "relative",
    marginBottom: 24,
  },
  errorGlow: {
    position: "absolute",
    top: -16,
    left: -16,
    right: -16,
    bottom: -16,
    borderRadius: 100,
    opacity: 0.6,
  },
  errorIconBox: {
    width: 128,
    height: 128,
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
  },
  errorBadge: {
    position: "absolute",
    bottom: -8,
    right: -8,
    width: 32,
    height: 32,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 3,
    ...Platform.select({
      web: { boxShadow: "0px 4px 8px rgba(0,0,0,0.15)" } as any,
      default: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.15,
        shadowRadius: 8,
        elevation: 4,
      },
    }),
  },
  retryBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 12,
    borderWidth: 2,
    marginTop: 8,
  },
  retryBtnText: {
    fontWeight: "700",
    fontSize: 16,
  },
  errorTipContainer: {
    paddingTop: 24,
    borderTopWidth: 1,
    marginTop: 24,
  },
  errorTipText: {
    fontSize: 14,
    fontStyle: "italic",
    textAlign: "center",
    lineHeight: 20,
    opacity: 0.8,
  },
  fabWrap: {
    position: "absolute",
    right: 20,
    bottom: 24,
  },
  fab: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: "center",
    justifyContent: "center",
    ...Platform.select({
      web: { boxShadow: "0px 8px 24px rgba(0,93,168,0.3)" } as any,
      default: {
        shadowColor: "#005da8",
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.3,
        shadowRadius: 24,
        elevation: 6,
      },
    }),
  },
});

export default FeedScreen;
