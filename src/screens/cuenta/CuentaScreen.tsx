import React from "react";
import {
  Animated,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  useWindowDimensions,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import AnimatedTopPill from "../../components/AnimatedTopPill";
import { isWeb } from "../../utils/responsive";
import { useCuentaViewModel } from "../../hooks/useCuentaViewModel";

const CuentaScreen: React.FC = () => {
  const { width } = useWindowDimensions();
  const wideLayout = width >= 1080;
  const [scrollY] = React.useState(() => new Animated.Value(0));
  const [viewportHeight, setViewportHeight] = React.useState(0);
  const [contentHeight, setContentHeight] = React.useState(0);

  const [fontSizeMode, setFontSizeMode] = React.useState<"Pequeno" | "Medio" | "Grande">("Medio");
  const [highContrast, setHighContrast] = React.useState(true);
  const [voiceReading, setVoiceReading] = React.useState(true);
  const [reduceMotion, setReduceMotion] = React.useState(true);
  const [darkMode, setDarkMode] = React.useState(true);
  const [daltonismo, setDaltonismo] = React.useState<"Deuteranopia" | "Protanopia">("Deuteranopia");

  const [openAccesibilidad, setOpenAccesibilidad] = React.useState(false);
  const [openPreferencias, setOpenPreferencias] = React.useState(false);
  const [openCuenta, setOpenCuenta] = React.useState(false);

  const { handleEditarPerfil, handleCambiarContrasena, handleCerrarSesion } = useCuentaViewModel();

  const isCollapsedView = !openAccesibilidad && !openPreferencias && !openCuenta;
  const enablePillFade = contentHeight > viewportHeight + 6;

  const mobilePillOpacity = scrollY.interpolate({
    inputRange: [0, 16, 42],
    outputRange: [1, 0.5, 0],
    extrapolate: "clamp",
  });

  const mobilePillTranslateY = scrollY.interpolate({
    inputRange: [0, 42],
    outputRange: [0, -16],
    extrapolate: "clamp",
  });

  return (
    <View style={styles.container}>
      <StatusBar backgroundColor="#EEF3FA" barStyle="dark-content" />

      <SafeAreaView style={styles.safeArea}>
        <Animated.ScrollView
          contentContainerStyle={[
            styles.scrollContent,
            isCollapsedView && styles.scrollContentCentered,
          ]}
          onLayout={(event) => setViewportHeight(event.nativeEvent.layout.height)}
          onContentSizeChange={(_, h) => setContentHeight(h)}
          onScroll={Animated.event([{ nativeEvent: { contentOffset: { y: scrollY } } }], {
            useNativeDriver: true,
          })}
          scrollEventThrottle={16}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.headerBlock}>
            <Animated.View
              style={{
                opacity: enablePillFade ? mobilePillOpacity : 1,
                transform: [{ translateY: enablePillFade ? mobilePillTranslateY : 0 }],
              }}
            >
              <AnimatedTopPill
                icon="settings"
                title="Configuracion"
                subtitle="Ajusta accesibilidad, preferencias y cuenta"
              />
            </Animated.View>
          </View>

          <View style={styles.aiBanner}>
            <Text style={styles.aiBannerKicker}>NUEVO EN PLANEARIA</Text>
            <Text style={styles.aiBannerTitle}>Asistente de Accesibilidad por IA</Text>
          </View>

          <View style={[styles.layoutGrid, wideLayout && styles.layoutGridWide]}>
            <View style={[styles.leftColumn, wideLayout && styles.leftColumnWide]}>
              <View style={styles.sectionBlock}>
                <TouchableOpacity
                  style={styles.sectionHeader}
                  activeOpacity={0.82}
                  onPress={() => setOpenAccesibilidad((prev) => !prev)}
                >
                  <View style={styles.sectionTitleWrap}>
                    <MaterialIcons name="accessibility-new" size={20} color="#0A6AB0" />
                    <Text style={styles.sectionTitle}>Accesibilidad</Text>
                  </View>
                  <MaterialIcons
                    name={openAccesibilidad ? "expand-less" : "expand-more"}
                    size={26}
                    color="#4A5E78"
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
                          onPress={() => setHighContrast((prev) => !prev)}
                          activeOpacity={0.9}
                        >
                          <View
                            style={[styles.toggleThumb, highContrast && styles.toggleThumbOn]}
                          />
                        </TouchableOpacity>
                      </View>
                    </View>

                    <View style={styles.surfaceCard}>
                      <Text style={styles.rowTitle}>Modo Daltonismo</Text>
                      <TouchableOpacity
                        style={[
                          styles.radioRow,
                          daltonismo === "Deuteranopia" && styles.radioRowActive,
                        ]}
                        onPress={() => setDaltonismo("Deuteranopia")}
                        activeOpacity={0.85}
                      >
                        <Text
                          style={[
                            styles.radioText,
                            daltonismo === "Deuteranopia" && styles.radioTextActive,
                          ]}
                        >
                          Deuteranopia
                        </Text>
                        {daltonismo === "Deuteranopia" ? (
                          <MaterialIcons name="check-circle" size={20} color="#0A6AB0" />
                        ) : null}
                      </TouchableOpacity>

                      <TouchableOpacity
                        style={[
                          styles.radioRow,
                          daltonismo === "Protanopia" && styles.radioRowActive,
                        ]}
                        onPress={() => setDaltonismo("Protanopia")}
                        activeOpacity={0.85}
                      >
                        <Text
                          style={[
                            styles.radioText,
                            daltonismo === "Protanopia" && styles.radioTextActive,
                          ]}
                        >
                          Protanopia
                        </Text>
                        {daltonismo === "Protanopia" ? (
                          <MaterialIcons name="check-circle" size={20} color="#0A6AB0" />
                        ) : null}
                      </TouchableOpacity>
                    </View>

                    <View style={styles.surfaceRowCard}>
                      <View style={styles.surfaceRowLeft}>
                        <MaterialIcons name="record-voice-over" size={20} color="#0A728B" />
                        <Text style={styles.surfaceRowTitle}>Lectura de voz</Text>
                      </View>
                      <TouchableOpacity
                        style={[styles.toggleTrack, voiceReading && styles.toggleTrackOn]}
                        onPress={() => setVoiceReading((prev) => !prev)}
                        activeOpacity={0.9}
                      >
                        <View style={[styles.toggleThumb, voiceReading && styles.toggleThumbOn]} />
                      </TouchableOpacity>
                    </View>

                    <View style={styles.surfaceRowCard}>
                      <View style={styles.surfaceRowLeft}>
                        <MaterialIcons name="motion-photos-off" size={20} color="#0A728B" />
                        <Text style={styles.surfaceRowTitle}>Reducir movimiento</Text>
                      </View>
                      <TouchableOpacity
                        style={[styles.toggleTrack, reduceMotion && styles.toggleTrackOn]}
                        onPress={() => setReduceMotion((prev) => !prev)}
                        activeOpacity={0.9}
                      >
                        <View style={[styles.toggleThumb, reduceMotion && styles.toggleThumbOn]} />
                      </TouchableOpacity>
                    </View>
                  </View>
                ) : null}
              </View>

              <View style={styles.sectionBlock}>
                <TouchableOpacity
                  style={styles.sectionHeader}
                  activeOpacity={0.82}
                  onPress={() => setOpenPreferencias((prev) => !prev)}
                >
                  <View style={styles.sectionTitleWrap}>
                    <MaterialIcons name="tune" size={20} color="#0A6AB0" />
                    <Text style={styles.sectionTitle}>Preferencias de app</Text>
                  </View>
                  <MaterialIcons
                    name={openPreferencias ? "expand-less" : "expand-more"}
                    size={26}
                    color="#4A5E78"
                  />
                </TouchableOpacity>

                {openPreferencias ? (
                  <View style={styles.sectionContent}>
                    <View style={styles.surfaceCard}>
                      <View style={styles.preferenceRow}>
                        <View style={styles.prefIconWrap}>
                          <MaterialIcons name="dark-mode" size={19} color="#4E5A70" />
                        </View>
                        <View style={styles.prefTextWrap}>
                          <Text style={styles.prefTitle}>Modo oscuro</Text>
                          <Text style={styles.prefSubtitle}>Actualmente activado</Text>
                        </View>
                        <TouchableOpacity
                          style={[styles.toggleTrack, darkMode && styles.toggleTrackOn]}
                          onPress={() => setDarkMode((prev) => !prev)}
                          activeOpacity={0.9}
                        >
                          <View style={[styles.toggleThumb, darkMode && styles.toggleThumbOn]} />
                        </TouchableOpacity>
                      </View>

                      <View style={styles.rowDivider} />

                      <TouchableOpacity style={styles.preferenceRow} activeOpacity={0.82}>
                        <View style={styles.prefIconWrap}>
                          <MaterialIcons name="translate" size={19} color="#4E5A70" />
                        </View>
                        <View style={styles.prefTextWrap}>
                          <Text style={styles.prefTitle}>Idioma</Text>
                          <Text style={styles.prefSubtitle}>Espanol (Espana)</Text>
                        </View>
                        <MaterialIcons name="chevron-right" size={22} color="#6A7890" />
                      </TouchableOpacity>
                    </View>
                  </View>
                ) : null}
              </View>

              <View style={styles.sectionBlock}>
                <TouchableOpacity
                  style={styles.sectionHeader}
                  activeOpacity={0.82}
                  onPress={() => setOpenCuenta((prev) => !prev)}
                >
                  <View style={styles.sectionTitleWrap}>
                    <MaterialIcons name="manage-accounts" size={20} color="#0A6AB0" />
                    <Text style={styles.sectionTitle}>Cuenta y seguridad</Text>
                  </View>
                  <MaterialIcons
                    name={openCuenta ? "expand-less" : "expand-more"}
                    size={26}
                    color="#4A5E78"
                  />
                </TouchableOpacity>

                {openCuenta ? (
                  <View style={styles.sectionContent}>
                    <View style={styles.profileCard}>
                      <View style={styles.identityCard}>
                        <View style={styles.avatarPlaceholder}>
                          <MaterialIcons name="person" size={26} color="#587096" />
                        </View>
                        <View style={styles.identityTextWrap}>
                          <Text style={styles.identityName}>Elena Rodriguez</Text>
                          <Text style={styles.identityRole}>Plan Premium Docente</Text>
                        </View>
                      </View>

                      <TouchableOpacity style={styles.primaryAction} onPress={handleEditarPerfil}>
                        <MaterialIcons name="person" size={18} color="#FFFFFF" />
                        <Text style={styles.primaryActionText}>Cuenta y perfil</Text>
                      </TouchableOpacity>

                      <TouchableOpacity
                        style={styles.secondaryAction}
                        onPress={handleCambiarContrasena}
                      >
                        <MaterialIcons name="lock" size={18} color="#4E5A70" />
                        <Text style={styles.secondaryActionText}>Cambiar contrasena</Text>
                      </TouchableOpacity>

                      <TouchableOpacity style={styles.secondaryAction} activeOpacity={0.82}>
                        <MaterialIcons name="workspace-premium" size={18} color="#4E5A70" />
                        <Text style={styles.secondaryActionText}>Suscripcion y plan</Text>
                      </TouchableOpacity>

                      <TouchableOpacity style={styles.secondaryAction} activeOpacity={0.82}>
                        <MaterialIcons name="devices" size={18} color="#4E5A70" />
                        <Text style={styles.secondaryActionText}>Sesiones iniciadas</Text>
                      </TouchableOpacity>

                      <TouchableOpacity style={styles.secondaryAction} activeOpacity={0.82}>
                        <MaterialIcons name="policy" size={18} color="#4E5A70" />
                        <Text style={styles.secondaryActionText}>Privacidad y terminos</Text>
                      </TouchableOpacity>

                      <TouchableOpacity style={styles.logoutButton} onPress={handleCerrarSesion}>
                        <MaterialIcons name="logout" size={18} color="#FFFFFF" />
                        <Text style={styles.logoutButtonText}>Cerrar sesion</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                ) : null}
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
      </SafeAreaView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#EEF3FA",
  },
  safeArea: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 14,
    paddingBottom: isWeb() ? 28 : 110,
    gap: 14,
    width: "100%",
    alignSelf: "center",
    maxWidth: 1260,
  },
  scrollContentCentered: {
    flexGrow: 1,
    justifyContent: "center",
  },
  headerBlock: {
    marginBottom: 2,
  },
  aiBanner: {
    borderRadius: 20,
    paddingHorizontal: 18,
    paddingVertical: 18,
    backgroundColor: "#09589E",
    minHeight: 130,
    justifyContent: "flex-end",
  },
  aiBannerKicker: {
    fontSize: 12,
    fontWeight: "800",
    letterSpacing: 1.1,
    color: "#A8D6FF",
  },
  aiBannerTitle: {
    marginTop: 4,
    fontSize: 24,
    lineHeight: 30,
    fontWeight: "800",
    color: "#FFFFFF",
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
    borderColor: "#DFE7F2",
    backgroundColor: "#ECF1F8",
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
    fontSize: 25,
    fontWeight: "800",
    color: "#132741",
  },
  sectionContent: {
    paddingHorizontal: 12,
    paddingBottom: 12,
    gap: 10,
  },
  surfaceCard: {
    borderRadius: 16,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E3EAF4",
    padding: 14,
    gap: 9,
  },
  blockKicker: {
    fontSize: 12,
    fontWeight: "800",
    color: "#50627C",
    letterSpacing: 1.2,
  },
  blockTitle: {
    fontSize: 24,
    fontWeight: "700",
    color: "#15243B",
  },
  segmentedBar: {
    borderRadius: 999,
    backgroundColor: "#E9EEF5",
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
    backgroundColor: "#0C74C6",
    boxShadow: "0px 8px 16px rgba(13, 97, 178, 0.24)",
  },
  segmentText: {
    fontSize: 16,
    color: "#354A66",
    fontWeight: "600",
  },
  segmentTextActive: {
    color: "#FFFFFF",
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
    fontSize: 21,
    fontWeight: "700",
    color: "#15243B",
    lineHeight: 26,
  },
  rowSubtitle: {
    fontSize: 14,
    color: "#5A6E88",
    lineHeight: 19,
  },
  toggleTrack: {
    width: 56,
    height: 32,
    borderRadius: 999,
    backgroundColor: "#D9E1ED",
    padding: 3,
    justifyContent: "center",
  },
  toggleTrackOn: {
    backgroundColor: "#0C74C6",
  },
  toggleThumb: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: "#FFFFFF",
  },
  toggleThumbOn: {
    alignSelf: "flex-end",
  },
  radioRow: {
    borderRadius: 13,
    borderWidth: 1,
    borderColor: "#D8E2F0",
    backgroundColor: "#F7FAFF",
    paddingHorizontal: 13,
    paddingVertical: 11,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  radioRowActive: {
    borderColor: "#9DC3E8",
    backgroundColor: "#F1F8FF",
  },
  radioText: {
    fontSize: 20,
    color: "#5A6E88",
    fontWeight: "500",
  },
  radioTextActive: {
    color: "#0C74C6",
    fontWeight: "700",
  },
  surfaceRowCard: {
    borderRadius: 16,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E3EAF4",
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
  surfaceRowTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#15243B",
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
    backgroundColor: "#EDF1F7",
    alignItems: "center",
    justifyContent: "center",
  },
  prefTextWrap: {
    flex: 1,
    gap: 1,
  },
  prefTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#15243B",
  },
  prefSubtitle: {
    fontSize: 14,
    color: "#5A6E88",
  },
  rowDivider: {
    height: 1,
    backgroundColor: "#E4ECF6",
    marginVertical: 4,
  },
  profileCard: {
    borderRadius: 16,
    backgroundColor: "#E9EEF5",
    borderWidth: 1,
    borderColor: "#DEE7F2",
    padding: 12,
    gap: 9,
  },
  identityCard: {
    borderRadius: 14,
    backgroundColor: "#FFFFFF",
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
    backgroundColor: "#D9E4F3",
    alignItems: "center",
    justifyContent: "center",
  },
  identityTextWrap: {
    flex: 1,
  },
  identityName: {
    fontSize: 22,
    fontWeight: "800",
    color: "#18273E",
    lineHeight: 26,
  },
  identityRole: {
    marginTop: 1,
    fontSize: 15,
    color: "#5A6E88",
  },
  primaryAction: {
    borderRadius: 13,
    backgroundColor: "#0F76C9",
    paddingVertical: 12,
    paddingHorizontal: 13,
    flexDirection: "row",
    alignItems: "center",
    gap: 9,
  },
  primaryActionText: {
    color: "#FFFFFF",
    fontSize: 17,
    fontWeight: "700",
  },
  secondaryAction: {
    borderRadius: 12,
    backgroundColor: "#EDF2F9",
    paddingVertical: 12,
    paddingHorizontal: 13,
    flexDirection: "row",
    alignItems: "center",
    gap: 9,
  },
  secondaryActionText: {
    color: "#31435E",
    fontSize: 17,
    fontWeight: "600",
  },
  logoutButton: {
    borderRadius: 13,
    backgroundColor: "#D34553",
    paddingVertical: 12,
    paddingHorizontal: 13,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 9,
  },
  logoutButtonText: {
    color: "#FFFFFF",
    fontSize: 17,
    fontWeight: "700",
  },
  footerText: {
    marginTop: 10,
    textAlign: "center",
    fontSize: 15,
    color: "#8B99AE",
  },
  webCard: {
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#E1E9F3",
    backgroundColor: "#FFFFFF",
    padding: 14,
    gap: 10,
  },
  webCardTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: "#2A3B56",
  },
  webSummaryText: {
    fontSize: 14,
    color: "#566A84",
    lineHeight: 20,
  },
});

export default CuentaScreen;
