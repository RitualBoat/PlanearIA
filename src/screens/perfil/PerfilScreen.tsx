import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  useWindowDimensions,
  Platform,
  Animated,
  Share,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import { StackNavigationProp } from "@react-navigation/stack";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { LinearGradient } from "expo-linear-gradient";
import { RootStackParamList } from "../../navigation/StackNavigator";
import { useAuth } from "../../context/AuthContext";
import { usePlaneaciones } from "../../context/PlaneacionesContext";
import { useGruposContext } from "../../context/GruposContext";
import { useRecursos } from "../../context/RecursosContext";
import { useTheme } from "../../context/ThemeContext";
import Toast, { type ToastConfig } from "../../components/Toast";
import ExpandedStatsModal, { type ExpandedStatsData } from "../../components/ExpandedStatsModal";
import { getRoleLabel } from "../../../types";

type Nav = StackNavigationProp<RootStackParamList>;

/* ── Skeleton shimmer (loading state) ── */
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

const PerfilScreen: React.FC = () => {
  const navigation = useNavigation<Nav>();
  const { usuario, isGuest } = useAuth();
  const { planeaciones } = usePlaneaciones();
  const { grupos } = useGruposContext();
  const { recursos } = useRecursos();
  const { colors } = useTheme();
  const { width } = useWindowDimensions();

  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [toast, setToast] = useState<ToastConfig | null>(null);
  const [showToast, setShowToast] = useState(false);
  const [expandedStat, setExpandedStat] = useState<ExpandedStatsData | null>(null);

  useEffect(() => {
    const t = setTimeout(() => setIsLoading(false), 600);
    return () => clearTimeout(t);
  }, []);

  const isDesktop = width >= 768;
  const userName = usuario
    ? `${usuario.nombre}${usuario.apellidos ? ` ${usuario.apellidos}` : ""}`
    : "Usuario";
  const userRole = isGuest ? "Invitado" : usuario?.rol ? getRoleLabel(usuario.rol) : "Docente";
  const initials = usuario
    ? `${usuario.nombre?.[0] || ""}${usuario.apellidos?.[0] || ""}`.toUpperCase()
    : "U";
  const isNewUser =
    !isGuest && planeaciones.length === 0 && grupos.length === 0 && recursos.length === 0;
  const memberSince = usuario?.fechaCreacion
    ? new Date(usuario.fechaCreacion).toLocaleDateString("es-MX", {
        month: "long",
        year: "numeric",
      })
    : null;

  const stats = [
    { icon: "description", value: planeaciones.length, label: "PLANEACIONES" },
    { icon: "groups", value: grupos.length, label: "GRUPOS" },
    { icon: "library-books", value: recursos.length, label: "RECURSOS" },
    { icon: "assignment", value: 0, label: "ENTREGABLES" },
  ];

  const showToastMessage = useCallback((config: ToastConfig) => {
    setToast(config);
    setShowToast(true);
  }, []);

  const handleShare = useCallback(async () => {
    const profileUrl = `https://planearia.app/perfil/${usuario?.id || ""}`;
    if (Platform.OS === "web") {
      try {
        await navigator.clipboard.writeText(profileUrl);
        showToastMessage({ message: "Enlace copiado al portapapeles", type: "share" });
      } catch {
        showToastMessage({ message: "No se pudo copiar el enlace", type: "error" });
      }
    } else {
      try {
        await Share.share({ message: `Mira mi perfil en PlanearIA: ${profileUrl}` });
      } catch {
        /* User cancelled share */
      }
    }
  }, [usuario?.id, showToastMessage]);

  const handleStatPress = useCallback(
    (statIndex: number) => {
      const s = stats[statIndex];
      let items: { label: string; subtitle?: string }[] = [];
      if (statIndex === 0) {
        items = planeaciones.slice(0, 10).map((p) => ({
          label: p.temaSesion || "Sin título",
          subtitle: p.nivelAcademico || undefined,
        }));
      } else if (statIndex === 1) {
        items = grupos.slice(0, 10).map((g) => ({
          label: g.nombre || "Sin nombre",
          subtitle: `${g.cantidadAlumnos ?? 0} alumnos`,
        }));
      } else if (statIndex === 2) {
        items = recursos.slice(0, 10).map((r) => ({
          label: r.titulo || "Sin título",
        }));
      }
      setExpandedStat({
        icon: s.icon,
        title: s.label.charAt(0) + s.label.slice(1).toLowerCase(),
        count: s.value,
        items,
      });
    },
    [stats, planeaciones, grupos, recursos]
  );

  const handleRetry = useCallback(() => {
    setHasError(false);
    setIsLoading(true);
    setTimeout(() => setIsLoading(false), 600);
  }, []);

  /* ── Skeleton State ── */
  if (isLoading) {
    return (
      <SafeAreaView style={[styles.safe, { backgroundColor: colors.background }]} edges={["top"]}>
        <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
          <View style={styles.header}>
            <ShimmerBlock width={40} height={40} borderRadius={20} />
            <ShimmerBlock width={120} height={20} />
            <ShimmerBlock width={40} height={40} borderRadius={20} />
          </View>
          <ShimmerBlock width="100%" height={200} borderRadius={0} />
          <View style={{ alignItems: "center", marginTop: -40, gap: 12, paddingTop: 0 }}>
            <ShimmerBlock width={88} height={88} borderRadius={44} />
            <ShimmerBlock width={180} height={22} />
            <ShimmerBlock width={80} height={16} />
            <ShimmerBlock width={200} height={14} />
          </View>
          <View
            style={{
              flexDirection: "row",
              flexWrap: "wrap",
              gap: 12,
              marginHorizontal: 16,
              marginTop: 24,
            }}
          >
            {[1, 2, 3, 4].map((i) => (
              <ShimmerBlock
                key={i}
                width={isDesktop ? "23%" : "47%"}
                height={80}
                borderRadius={16}
                style={{ flexGrow: 1 }}
              />
            ))}
          </View>
          {[1, 2, 3].map((i) => (
            <View
              key={i}
              style={{
                flexDirection: "row",
                gap: 12,
                marginHorizontal: 16,
                marginTop: 16,
                alignItems: "center",
              }}
            >
              <ShimmerBlock width={10} height={10} borderRadius={5} />
              <View style={{ flex: 1, gap: 6 }}>
                <ShimmerBlock width="70%" height={14} />
                <ShimmerBlock width="50%" height={12} />
              </View>
            </View>
          ))}
        </ScrollView>
      </SafeAreaView>
    );
  }

  /* ── Error State ── */
  if (hasError) {
    return (
      <SafeAreaView style={[styles.safe, { backgroundColor: colors.background }]} edges={["top"]}>
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={[styles.headerBtn, { backgroundColor: colors.surfaceContainerLow }]}
          >
            <MaterialIcons name="arrow-back" size={24} color={colors.onSurface} />
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: colors.primary }]}>Mi Perfil</Text>
          <View style={{ width: 40 }} />
        </View>
        <View style={styles.errorContainer}>
          <View style={styles.errorDecorCircle1} />
          <View style={styles.errorDecorCircle2} />
          <View style={styles.errorIconWrap}>
            <MaterialIcons name="person-outline" size={48} color={colors.onSurfaceVariant} />
            <View style={styles.errorBadge}>
              <MaterialIcons name="error-outline" size={20} color="#ba1a1a" />
            </View>
          </View>
          <Text style={[styles.errorTitle, { color: colors.onSurface }]}>
            No pudimos cargar tu perfil
          </Text>
          <Text style={[styles.errorMessage, { color: colors.onSurfaceVariant }]}>
            Revisa tu conexión e intenta de nuevo.
          </Text>
          <TouchableOpacity
            style={[styles.retryBtn, { borderColor: colors.primary }]}
            onPress={handleRetry}
            accessibilityRole="button"
            accessibilityLabel="Reintentar"
          >
            <Text style={[styles.retryBtnText, { color: colors.primary }]}>Reintentar</Text>
          </TouchableOpacity>
          <Text style={[styles.errorCode, { color: colors.onSurfaceVariant }]}>(503)</Text>
        </View>
      </SafeAreaView>
    );
  }

  /* ── Guest State ── */
  if (isGuest) {
    return (
      <SafeAreaView style={[styles.safe, { backgroundColor: colors.background }]} edges={["top"]}>
        <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity
              onPress={() => navigation.goBack()}
              style={[styles.headerBtn, { backgroundColor: colors.surfaceContainerLow }]}
            >
              <MaterialIcons name="arrow-back" size={24} color={colors.onSurface} />
            </TouchableOpacity>
            <Text style={[styles.headerTitle, { color: colors.primary }]}>Mi Perfil</Text>
            <View style={{ width: 40 }} />
          </View>

          {/* Grey banner */}
          <LinearGradient
            colors={[colors.surfaceContainerHigh, colors.surfaceContainer]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.heroBanner}
          />

          {/* Guest avatar */}
          <View style={styles.avatarWrap}>
            <View
              style={[
                styles.avatar,
                {
                  backgroundColor: colors.surfaceContainerHigh,
                  borderColor: colors.background,
                  borderRadius: 20,
                },
              ]}
            >
              <MaterialIcons name="person" size={44} color={colors.onSurfaceVariant} />
            </View>
          </View>

          <View style={styles.infoSection}>
            <Text style={[styles.userName, { color: colors.onSurface }]}>Invitado</Text>
            <View style={[styles.roleChip, { backgroundColor: colors.surfaceContainerHigh }]}>
              <Text style={[styles.roleChipText, { color: colors.onSurfaceVariant }]}>
                Invitado
              </Text>
            </View>
          </View>

          {/* Stats (all zeros) */}
          <View style={[styles.statsGrid, isDesktop && styles.statsGridDesktop]}>
            {stats.map((s, i) => (
              <View
                key={i}
                style={[
                  styles.statCard,
                  { backgroundColor: colors.surfaceContainerLowest },
                  Platform.select({
                    web: { boxShadow: "0px 2px 8px rgba(0,69,128,0.06)" } as any,
                    default: {
                      shadowColor: "#004580",
                      shadowOffset: { width: 0, height: 2 },
                      shadowOpacity: 0.06,
                      shadowRadius: 8,
                      elevation: 2,
                    },
                  }),
                ]}
              >
                <Text style={[styles.statNumber, { color: colors.primary }]}>0</Text>
                <Text style={[styles.statLabel, { color: colors.onSurfaceVariant }]}>
                  {s.label}
                </Text>
              </View>
            ))}
          </View>

          {/* CTA Banner */}
          <LinearGradient
            colors={["#004580", "#6b21a8"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.guestCTA}
          >
            <MaterialIcons name="shield" size={32} color="#FFFFFF" />
            <Text style={styles.guestCTATitle}>Estás navegando como invitado</Text>
            <Text style={styles.guestCTADesc}>
              Crea una cuenta para guardar tu progreso, sincronizar tus datos y acceder a todas las
              funciones.
            </Text>
            <TouchableOpacity
              style={styles.guestCTABtn}
              onPress={() => navigation.navigate("Registro")}
            >
              <Text style={[styles.guestCTABtnText, { color: colors.primary }]}>
                Crear cuenta gratis
              </Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => navigation.navigate("Login")}>
              <Text style={styles.guestLoginLink}>Ya tengo cuenta → Iniciar sesión</Text>
            </TouchableOpacity>
          </LinearGradient>

          {/* Empty activity */}
          <View style={[styles.activitySection, { marginTop: 8 }]}>
            <Text style={[styles.activityTitle, { color: colors.onSurface }]}>
              ACTIVIDAD RECIENTE
            </Text>
            <View
              style={[
                styles.emptyActivity,
                { borderColor: colors.outlineVariant, backgroundColor: colors.surfaceContainerLow },
              ]}
            >
              <MaterialIcons name="history" size={36} color={colors.onSurfaceVariant} />
              <Text style={{ color: colors.onSurface, fontWeight: "600", fontSize: 15 }}>
                Aún no tienes actividad
              </Text>
              <Text style={{ color: colors.onSurfaceVariant, fontSize: 13, textAlign: "center" }}>
                Tus interacciones recientes aparecerán aquí una vez que comiences.
              </Text>
            </View>
          </View>
        </ScrollView>
      </SafeAreaView>
    );
  }

  /* ── Authenticated User State ── */
  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: colors.background }]} edges={["top"]}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={[styles.headerBtn, { backgroundColor: colors.surfaceContainerLow }]}
          >
            <MaterialIcons name="arrow-back" size={24} color={colors.onSurface} />
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: colors.primary }]}>Mi Perfil</Text>
          <TouchableOpacity
            onPress={() => navigation.navigate("Cuenta")}
            style={[styles.headerBtn, { backgroundColor: colors.surfaceContainerLow }]}
          >
            <MaterialIcons name="settings" size={24} color={colors.onSurfaceVariant} />
          </TouchableOpacity>
        </View>

        {/* Hero gradient banner */}
        <LinearGradient
          colors={["#005da8", "#0576d2"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.heroBanner}
        />

        {/* Avatar overlapping banner */}
        <View style={styles.avatarWrap}>
          <View style={[styles.avatar, { borderColor: colors.background }]}>
            <Text style={styles.avatarInitials}>{initials}</Text>
          </View>
        </View>

        {/* User info */}
        <View style={styles.infoSection}>
          <Text style={[styles.userName, { color: colors.onSurface }]}>{userName}</Text>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
            <View style={[styles.roleChip, { backgroundColor: "#d2e4ff" }]}>
              <Text style={[styles.roleChipText, { color: "#004580" }]}>{userRole}</Text>
            </View>
            <Text style={{ color: colors.onSurfaceVariant, fontSize: 14 }}>🇲🇽 México</Text>
          </View>
          {usuario?.email ? (
            <Text style={[styles.userEmail, { color: colors.onSurfaceVariant }]}>
              {usuario.email}
            </Text>
          ) : null}
          {usuario?.biografia ? (
            <Text style={[styles.userBio, { color: colors.onSurface }]}>{usuario.biografia}</Text>
          ) : isNewUser ? (
            <TouchableOpacity onPress={() => navigation.navigate("EditarPerfil")}>
              <Text style={[styles.addBioPrompt, { color: colors.primary }]}>
                Agrega una biografía
              </Text>
            </TouchableOpacity>
          ) : null}
          {memberSince && (
            <View style={{ flexDirection: "row", alignItems: "center", gap: 6, marginTop: 4 }}>
              <MaterialIcons name="date-range" size={14} color={colors.onSurfaceVariant} />
              <Text
                style={{ fontSize: 12, color: colors.onSurfaceVariant, textTransform: "uppercase" }}
              >
                Miembro desde {memberSince}
              </Text>
            </View>
          )}
        </View>

        {/* Bento Stats Grid */}
        <View style={[styles.statsGrid, isDesktop && styles.statsGridDesktop]}>
          {stats.map((s, i) => (
            <TouchableOpacity
              key={i}
              activeOpacity={0.7}
              onPress={() => handleStatPress(i)}
              accessibilityRole="button"
              accessibilityLabel={`${s.label}: ${s.value}`}
              style={[
                styles.statCard,
                { backgroundColor: colors.surfaceContainerLowest },
                Platform.select({
                  web: { boxShadow: "0px 2px 8px rgba(0,69,128,0.06)" } as any,
                  default: {
                    shadowColor: "#004580",
                    shadowOffset: { width: 0, height: 2 },
                    shadowOpacity: 0.06,
                    shadowRadius: 8,
                    elevation: 2,
                  },
                }),
              ]}
            >
              <MaterialIcons name={s.icon as any} size={20} color="#004580" />
              <Text style={[styles.statNumber, { color: colors.onSurface }]}>{s.value}</Text>
              <Text style={[styles.statLabel, { color: colors.onSurfaceVariant }]}>{s.label}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Action buttons */}
        <View style={styles.actionsSection}>
          <TouchableOpacity
            style={[
              styles.editBtn,
              {
                borderColor: colors.outlineVariant,
                backgroundColor: colors.surfaceContainerLowest,
              },
            ]}
            onPress={() => navigation.navigate("EditarPerfil")}
          >
            <MaterialIcons name="edit" size={18} color={colors.primary} />
            <Text style={[styles.editBtnText, { color: colors.primary }]}>Editar perfil</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.shareRow}
            onPress={handleShare}
            accessibilityRole="button"
            accessibilityLabel="Compartir perfil"
          >
            <MaterialIcons name="share" size={18} color={colors.onSurfaceVariant} />
            <Text style={{ color: colors.onSurfaceVariant, fontWeight: "600", fontSize: 14 }}>
              Compartir perfil
            </Text>
          </TouchableOpacity>
        </View>

        {/* New user CTA */}
        {isNewUser && (
          <LinearGradient
            colors={[colors.primary, colors.primaryContainer]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.newUserCTA}
          >
            <Text style={styles.newUserCTAText}>Completar mi perfil</Text>
          </LinearGradient>
        )}

        {/* Activity Timeline */}
        <View style={styles.activitySection}>
          <Text style={[styles.activityTitle, { color: colors.onSurface }]}>
            ACTIVIDAD RECIENTE
          </Text>
          {planeaciones.length === 0 && grupos.length === 0 ? (
            <View style={[styles.emptyActivity, { borderColor: colors.outlineVariant }]}>
              <MaterialIcons name="rocket-launch" size={32} color={colors.onSurfaceVariant} />
              <Text style={{ color: colors.onSurface, fontWeight: "600", fontSize: 15 }}>
                ¿Listo para inspirar?
              </Text>
              <Text
                style={{
                  color: colors.onSurfaceVariant,
                  fontSize: 13,
                  textAlign: "center",
                }}
              >
                Tu actividad aparecerá aquí conforme uses la app.
              </Text>
            </View>
          ) : (
            <View style={{ gap: 0 }}>
              {planeaciones.slice(0, 3).map((p, i) => (
                <View key={`p-${i}`} style={styles.timelineItem}>
                  <View style={[styles.timelineDot, { backgroundColor: colors.primary }]} />
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.timelineTitle, { color: colors.onSurface }]}>
                      Nueva planeación publicada
                    </Text>
                    <Text style={{ color: colors.onSurfaceVariant, fontSize: 13 }}>
                      {p.temaSesion || "Sin título"}
                    </Text>
                  </View>
                </View>
              ))}
              {grupos.slice(0, 2).map((g, i) => (
                <View key={`g-${i}`} style={styles.timelineItem}>
                  <View
                    style={[
                      styles.timelineDot,
                      { backgroundColor: colors.secondaryContainer, opacity: 0.6 },
                    ]}
                  />
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.timelineTitle, { color: colors.onSurface }]}>
                      Grupo creado
                    </Text>
                    <Text style={{ color: colors.onSurfaceVariant, fontSize: 13 }}>
                      {g.nombre || "Sin nombre"}
                    </Text>
                  </View>
                </View>
              ))}
            </View>
          )}
        </View>
      </ScrollView>

      {/* Toast notification */}
      <Toast
        visible={showToast}
        message={toast?.message || ""}
        type={toast?.type || "info"}
        duration={toast?.duration}
        onDismiss={() => setShowToast(false)}
      />

      {/* Expanded stats modal */}
      <ExpandedStatsModal
        visible={!!expandedStat}
        data={expandedStat}
        onClose={() => setExpandedStat(null)}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safe: { flex: 1 },
  scroll: { paddingBottom: 40 },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  headerBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "800",
  },
  heroBanner: {
    height: 200,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
  },
  avatarWrap: {
    alignItems: "center",
    marginTop: -44,
    marginBottom: 12,
  },
  avatar: {
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: "#005da8",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 4,
  },
  avatarInitials: {
    fontSize: 28,
    fontWeight: "800",
    color: "#FFFFFF",
  },
  infoSection: {
    alignItems: "center",
    paddingHorizontal: 16,
    gap: 6,
    marginBottom: 20,
  },
  userName: {
    fontSize: 24,
    fontWeight: "800",
  },
  roleChip: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 20,
  },
  roleChipText: {
    fontSize: 12,
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  userEmail: {
    fontSize: 14,
    marginTop: 2,
  },
  userBio: {
    fontSize: 14,
    textAlign: "center",
    lineHeight: 20,
    marginTop: 4,
    paddingHorizontal: 20,
  },
  addBioPrompt: {
    fontSize: 14,
    fontWeight: "600",
    marginTop: 4,
  },
  statsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
    marginHorizontal: 16,
    marginBottom: 20,
  },
  statsGridDesktop: {
    flexWrap: "nowrap",
  },
  statCard: {
    flex: 1,
    minWidth: "45%",
    borderRadius: 16,
    padding: 16,
    gap: 4,
  },
  statNumber: {
    fontSize: 18,
    fontWeight: "800",
  },
  statLabel: {
    fontSize: 10,
    fontWeight: "700",
    letterSpacing: 1,
    textTransform: "uppercase",
  },
  actionsSection: {
    marginHorizontal: 16,
    gap: 12,
    marginBottom: 24,
  },
  editBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 14,
    borderRadius: 16,
    borderWidth: 2,
  },
  editBtnText: {
    fontSize: 15,
    fontWeight: "700",
  },
  shareRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 8,
  },
  guestCTA: {
    marginHorizontal: 16,
    borderRadius: 20,
    padding: 24,
    alignItems: "center",
    gap: 12,
    marginBottom: 24,
  },
  guestCTATitle: {
    fontSize: 20,
    fontWeight: "800",
    color: "#FFFFFF",
    textAlign: "center",
  },
  guestCTADesc: {
    fontSize: 14,
    color: "rgba(255,255,255,0.85)",
    textAlign: "center",
    lineHeight: 20,
  },
  guestCTABtn: {
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
    width: "100%",
    alignItems: "center",
  },
  guestCTABtnText: {
    fontWeight: "700",
    fontSize: 15,
  },
  guestLoginLink: {
    color: "rgba(255,255,255,0.9)",
    fontWeight: "600",
    fontSize: 14,
    textDecorationLine: "underline",
  },
  newUserCTA: {
    marginHorizontal: 16,
    borderRadius: 16,
    paddingVertical: 16,
    alignItems: "center",
    marginBottom: 24,
  },
  newUserCTAText: {
    color: "#FFFFFF",
    fontWeight: "700",
    fontSize: 15,
  },
  activitySection: {
    marginHorizontal: 16,
    gap: 16,
  },
  activityTitle: {
    fontSize: 12,
    fontWeight: "800",
    letterSpacing: 1.5,
    textTransform: "uppercase",
  },
  emptyActivity: {
    borderWidth: 1.5,
    borderStyle: "dashed",
    borderRadius: 16,
    padding: 24,
    alignItems: "center",
    gap: 8,
  },
  timelineItem: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 12,
    paddingVertical: 12,
    paddingLeft: 4,
  },
  timelineDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginTop: 5,
  },
  timelineTitle: {
    fontWeight: "700",
    fontSize: 14,
    marginBottom: 2,
  },
  /* ── Error state styles ── */
  errorContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
  },
  errorDecorCircle1: {
    position: "absolute",
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: "rgba(0, 93, 168, 0.05)",
    top: "15%",
    left: -40,
  },
  errorDecorCircle2: {
    position: "absolute",
    width: 160,
    height: 160,
    borderRadius: 80,
    backgroundColor: "rgba(186, 26, 26, 0.04)",
    bottom: "20%",
    right: -30,
  },
  errorIconWrap: {
    marginBottom: 20,
  },
  errorBadge: {
    position: "absolute",
    bottom: -2,
    right: -4,
    backgroundColor: "#ffdad6",
    borderRadius: 12,
    padding: 2,
  },
  errorTitle: {
    fontSize: 20,
    fontWeight: "700",
    textAlign: "center",
    marginBottom: 8,
  },
  errorMessage: {
    fontSize: 14,
    textAlign: "center",
    lineHeight: 20,
    marginBottom: 24,
  },
  retryBtn: {
    borderWidth: 2,
    borderRadius: 12,
    paddingHorizontal: 32,
    paddingVertical: 12,
    marginBottom: 16,
  },
  retryBtnText: {
    fontSize: 15,
    fontWeight: "700",
  },
  errorCode: {
    fontSize: 11,
    fontVariant: ["small-caps" as any],
    opacity: 0.6,
  },
});

export default PerfilScreen;

