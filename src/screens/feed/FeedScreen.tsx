import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  RefreshControl,
  useWindowDimensions,
  Platform,
  Animated,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { LinearGradient } from "expo-linear-gradient";
import { useNavigation } from "@react-navigation/native";
import { useTheme } from "../../context/ThemeContext";
import { useFeedViewModel } from "../../hooks/useFeedViewModel";
import PostCard from "../../components/PostCard";
import CreatePostModal from "../../components/CreatePostModal";
import { Post } from "../../../types";

/* ── Skeleton shimmer ── */
const ShimmerBlock: React.FC<{
  width: number | string;
  height: number;
  borderRadius?: number;
  style?: any;
}> = ({ width, height, borderRadius = 8, style }) => {
  const [anim] = useState(() => new Animated.Value(0));
  const { colors } = useTheme();
  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(anim, { toValue: 1, duration: 750, useNativeDriver: false }),
        Animated.timing(anim, { toValue: 0, duration: 750, useNativeDriver: false }),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, [anim]);
  const bg = anim.interpolate({
    inputRange: [0, 1],
    outputRange: [colors.surfaceContainerHigh, colors.surfaceContainerLow],
  });
  return (
    <Animated.View
      style={[{ width: width as any, height, borderRadius, backgroundColor: bg }, style]}
    />
  );
};

const SkeletonPostCard: React.FC = () => {
  const { colors } = useTheme();
  const cardShadow = Platform.select({
    web: { boxShadow: `0px 12px 32px ${colors.shadowBlue}` } as any,
    default: {
      shadowColor: "#005da8",
      shadowOffset: { width: 0, height: 12 },
      shadowOpacity: 0.06,
      shadowRadius: 32,
      elevation: 3,
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

  const isDesktop = width >= 768;

  /* ── Post creation bar ── */
  const renderCreateBar = () => {
    const initials = vm.userName
      .split(" ")
      .map((w) => w[0])
      .slice(0, 2)
      .join("")
      .toUpperCase();

    const cardShadow = Platform.select({
      web: { boxShadow: `0px 12px 32px ${colors.shadowBlue}` } as any,
      default: {
        shadowColor: "#005da8",
        shadowOffset: { width: 0, height: 12 },
        shadowOpacity: 0.06,
        shadowRadius: 32,
        elevation: 3,
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
          <TouchableOpacity
            style={[styles.createInput, { backgroundColor: colors.surfaceContainerLow }]}
            onPress={vm.handleOpenCreateModal}
          >
            <Text
              style={{ color: `${colors.onSurfaceVariant}90`, fontSize: 14, fontWeight: "500" }}
            >
              ¿Qué quieres compartir hoy?
            </Text>
          </TouchableOpacity>
        </View>
        <View style={styles.createBarActions}>
          <TouchableOpacity style={styles.createBarBtn} onPress={vm.handleOpenCreateModal}>
            <MaterialIcons name="image" size={20} color={colors.onSurfaceVariant} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.createBarBtn} onPress={vm.handleOpenCreateModal}>
            <MaterialIcons name="attach-file" size={20} color={colors.onSurfaceVariant} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.createBarBtn} onPress={vm.handleOpenCreateModal}>
            <MaterialIcons name="mood" size={20} color={colors.onSurfaceVariant} />
          </TouchableOpacity>
          <TouchableOpacity onPress={vm.handleOpenCreateModal}>
            <LinearGradient
              colors={[colors.primary, colors.primaryContainer]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.publishSmallBtn}
            >
              <Text style={styles.publishSmallBtnText}>Publicar</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  /* ── Empty state ── */
  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      <View style={[styles.emptyIconWrap, { backgroundColor: colors.surfaceContainerHigh }]}>
        <MaterialIcons name="groups" size={56} color={colors.primary} />
      </View>
      <Text style={[styles.emptyTitle, { color: colors.onSurface }]}>
        ¡Bienvenido a la comunidad docente!
      </Text>
      <Text style={[styles.emptyDesc, { color: colors.onSurfaceVariant }]}>
        Comparte tus experiencias, recursos y planeaciones con otros docentes.
      </Text>
      <TouchableOpacity onPress={vm.handleOpenCreateModal}>
        <LinearGradient
          colors={[colors.primary, colors.primaryContainer]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.emptyCTABtn}
        >
          <Text style={styles.emptyCTAText}>Crear mi primera publicación</Text>
        </LinearGradient>
      </TouchableOpacity>
    </View>
  );

  /* ── Error state ── */
  const renderErrorState = () => (
    <View style={styles.emptyContainer}>
      <View style={[styles.emptyIconWrap, { backgroundColor: colors.surfaceContainerHigh }]}>
        <MaterialIcons name="cloud-off" size={56} color={colors.primary} />
      </View>
      <Text style={[styles.emptyTitle, { color: colors.onSurface }]}>
        No pudimos cargar las publicaciones
      </Text>
      <Text style={[styles.emptyDesc, { color: colors.onSurfaceVariant }]}>
        Revisa tu conexión e intenta de nuevo
      </Text>
      <TouchableOpacity onPress={vm.handleRefresh}>
        <LinearGradient
          colors={[colors.primary, colors.primaryContainer]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.emptyCTABtn}
        >
          <MaterialIcons name="refresh" size={18} color="#FFF" />
          <Text style={styles.emptyCTAText}>Reintentar</Text>
        </LinearGradient>
      </TouchableOpacity>
    </View>
  );

  /* ── Loading state ── */
  if (vm.isLoading) {
    return (
      <SafeAreaView style={[styles.safe, { backgroundColor: colors.background }]} edges={["top"]}>
        <View style={styles.headerBar}>
          <Text style={[styles.headerTitle, { color: colors.primary }]}>Comunidad</Text>
          <TouchableOpacity style={styles.notifBtn}>
            <MaterialIcons name="notifications-none" size={24} color={colors.onSurfaceVariant} />
          </TouchableOpacity>
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
      onComment={vm.handleComment}
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
    />
  );

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: colors.background }]} edges={["top"]}>
      {/* Header */}
      <View style={styles.headerBar}>
        <Text style={[styles.headerTitle, { color: colors.primary }]}>Comunidad</Text>
        <TouchableOpacity style={styles.notifBtn}>
          <MaterialIcons name="notifications-none" size={24} color={colors.onSurfaceVariant} />
          <View style={[styles.notifDot, { backgroundColor: colors.error }]} />
        </TouchableOpacity>
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
            refreshControl={
              <RefreshControl
                refreshing={vm.isRefreshing}
                onRefresh={vm.handleRefresh}
                tintColor={colors.primary}
                colors={[colors.primary]}
              />
            }
            ItemSeparatorComponent={() => <View style={{ height: 16 }} />}
            showsVerticalScrollIndicator={false}
          />
        )}
      </View>

      {/* FAB */}
      <TouchableOpacity
        style={styles.fabWrap}
        onPress={vm.handleOpenCreateModal}
        activeOpacity={0.85}
      >
        <LinearGradient
          colors={[colors.primary, colors.primaryContainer]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.fab}
        >
          <MaterialIcons name="add" size={28} color="#FFF" />
        </LinearGradient>
      </TouchableOpacity>

      {/* Create post modal */}
      <CreatePostModal
        visible={vm.isCreateModalVisible}
        onClose={vm.handleCloseCreateModal}
        onPublish={vm.handlePublishPost}
        authorName={vm.userName}
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
  emptyIconWrap: {
    width: 96,
    height: 96,
    borderRadius: 48,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 8,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: "800",
    textAlign: "center",
  },
  emptyDesc: {
    fontSize: 14,
    textAlign: "center",
    lineHeight: 20,
  },
  emptyCTABtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 14,
    marginTop: 8,
  },
  emptyCTAText: {
    color: "#FFF",
    fontWeight: "700",
    fontSize: 15,
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
