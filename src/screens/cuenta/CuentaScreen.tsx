import React, { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Animated,
  Modal,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  useWindowDimensions,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { useNavigation } from "@react-navigation/native";
import AnimatedTopPill from "../../components/AnimatedTopPill";
import { isWeb } from "../../utils/responsive";
import { useCuentaViewModel } from "../../hooks/useCuentaViewModel";
import { usePermission } from "../../hooks/usePermission";
import { useAuth, PREFERENCIAS_DEFAULT } from "../../context/AuthContext";
import { useTheme } from "../../context/ThemeContext";
import { useFontSize } from "../../context/FontSizeContext";
import { useDaltonismo } from "../../context/DaltonismoContext";
import { useAccessibilityPreferences } from "../../context/AccessibilityPreferencesContext";
import { changeLanguage } from "../../locales/i18n";
import { useTranslation } from "react-i18next";
import { getRoleLabel } from "../../../types";

const TOGGLE_HIT_SLOP = { top: 6, bottom: 6, left: 6, right: 6 };

const FEATURE_HIGHLIGHTS = [
  {
    icon: "auto-stories" as const,
    color: "#0B6F86",
    bg: "#E0F7FA",
    title: "Modo Lectura",
    description:
      "Proyecta tus planeaciones en clase con texto grande y claro para leer desde cualquier distancia.",
  },
  {
    icon: "psychology" as const,
    color: "#7B1FA2",
    bg: "#F3E5F5",
    title: "IA Generadora",
    description:
      "Genera secuencias didácticas completas en segundos con inteligencia artificial adaptada a tu nivel educativo.",
  },
  {
    icon: "offline-bolt" as const,
    color: "#E65100",
    bg: "#FFF3E0",
    title: "Sin conexión",
    description:
      "Trabaja sin internet. Tus planeaciones se sincronizan automáticamente cuando vuelvas a conectarte.",
  },
];

const REVIEWS = [
  {
    name: "María G.",
    role: "Docente de Primaria",
    stars: 5,
    text: "PlanearIA me ahorra hasta 3 horas semanales en planeación. ¡Ya no puedo vivir sin ella!",
  },
  {
    name: "Carlos R.",
    role: "Profesor de Secundaria",
    stars: 5,
    text: "La mejor herramienta que he encontrado para organizar mis grupos y calificaciones en un solo lugar.",
  },
  {
    name: "Laura P.",
    role: "Maestra de Preescolar",
    stars: 5,
    text: "Muy intuitiva, me encanta poder crear planeaciones desde el celular mientras viajo al trabajo.",
  },
];

const StarRow: React.FC<{ count: number }> = ({ count }) => (
  <View style={{ flexDirection: "row", gap: 2 }}>
    {Array.from({ length: count }).map((_, i) => (
      <MaterialIcons key={i} name="star" size={14} color="#F5A623" />
    ))}
  </View>
);

const CuentaScreen: React.FC = () => {
  const { width } = useWindowDimensions();
  const wideLayout = width >= 1080;
  const navigation = useNavigation();
  const [scrollY] = React.useState(() => new Animated.Value(0));
  const { t, i18n } = useTranslation();

  // Real accessibility contexts consumed at runtime
  const { colors, isDark, toggleTheme } = useTheme();
  const darkMode = isDark;
  const { scaled, fontSizeMode: fsModeCtx, setFontSizeMode: setFsModeCtx } = useFontSize();
  const { daltonismoMode, setDaltonismoMode, applyDaltonismo } = useDaltonismo();
  const {
    highContrast,
    voiceReading,
    reduceMotion,
    setHighContrast,
    setVoiceReading,
    setReduceMotion,
  } = useAccessibilityPreferences();

  // Runtime theme tokens (daltonism-adjusted). COLORS === lightTheme, so the light
  // result is identical to the previous static styling; dark repaints the screen.
  const DT = applyDaltonismo(colors);
  const styles = getStyles(DT, isDark, scaled, highContrast);

  // Map context font size to UI labels
  const fontSizeMode =
    fsModeCtx === "small" ? "Pequeno" : fsModeCtx === "large" ? "Grande" : "Medio";
  const setFontSizeMode = (label: "Pequeno" | "Medio" | "Grande") => {
    const map = { Pequeno: "small", Medio: "medium", Grande: "large" } as const;
    setFsModeCtx(map[label]);
  };

  // Map daltonismo context to UI labels
  const daltonismo =
    daltonismoMode === "deuteranopia"
      ? "Deuteranopia"
      : daltonismoMode === "protanopia"
        ? "Protanopia"
        : daltonismoMode === "tritanopia"
          ? "Tritanopia"
          : "Ninguno";
  const setDaltonismo = (label: string) => {
    const map: Record<string, "none" | "protanopia" | "deuteranopia" | "tritanopia"> = {
      Ninguno: "none",
      Deuteranopia: "deuteranopia",
      Protanopia: "protanopia",
      Tritanopia: "tritanopia",
    };
    setDaltonismoMode(map[label] ?? "none");
  };

  // Accordion states
  const [openAccesibilidad, setOpenAccesibilidad] = React.useState(false);
  const [openPreferencias, setOpenPreferencias] = React.useState(false);
  const [openCuenta, setOpenCuenta] = React.useState(false);

  // Delete account modal
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deletePassword, setDeletePassword] = useState("");
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [deleteError, setDeleteError] = useState("");

  const {
    usuario,
    handleEditarPerfil,
    handleCambiarContrasena,
    handleCerrarSesion,
    handleEliminarCuenta,
  } = useCuentaViewModel();
  const { actualizarPreferencias, isGuest } = useAuth();
  const { can } = usePermission();

  const prefs = { ...PREFERENCIAS_DEFAULT, ...usuario?.preferencias };

  // "Reducir movimiento": when on, the top pill renders statically (no scroll animation).
  const mobilePillOpacity = scrollY.interpolate({
    inputRange: [0, 22, 56],
    outputRange: [1, 0.5, 0],
    extrapolate: "clamp",
  });

  const mobilePillTranslateY = scrollY.interpolate({
    inputRange: [0, 56],
    outputRange: [0, -16],
    extrapolate: "clamp",
  });

  const togglePref = (key: string, value: boolean) => {
    actualizarPreferencias({ [key]: value });
  };

  const onPressEliminar = () => {
    Alert.alert(
      "Eliminar cuenta",
      "Esta acción es irreversible. Se eliminarán todos tus datos permanentemente. ¿Deseas continuar?",
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Continuar",
          style: "destructive",
          onPress: () => {
            setDeletePassword("");
            setDeleteError("");
            setShowDeleteModal(true);
          },
        },
      ]
    );
  };

  const confirmarEliminacion = async () => {
    if (!deletePassword.trim()) {
      setDeleteError("Ingresa tu contraseña para confirmar.");
      return;
    }
    setDeleteLoading(true);
    setDeleteError("");
    const result = await handleEliminarCuenta(deletePassword);
    setDeleteLoading(false);
    if (!result.success) {
      setDeleteError(result.error || "Error al eliminar cuenta.");
    }
  };

  const userName = usuario
    ? `${usuario.nombre}${usuario.apellidos ? ` ${usuario.apellidos}` : ""}`
    : "Usuario";

  const userRole = isGuest ? "Invitado" : usuario?.rol ? getRoleLabel(usuario.rol) : "Docente";

  return (
    <View style={styles.container} testID="cuenta-root">
      <StatusBar
        backgroundColor={DT.background}
        barStyle={isDark ? "light-content" : "dark-content"}
      />

      <SafeAreaView style={styles.safeArea}>
        <Animated.ScrollView
          style={styles.scroller}
          contentContainerStyle={styles.scrollContent}
          onScroll={Animated.event([{ nativeEvent: { contentOffset: { y: scrollY } } }], {
            useNativeDriver: true,
          })}
          scrollEventThrottle={16}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.headerBlock}>
            {reduceMotion ? (
              <View>
                <AnimatedTopPill
                  icon="settings"
                  title="Configuracion"
                  subtitle="Accesibilidad, preferencias y cuenta"
                />
              </View>
            ) : (
              <Animated.View
                style={{
                  opacity: mobilePillOpacity,
                  transform: [{ translateY: mobilePillTranslateY }],
                }}
              >
                <AnimatedTopPill
                  icon="settings"
                  title="Configuracion"
                  subtitle="Accesibilidad, preferencias y cuenta"
                />
              </Animated.View>
            )}
          </View>

          <View style={styles.aiBanner}>
            <Text style={styles.aiBannerKicker}>NUEVO EN PLANEARIA</Text>
            <Text style={styles.aiBannerTitle}>Asistente de Accesibilidad por IA</Text>
          </View>

          <View style={[styles.layoutGrid, wideLayout && styles.layoutGridWide]}>
            <View style={[styles.leftColumn, wideLayout && styles.leftColumnWide]}>
              {/* ── Accesibilidad ── */}
              <View style={styles.sectionBlock}>
                <TouchableOpacity
                  style={styles.sectionHeader}
                  activeOpacity={0.82}
                  onPress={() => setOpenAccesibilidad((prev) => !prev)}
                  accessibilityRole="button"
                  accessibilityState={{ expanded: openAccesibilidad }}
                >
                  <View style={styles.sectionTitleWrap}>
                    <MaterialIcons name="accessibility-new" size={20} color={DT.primaryDark} />
                    <Text style={styles.sectionTitle}>Accesibilidad</Text>
                  </View>
                  <MaterialIcons
                    name={openAccesibilidad ? "expand-less" : "expand-more"}
                    size={26}
                    color={DT.textDark}
                  />
                </TouchableOpacity>

                {openAccesibilidad ? (
                  <View style={styles.sectionContent}>
                    <View style={styles.surfaceCard}>
                      <Text style={styles.blockKicker}>VISUALIZACION</Text>
                      <Text style={styles.blockTitle}>Tamano de fuente</Text>
                      <View style={styles.segmentedBar}>
                        {(["Pequeno", "Medio", "Grande"] as const).map((size) => {
                          const active = fontSizeMode === size;
                          return (
                            <TouchableOpacity
                              key={size}
                              style={[styles.segmentOption, active && styles.segmentOptionActive]}
                              onPress={() => setFontSizeMode(size)}
                              activeOpacity={0.85}
                              hitSlop={{ top: 6, bottom: 6 }}
                              accessibilityRole="button"
                              accessibilityState={{ selected: active }}
                              accessibilityLabel={`Tamano de fuente ${size}`}
                            >
                              <Text
                                style={[styles.segmentText, active && styles.segmentTextActive]}
                              >
                                {size}
                              </Text>
                            </TouchableOpacity>
                          );
                        })}
                      </View>
                    </View>

                    <View style={styles.surfaceCard}>
                      <View style={styles.rowBetween}>
                        <View style={styles.rowTextWrap}>
                          <Text style={styles.rowTitle}>Contraste alto</Text>
                          <Text style={styles.rowSubtitle}>Mejora la legibilidad del texto</Text>
                        </View>
                        <TouchableOpacity
                          style={[styles.toggleTrack, highContrast && styles.toggleTrackOn]}
                          onPress={() => setHighContrast(!highContrast)}
                          activeOpacity={0.9}
                          hitSlop={TOGGLE_HIT_SLOP}
                          accessibilityRole="switch"
                          accessibilityLabel="Contraste alto"
                          accessibilityState={{ checked: highContrast }}
                        >
                          <View
                            style={[styles.toggleThumb, highContrast && styles.toggleThumbOn]}
                          />
                        </TouchableOpacity>
                      </View>
                    </View>

                    <View style={styles.surfaceCard}>
                      <Text style={styles.rowTitle}>Modo Daltonismo</Text>
                      {(["Ninguno", "Deuteranopia", "Protanopia", "Tritanopia"] as const).map(
                        (opt) => (
                          <TouchableOpacity
                            key={opt}
                            style={[styles.radioRow, daltonismo === opt && styles.radioRowActive]}
                            onPress={() => setDaltonismo(opt)}
                            activeOpacity={0.85}
                            accessibilityRole="radio"
                            accessibilityState={{ selected: daltonismo === opt }}
                            accessibilityLabel={`Modo daltonismo ${opt}`}
                          >
                            <Text
                              style={[
                                styles.radioText,
                                daltonismo === opt && styles.radioTextActive,
                              ]}
                            >
                              {opt}
                            </Text>
                            {daltonismo === opt ? (
                              <MaterialIcons
                                name="check-circle"
                                size={20}
                                color={DT.primaryDark}
                              />
                            ) : null}
                          </TouchableOpacity>
                        )
                      )}
                    </View>

                    <View style={styles.surfaceRowCard}>
                      <View style={styles.surfaceRowLeft}>
                        <MaterialIcons name="record-voice-over" size={20} color={DT.teal} />
                        <View style={styles.surfaceRowTextWrap}>
                          <Text style={styles.surfaceRowTitle}>Lectura de voz</Text>
                          <Text style={styles.surfaceRowSoon}>Proximamente</Text>
                        </View>
                      </View>
                      <TouchableOpacity
                        style={[styles.toggleTrack, voiceReading && styles.toggleTrackOn]}
                        onPress={() => setVoiceReading(!voiceReading)}
                        activeOpacity={0.9}
                        hitSlop={TOGGLE_HIT_SLOP}
                        accessibilityRole="switch"
                        accessibilityLabel="Lectura de voz (proximamente)"
                        accessibilityState={{ checked: voiceReading }}
                      >
                        <View style={[styles.toggleThumb, voiceReading && styles.toggleThumbOn]} />
                      </TouchableOpacity>
                    </View>

                    <View style={styles.surfaceRowCard}>
                      <View style={styles.surfaceRowLeft}>
                        <MaterialIcons name="motion-photos-off" size={20} color={DT.teal} />
                        <Text style={styles.surfaceRowTitle}>Reducir movimiento</Text>
                      </View>
                      <TouchableOpacity
                        style={[styles.toggleTrack, reduceMotion && styles.toggleTrackOn]}
                        onPress={() => setReduceMotion(!reduceMotion)}
                        activeOpacity={0.9}
                        hitSlop={TOGGLE_HIT_SLOP}
                        accessibilityRole="switch"
                        accessibilityLabel="Reducir movimiento"
                        accessibilityState={{ checked: reduceMotion }}
                      >
                        <View style={[styles.toggleThumb, reduceMotion && styles.toggleThumbOn]} />
                      </TouchableOpacity>
                    </View>
                  </View>
                ) : null}
              </View>

              {/* ── Preferencias de app ── */}
              <View style={styles.sectionBlock}>
                <TouchableOpacity
                  style={styles.sectionHeader}
                  activeOpacity={0.82}
                  onPress={() => setOpenPreferencias((prev) => !prev)}
                  accessibilityRole="button"
                  accessibilityState={{ expanded: openPreferencias }}
                >
                  <View style={styles.sectionTitleWrap}>
                    <MaterialIcons name="tune" size={20} color={DT.primaryDark} />
                    <Text style={styles.sectionTitle}>Preferencias de app</Text>
                  </View>
                  <MaterialIcons
                    name={openPreferencias ? "expand-less" : "expand-more"}
                    size={26}
                    color={DT.textDark}
                  />
                </TouchableOpacity>

                {openPreferencias ? (
                  <View style={styles.sectionContent}>
                    <View style={styles.surfaceCard}>
                      <View style={styles.preferenceRow}>
                        <View style={styles.prefIconWrap}>
                          <MaterialIcons name="dark-mode" size={19} color={DT.textDark} />
                        </View>
                        <View style={styles.prefTextWrap}>
                          <Text style={styles.prefTitle}>Modo oscuro</Text>
                          <Text style={styles.prefSubtitle}>
                            {darkMode ? "Actualmente activado" : "Actualmente desactivado"}
                          </Text>
                        </View>
                        <TouchableOpacity
                          style={[styles.toggleTrack, darkMode && styles.toggleTrackOn]}
                          onPress={toggleTheme}
                          activeOpacity={0.9}
                          hitSlop={TOGGLE_HIT_SLOP}
                          accessibilityRole="switch"
                          accessibilityLabel="Modo oscuro"
                          accessibilityState={{ checked: darkMode }}
                        >
                          <View style={[styles.toggleThumb, darkMode && styles.toggleThumbOn]} />
                        </TouchableOpacity>
                      </View>

                      <View style={styles.rowDivider} />

                      <TouchableOpacity
                        style={styles.preferenceRow}
                        activeOpacity={0.82}
                        onPress={() => {
                          const nextLang = i18n.language === "es" ? "en" : "es";
                          changeLanguage(nextLang);
                        }}
                        accessibilityRole="button"
                        accessibilityLabel="Cambiar idioma"
                      >
                        <View style={styles.prefIconWrap}>
                          <MaterialIcons name="translate" size={19} color={DT.textDark} />
                        </View>
                        <View style={styles.prefTextWrap}>
                          <Text style={styles.prefTitle}>Idioma</Text>
                          <Text style={styles.prefSubtitle}>
                            {i18n.language === "es" ? "Español (México)" : "English"}
                          </Text>
                        </View>
                        <MaterialIcons name="chevron-right" size={22} color={DT.textMuted} />
                      </TouchableOpacity>

                      {!isGuest && (
                        <>
                          <View style={styles.rowDivider} />

                          <View style={styles.preferenceRow}>
                            <View style={styles.prefIconWrap}>
                              <MaterialIcons name="lightbulb" size={19} color={DT.textDark} />
                            </View>
                            <View style={styles.prefTextWrap}>
                              <Text style={styles.prefTitle}>Recibir recomendaciones</Text>
                              <Text style={styles.prefSubtitle}>Sugerencias de la IA</Text>
                            </View>
                            <TouchableOpacity
                              style={[
                                styles.toggleTrack,
                                prefs.recibirRecomendaciones && styles.toggleTrackOn,
                              ]}
                              onPress={() =>
                                togglePref("recibirRecomendaciones", !prefs.recibirRecomendaciones)
                              }
                              activeOpacity={0.9}
                              hitSlop={TOGGLE_HIT_SLOP}
                              accessibilityRole="switch"
                              accessibilityLabel="Recibir recomendaciones"
                              accessibilityState={{ checked: !!prefs.recibirRecomendaciones }}
                            >
                              <View
                                style={[
                                  styles.toggleThumb,
                                  prefs.recibirRecomendaciones && styles.toggleThumbOn,
                                ]}
                              />
                            </TouchableOpacity>
                          </View>

                          <View style={styles.rowDivider} />

                          <View style={styles.preferenceRow}>
                            <View style={styles.prefIconWrap}>
                              <MaterialIcons name="bar-chart" size={19} color={DT.textDark} />
                            </View>
                            <View style={styles.prefTextWrap}>
                              <Text style={styles.prefTitle}>Compartir datos de uso</Text>
                              <Text style={styles.prefSubtitle}>Ayuda a mejorar la app</Text>
                            </View>
                            <TouchableOpacity
                              style={[
                                styles.toggleTrack,
                                prefs.compartirDatos && styles.toggleTrackOn,
                              ]}
                              onPress={() => togglePref("compartirDatos", !prefs.compartirDatos)}
                              activeOpacity={0.9}
                              hitSlop={TOGGLE_HIT_SLOP}
                              accessibilityRole="switch"
                              accessibilityLabel="Compartir datos de uso"
                              accessibilityState={{ checked: !!prefs.compartirDatos }}
                            >
                              <View
                                style={[
                                  styles.toggleThumb,
                                  prefs.compartirDatos && styles.toggleThumbOn,
                                ]}
                              />
                            </TouchableOpacity>
                          </View>

                          <View style={styles.rowDivider} />

                          <View style={styles.preferenceRow}>
                            <View style={styles.prefIconWrap}>
                              <MaterialIcons name="shield" size={19} color={DT.textDark} />
                            </View>
                            <View style={styles.prefTextWrap}>
                              <Text style={styles.prefTitle}>Contenido para adultos</Text>
                              <Text style={styles.prefSubtitle}>
                                {prefs.contenidoAdulto ? "Activado" : "Desactivado"}
                              </Text>
                            </View>
                            <TouchableOpacity
                              style={[
                                styles.toggleTrack,
                                prefs.contenidoAdulto && styles.toggleTrackOn,
                              ]}
                              onPress={() => togglePref("contenidoAdulto", !prefs.contenidoAdulto)}
                              activeOpacity={0.9}
                              hitSlop={TOGGLE_HIT_SLOP}
                              accessibilityRole="switch"
                              accessibilityLabel="Contenido para adultos"
                              accessibilityState={{ checked: !!prefs.contenidoAdulto }}
                            >
                              <View
                                style={[
                                  styles.toggleThumb,
                                  prefs.contenidoAdulto && styles.toggleThumbOn,
                                ]}
                              />
                            </TouchableOpacity>
                          </View>

                          <View style={styles.rowDivider} />

                          <View style={styles.preferenceRow}>
                            <View style={styles.prefIconWrap}>
                              <MaterialIcons
                                name="notifications"
                                size={19}
                                color={DT.textDark}
                              />
                            </View>
                            <View style={styles.prefTextWrap}>
                              <Text style={styles.prefTitle}>Notificaciones push</Text>
                              <Text style={styles.prefSubtitle}>
                                {prefs.notificaciones ? "Activadas" : "Desactivadas"}
                              </Text>
                            </View>
                            <TouchableOpacity
                              style={[
                                styles.toggleTrack,
                                prefs.notificaciones && styles.toggleTrackOn,
                              ]}
                              onPress={() => togglePref("notificaciones", !prefs.notificaciones)}
                              activeOpacity={0.9}
                              hitSlop={TOGGLE_HIT_SLOP}
                              accessibilityRole="switch"
                              accessibilityLabel="Notificaciones push"
                              accessibilityState={{ checked: !!prefs.notificaciones }}
                            >
                              <View
                                style={[
                                  styles.toggleThumb,
                                  prefs.notificaciones && styles.toggleThumbOn,
                                ]}
                              />
                            </TouchableOpacity>
                          </View>
                        </>
                      )}
                    </View>
                  </View>
                ) : null}
              </View>

              {/* ── Cuenta y seguridad ── */}
              <View style={styles.sectionBlock}>
                <TouchableOpacity
                  style={styles.sectionHeader}
                  activeOpacity={0.82}
                  onPress={() => setOpenCuenta((prev) => !prev)}
                  accessibilityRole="button"
                  accessibilityState={{ expanded: openCuenta }}
                >
                  <View style={styles.sectionTitleWrap}>
                    <MaterialIcons name="manage-accounts" size={20} color={DT.primaryDark} />
                    <Text style={styles.sectionTitle}>Cuenta y seguridad</Text>
                  </View>
                  <MaterialIcons
                    name={openCuenta ? "expand-less" : "expand-more"}
                    size={26}
                    color={DT.textDark}
                  />
                </TouchableOpacity>

                {openCuenta ? (
                  <View style={styles.sectionContent}>
                    <View style={styles.profileCard}>
                      <View style={styles.identityCard}>
                        <View style={styles.avatarPlaceholder}>
                          <MaterialIcons name="person" size={26} color={DT.textSecondary} />
                        </View>
                        <View style={styles.identityTextWrap}>
                          <Text style={styles.identityName}>{userName}</Text>
                          <Text style={styles.identityRole}>{userRole}</Text>
                        </View>
                      </View>

                      {!isGuest && (
                        <TouchableOpacity style={styles.primaryAction} onPress={handleEditarPerfil}>
                          <MaterialIcons name="person" size={18} color={DT.textOnPrimary} />
                          <Text style={styles.primaryActionText}>Cuenta y perfil</Text>
                        </TouchableOpacity>
                      )}

                      {!isGuest && (
                        <TouchableOpacity
                          style={styles.secondaryAction}
                          onPress={handleCambiarContrasena}
                        >
                          <MaterialIcons name="lock" size={18} color={DT.textDark} />
                          <Text style={styles.secondaryActionText}>Cambiar contrasena</Text>
                        </TouchableOpacity>
                      )}

                      {can("cambiar_roles") && (
                        <TouchableOpacity
                          style={styles.secondaryAction}
                          onPress={() => (navigation as any).navigate("AdminRoles")}
                        >
                          <MaterialIcons
                            name="admin-panel-settings"
                            size={18}
                            color={DT.textDark}
                          />
                          <Text style={styles.secondaryActionText}>Administrar roles</Text>
                        </TouchableOpacity>
                      )}

                      {!isGuest && (
                        <TouchableOpacity
                          style={styles.secondaryAction}
                          onPress={() =>
                            Alert.alert(
                              "Próximamente",
                              "Esta función se implementará en una próxima actualización."
                            )
                          }
                          activeOpacity={0.82}
                        >
                          <MaterialIcons
                            name="workspace-premium"
                            size={18}
                            color={DT.textDark}
                          />
                          <Text style={styles.secondaryActionText}>Suscripcion y plan</Text>
                        </TouchableOpacity>
                      )}

                      {!isGuest && (
                        <TouchableOpacity
                          style={styles.secondaryAction}
                          onPress={() => (navigation as any).navigate("SesionesActivas")}
                          activeOpacity={0.82}
                        >
                          <MaterialIcons name="devices" size={18} color={DT.textDark} />
                          <Text style={styles.secondaryActionText}>Sesiones iniciadas</Text>
                        </TouchableOpacity>
                      )}

                      <TouchableOpacity
                        style={styles.secondaryAction}
                        onPress={() => (navigation as any).navigate("Terminos")}
                      >
                        <MaterialIcons name="policy" size={18} color={DT.textDark} />
                        <Text style={styles.secondaryActionText}>Privacidad y terminos</Text>
                      </TouchableOpacity>

                      {!isGuest && (
                        <TouchableOpacity style={styles.secondaryAction} onPress={onPressEliminar}>
                          <MaterialIcons name="delete" size={18} color={DT.danger} />
                          <Text style={[styles.secondaryActionText, { color: DT.danger }]}>
                            Eliminar cuenta
                          </Text>
                        </TouchableOpacity>
                      )}

                      <TouchableOpacity style={styles.logoutButton} onPress={handleCerrarSesion}>
                        <MaterialIcons
                          name={isGuest ? "login" : "logout"}
                          size={18}
                          color={DT.textOnPrimary}
                        />
                        <Text style={styles.logoutButtonText}>
                          {isGuest ? "Iniciar sesion" : "Cerrar sesion"}
                        </Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                ) : null}
              </View>

              {/* ── Destacados y Reseñas ── */}
              <View style={styles.promoSection}>
                <View style={styles.promoBanner}>
                  <Text style={styles.promoBannerText}>
                    Descubre funciones impresionantes{"\n"}dentro de PlanearIA.
                  </Text>
                </View>

                {FEATURE_HIGHLIGHTS.map((feat) => (
                  <View key={feat.title} style={styles.featureCard}>
                    <View style={[styles.featureIconWrap, { backgroundColor: feat.bg }]}>
                      <MaterialIcons name={feat.icon} size={22} color={feat.color} />
                    </View>
                    <View style={styles.featureTextWrap}>
                      <Text style={styles.featureTitle}>{feat.title}</Text>
                      <Text style={styles.featureDesc}>{feat.description}</Text>
                    </View>
                  </View>
                ))}
              </View>

              <View style={styles.promoSection}>
                <Text style={styles.promoKicker}>LO QUE DICEN LOS DOCENTES</Text>
                <Text style={styles.promoTitle}>Resenas de usuarios</Text>

                {REVIEWS.map((review) => (
                  <View key={review.name} style={styles.reviewCard}>
                    <View style={styles.reviewHeader}>
                      <View style={styles.reviewAvatar}>
                        <Text style={styles.reviewAvatarText}>{review.name[0]}</Text>
                      </View>
                      <View style={styles.reviewMeta}>
                        <Text style={styles.reviewName}>{review.name}</Text>
                        <Text style={styles.reviewRole}>{review.role}</Text>
                      </View>
                      <StarRow count={review.stars} />
                    </View>
                    <Text style={styles.reviewText}>&quot;{review.text}&quot;</Text>
                  </View>
                ))}
              </View>

              <Text style={styles.footerText}>PlanearIA v2.4.0 · Actualizado hace 2 dias</Text>
            </View>

            {wideLayout ? (
              <View style={styles.rightColumn}>
                <View style={styles.webCard}>
                  <Text style={styles.webCardTitle}>Resumen rapido</Text>
                  <Text style={styles.webSummaryText}>
                    Usa las secciones desplegables para personalizar accesibilidad, preferencias y
                    seguridad de tu cuenta.
                  </Text>
                </View>
              </View>
            ) : null}
          </View>
        </Animated.ScrollView>

        {/* Modal de confirmación de eliminación */}
        <Modal visible={showDeleteModal} transparent animationType="fade">
          <View style={styles.modalOverlay}>
            <View style={styles.modalCard}>
              <View style={styles.modalIconCircle}>
                <MaterialIcons name="warning" size={32} color={DT.error} />
              </View>
              <Text style={styles.modalTitle}>Eliminar cuenta</Text>
              <Text style={styles.modalSubtitle}>
                Ingresa tu contraseña para confirmar la eliminación permanente de tu cuenta y todos
                tus datos.
              </Text>

              {deleteError ? (
                <View style={styles.modalError}>
                  <MaterialIcons name="error-outline" size={16} color={DT.error} />
                  <Text style={styles.modalErrorText}>{deleteError}</Text>
                </View>
              ) : null}

              <TextInput
                style={styles.modalInput}
                placeholder="Tu contraseña"
                placeholderTextColor={DT.textTertiary}
                secureTextEntry
                value={deletePassword}
                onChangeText={setDeletePassword}
                editable={!deleteLoading}
                autoCapitalize="none"
              />

              <TouchableOpacity
                style={[styles.deleteBtn, deleteLoading && { opacity: 0.6 }]}
                onPress={confirmarEliminacion}
                disabled={deleteLoading}
                activeOpacity={0.85}
              >
                {deleteLoading ? (
                  <ActivityIndicator color={DT.textOnPrimary} size="small" />
                ) : (
                  <Text style={styles.deleteBtnText}>Eliminar mi cuenta</Text>
                )}
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.modalCancelBtn}
                onPress={() => setShowDeleteModal(false)}
                disabled={deleteLoading}
              >
                <Text style={styles.modalCancelText}>Cancelar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      </SafeAreaView>
    </View>
  );
};

const getStyles = (
  DT: any,
  isDark: boolean,
  scaled: (baseSize: number) => number,
  highContrast: boolean
) => {
  // "Contraste alto": refuerza texto secundario y bordes usando solo tokens del tema.
  const subtleText = highContrast ? DT.text : DT.textSecondary;
  const cardBorder = highContrast ? DT.borderStrong : DT.border;

  return StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: DT.background,
    },
    safeArea: {
      flex: 1,
    },
    scroller: {
      flex: 1,
    },
    scrollContent: {
      paddingHorizontal: 16,
      paddingTop: 54,
      paddingBottom: isWeb() ? 28 : 110,
      gap: 14,
      width: "100%",
      alignSelf: "center",
      maxWidth: 1220,
    },
    headerBlock: {
      marginBottom: 2,
    },
    aiBanner: {
      borderRadius: 20,
      paddingHorizontal: 18,
      paddingVertical: 18,
      backgroundColor: DT.bannerBg,
      minHeight: 130,
      justifyContent: "flex-end",
    },
    aiBannerKicker: {
      fontSize: scaled(12),
      fontWeight: "800",
      letterSpacing: 1.1,
      color: DT.bannerAccent,
    },
    aiBannerTitle: {
      marginTop: 4,
      fontSize: scaled(24),
      lineHeight: scaled(30),
      fontWeight: "800",
      color: DT.textOnPrimary,
    },
    layoutGrid: {
      gap: 12,
    },
    layoutGridWide: {
      flexDirection: "row",
      alignItems: "flex-start",
      justifyContent: "space-between",
    },
    leftColumn: {
      gap: 12,
    },
    leftColumnWide: {
      flex: 1,
      minWidth: 640,
      maxWidth: 860,
    },
    rightColumn: {
      width: 330,
    },
    sectionBlock: {
      borderRadius: 18,
      borderWidth: 1,
      borderColor: cardBorder,
      backgroundColor: DT.surfaceSecondary,
      overflow: "hidden",
    },
    sectionHeader: {
      paddingHorizontal: 14,
      paddingVertical: 12,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
    },
    sectionTitleWrap: {
      flexDirection: "row",
      alignItems: "center",
      gap: 8,
    },
    sectionTitle: {
      fontSize: scaled(25),
      fontWeight: "800",
      color: DT.text,
    },
    sectionContent: {
      paddingHorizontal: 12,
      paddingBottom: 12,
      gap: 10,
    },
    surfaceCard: {
      borderRadius: 16,
      backgroundColor: DT.surface,
      borderWidth: 1,
      borderColor: cardBorder,
      padding: 14,
      gap: 9,
    },
    blockKicker: {
      fontSize: scaled(12),
      fontWeight: "800",
      color: subtleText,
      letterSpacing: 1.2,
    },
    blockTitle: {
      fontSize: scaled(24),
      fontWeight: "700",
      color: DT.text,
    },
    segmentedBar: {
      borderRadius: 999,
      backgroundColor: DT.progressTrack,
      padding: 5,
      flexDirection: "row",
      alignItems: "center",
      gap: 6,
    },
    segmentOption: {
      flex: 1,
      borderRadius: 999,
      paddingVertical: 9,
      alignItems: "center",
      justifyContent: "center",
    },
    segmentOptionActive: {
      backgroundColor: DT.toggleActive,
      boxShadow: "0px 8px 16px rgba(13, 97, 178, 0.24)",
    },
    segmentText: {
      fontSize: scaled(16),
      color: subtleText,
      fontWeight: "600",
    },
    segmentTextActive: {
      color: DT.textOnPrimary,
      fontWeight: "800",
    },
    rowBetween: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      gap: 10,
    },
    rowTextWrap: {
      flex: 1,
      gap: 2,
    },
    rowTitle: {
      fontSize: scaled(21),
      fontWeight: "700",
      color: DT.text,
      lineHeight: scaled(26),
    },
    rowSubtitle: {
      fontSize: scaled(14),
      color: subtleText,
      lineHeight: scaled(19),
    },
    toggleTrack: {
      width: 56,
      height: 32,
      borderRadius: 999,
      backgroundColor: DT.borderStrong,
      padding: 3,
      justifyContent: "center",
    },
    toggleTrackOn: {
      backgroundColor: DT.toggleActive,
    },
    toggleThumb: {
      width: 26,
      height: 26,
      borderRadius: 13,
      backgroundColor: DT.surface,
    },
    toggleThumbOn: {
      alignSelf: "flex-end",
    },
    radioRow: {
      borderRadius: 13,
      borderWidth: 1,
      borderColor: DT.borderStrong,
      backgroundColor: DT.backgroundSoft,
      paddingHorizontal: 13,
      paddingVertical: 11,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
    },
    radioRowActive: {
      borderColor: DT.primary,
      backgroundColor: DT.primaryTint,
    },
    radioText: {
      fontSize: scaled(20),
      color: subtleText,
      fontWeight: "500",
    },
    radioTextActive: {
      color: DT.toggleActive,
      fontWeight: "700",
    },
    surfaceRowCard: {
      borderRadius: 16,
      backgroundColor: DT.surface,
      borderWidth: 1,
      borderColor: cardBorder,
      paddingHorizontal: 14,
      paddingVertical: 12,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      gap: 10,
    },
    surfaceRowLeft: {
      flexDirection: "row",
      alignItems: "center",
      gap: 9,
      flex: 1,
    },
    surfaceRowTextWrap: {
      flex: 1,
      gap: 1,
    },
    surfaceRowTitle: {
      fontSize: scaled(20),
      fontWeight: "700",
      color: DT.text,
    },
    surfaceRowSoon: {
      fontSize: scaled(13),
      color: subtleText,
      fontWeight: "600",
    },
    preferenceRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: 10,
    },
    prefIconWrap: {
      width: 48,
      height: 48,
      borderRadius: 12,
      backgroundColor: DT.skeleton,
      alignItems: "center",
      justifyContent: "center",
    },
    prefTextWrap: {
      flex: 1,
      gap: 1,
    },
    prefTitle: {
      fontSize: scaled(20),
      fontWeight: "700",
      color: DT.text,
    },
    prefSubtitle: {
      fontSize: scaled(14),
      color: subtleText,
    },
    rowDivider: {
      height: 1,
      backgroundColor: DT.divider,
      marginVertical: 4,
    },
    profileCard: {
      borderRadius: 16,
      backgroundColor: DT.progressTrack,
      borderWidth: 1,
      borderColor: cardBorder,
      padding: 12,
      gap: 9,
    },
    identityCard: {
      borderRadius: 14,
      backgroundColor: DT.surface,
      paddingVertical: 10,
      paddingHorizontal: 12,
      flexDirection: "row",
      alignItems: "center",
      gap: 10,
    },
    avatarPlaceholder: {
      width: 46,
      height: 46,
      borderRadius: 23,
      backgroundColor: DT.surfaceTertiary,
      alignItems: "center",
      justifyContent: "center",
    },
    identityTextWrap: {
      flex: 1,
    },
    identityName: {
      fontSize: scaled(22),
      fontWeight: "800",
      color: DT.text,
      lineHeight: scaled(26),
    },
    identityRole: {
      marginTop: 1,
      fontSize: scaled(15),
      color: subtleText,
    },
    primaryAction: {
      borderRadius: 13,
      backgroundColor: DT.primary,
      paddingVertical: 12,
      paddingHorizontal: 13,
      flexDirection: "row",
      alignItems: "center",
      gap: 9,
    },
    primaryActionText: {
      color: DT.textOnPrimary,
      fontSize: scaled(17),
      fontWeight: "700",
    },
    secondaryAction: {
      borderRadius: 12,
      backgroundColor: DT.surfaceSecondary,
      paddingVertical: 12,
      paddingHorizontal: 13,
      flexDirection: "row",
      alignItems: "center",
      gap: 9,
    },
    secondaryActionText: {
      color: DT.textDark,
      fontSize: scaled(17),
      fontWeight: "600",
    },
    logoutButton: {
      borderRadius: 13,
      backgroundColor: DT.danger,
      paddingVertical: 12,
      paddingHorizontal: 13,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      gap: 9,
    },
    logoutButtonText: {
      color: DT.textOnPrimary,
      fontSize: scaled(17),
      fontWeight: "700",
    },
    // Promo & Reviews
    promoSection: {
      gap: 10,
      marginTop: 6,
    },
    promoBanner: {
      borderRadius: 16,
      padding: 24,
      backgroundColor: "#D5C4A1",
      marginBottom: 4,
    },
    promoBannerText: {
      fontSize: scaled(18),
      fontWeight: "800",
      color: "#3E2C1A",
      lineHeight: scaled(24),
    },
    promoKicker: {
      fontSize: scaled(12),
      fontWeight: "800",
      letterSpacing: 1.2,
      color: subtleText,
      paddingHorizontal: 4,
    },
    promoTitle: {
      fontSize: scaled(22),
      fontWeight: "800",
      color: DT.text,
      paddingHorizontal: 4,
      marginBottom: 2,
    },
    featureCard: {
      borderRadius: 16,
      backgroundColor: DT.surface,
      borderWidth: 1,
      borderColor: cardBorder,
      padding: 14,
      flexDirection: "row",
      alignItems: "center",
      gap: 12,
    },
    featureIconWrap: {
      width: 48,
      height: 48,
      borderRadius: 14,
      alignItems: "center",
      justifyContent: "center",
    },
    featureTextWrap: {
      flex: 1,
      gap: 3,
    },
    featureTitle: {
      fontSize: scaled(17),
      fontWeight: "700",
      color: DT.text,
    },
    featureDesc: {
      fontSize: scaled(13),
      color: subtleText,
      lineHeight: scaled(18),
    },
    reviewCard: {
      borderRadius: 16,
      backgroundColor: DT.surface,
      borderWidth: 1,
      borderColor: cardBorder,
      padding: 14,
      gap: 10,
    },
    reviewHeader: {
      flexDirection: "row",
      alignItems: "center",
      gap: 10,
    },
    reviewAvatar: {
      width: 36,
      height: 36,
      borderRadius: 18,
      backgroundColor: DT.surfaceTertiary,
      alignItems: "center",
      justifyContent: "center",
    },
    reviewAvatarText: {
      fontSize: scaled(16),
      fontWeight: "800",
      color: DT.textSecondary,
    },
    reviewMeta: {
      flex: 1,
      gap: 1,
    },
    reviewName: {
      fontSize: scaled(15),
      fontWeight: "700",
      color: DT.text,
    },
    reviewRole: {
      fontSize: scaled(12),
      color: subtleText,
    },
    reviewText: {
      fontSize: scaled(14),
      color: subtleText,
      lineHeight: scaled(20),
      fontStyle: "italic",
    },
    footerText: {
      marginTop: 10,
      textAlign: "center",
      fontSize: scaled(15),
      color: DT.textMuted,
    },
    webCard: {
      borderRadius: 16,
      borderWidth: 1,
      borderColor: cardBorder,
      backgroundColor: DT.surface,
      padding: 14,
      gap: 10,
    },
    webCardTitle: {
      fontSize: scaled(15),
      fontWeight: "700",
      color: DT.textDark,
    },
    webSummaryText: {
      fontSize: scaled(14),
      color: subtleText,
      lineHeight: scaled(20),
    },
    // Modal styles
    modalOverlay: {
      flex: 1,
      backgroundColor: DT.overlay,
      justifyContent: "center",
      alignItems: "center",
      paddingHorizontal: 24,
    },
    modalCard: {
      backgroundColor: DT.surface,
      borderRadius: 20,
      padding: 28,
      width: "100%",
      maxWidth: 400,
      alignItems: "center",
    },
    modalIconCircle: {
      width: 64,
      height: 64,
      borderRadius: 32,
      backgroundColor: DT.errorTint,
      alignItems: "center",
      justifyContent: "center",
      marginBottom: 16,
    },
    modalTitle: {
      fontSize: scaled(20),
      fontWeight: "800",
      color: DT.text,
      marginBottom: 8,
    },
    modalSubtitle: {
      fontSize: scaled(14),
      color: subtleText,
      textAlign: "center",
      lineHeight: scaled(20),
      marginBottom: 16,
    },
    modalError: {
      flexDirection: "row",
      alignItems: "center",
      gap: 6,
      backgroundColor: DT.errorTint,
      borderRadius: 10,
      paddingHorizontal: 12,
      paddingVertical: 8,
      marginBottom: 12,
      width: "100%",
    },
    modalErrorText: {
      fontSize: scaled(13),
      color: DT.error,
      flex: 1,
    },
    modalInput: {
      borderWidth: 1.5,
      borderColor: DT.borderLight,
      borderRadius: 12,
      paddingHorizontal: 14,
      paddingVertical: 12,
      fontSize: scaled(16),
      color: DT.text,
      backgroundColor: DT.backgroundSoft,
      width: "100%",
      marginBottom: 16,
    },
    deleteBtn: {
      backgroundColor: DT.error,
      borderRadius: 12,
      paddingVertical: 14,
      alignItems: "center",
      width: "100%",
      marginBottom: 10,
    },
    deleteBtnText: {
      color: DT.textOnPrimary,
      fontSize: scaled(16),
      fontWeight: "700",
    },
    modalCancelBtn: {
      paddingVertical: 12,
      alignItems: "center",
      width: "100%",
    },
    modalCancelText: {
      fontSize: scaled(16),
      fontWeight: "600",
      color: subtleText,
    },
  });
};

export default CuentaScreen;
