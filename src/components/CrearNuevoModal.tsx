import React, { useState, useCallback } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  Pressable,
  StyleSheet,
  useWindowDimensions,
  Platform,
  ScrollView,
} from "react-native";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { LinearGradient } from "expo-linear-gradient";
import { NivelAcademico } from "../../types/planeacionV2";

// ─── Design tokens (Stitch 3.3.1) ───
const DT = {
  primary: "#004580",
  primaryContainer: "#005da8",
  primaryFixed: "#d4e3ff",
  onPrimaryFixed: "#001c39",
  onPrimaryFixedVariant: "#004884",
  onPrimary: "#ffffff",
  surface: "#f6f9ff",
  surfaceLow: "#eff4fb",
  surfaceHigh: "#e3e9f0",
  surfaceHighest: "#dee3ea",
  surfaceLowest: "#ffffff",
  onSurface: "#171c21",
  onSurfaceVariant: "#414751",
  outline: "#727782",
  outlineVariant: "#c1c7d3",
  secondary: "#1b6d24",
  secondaryContainer: "#a0f399",
  onSecondaryFixedVariant: "#005312",
  tertiaryContainer: "#924700",
  tertiaryFixed: "#ffdcc6",
  onTertiaryFixedVariant: "#723600",
  amber: "#7B3F00",
  amberBg: "#FFE0B2",
  purple: "#6A1B9A",
  purpleBg: "#E1BEE7",
  darkPurple: "#4A148C",
};

type CrearNuevoStep = "menu" | "nivel";

interface CrearNuevoModalProps {
  visible: boolean;
  onClose: () => void;
  onNavigate: (screen: string, params?: Record<string, unknown>) => void;
}

const NIVELES: {
  key: NivelAcademico;
  label: string;
  icon: keyof typeof MaterialIcons.glyphMap;
  bg: string;
  textColor: string;
}[] = [
  {
    key: NivelAcademico.PRIMARIA,
    label: "Primaria",
    icon: "child-care",
    bg: DT.primaryFixed,
    textColor: DT.primary,
  },
  {
    key: NivelAcademico.SECUNDARIA,
    label: "Secundaria",
    icon: "school",
    bg: DT.secondaryContainer,
    textColor: DT.secondary,
  },
  {
    key: NivelAcademico.PREPARATORIA,
    label: "Preparatoria",
    icon: "menu-book",
    bg: DT.amberBg,
    textColor: DT.amber,
  },
  {
    key: NivelAcademico.UNIVERSIDAD,
    label: "Universidad",
    icon: "account-balance",
    bg: DT.purpleBg,
    textColor: DT.purple,
  },
];

export const CrearNuevoModal: React.FC<CrearNuevoModalProps> = ({
  visible,
  onClose,
  onNavigate,
}) => {
  const { width } = useWindowDimensions();
  const isDesktop = width >= 900;
  const [step, setStep] = useState<CrearNuevoStep>("menu");
  const [targetScreen, setTargetScreen] = useState<string>("CrearPlaneacion");

  const handleClose = useCallback(() => {
    setStep("menu");
    onClose();
  }, [onClose]);

  const handlePlaneacion = useCallback((screen: string) => {
    setTargetScreen(screen);
    setStep("nivel");
  }, []);

  const handleNivelSelect = useCallback(
    (nivel: NivelAcademico) => {
      setStep("menu");
      onClose();
      onNavigate(targetScreen, { nivel });
    },
    [targetScreen, onClose, onNavigate]
  );

  const handleDirectNav = useCallback(
    (screen: string, params?: Record<string, unknown>) => {
      setStep("menu");
      onClose();
      onNavigate(screen, params);
    },
    [onClose, onNavigate]
  );

  const handleBack = useCallback(() => {
    setStep("menu");
  }, []);

  // ─── Render Menu ───
  const renderMenu = () => (
    <>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Crear nuevo</Text>
        <TouchableOpacity style={styles.closeBtn} onPress={handleClose} accessibilityLabel="Cerrar">
          <MaterialIcons name="close" size={20} color={DT.onSurfaceVariant} />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.scrollContent} showsVerticalScrollIndicator={false} bounces={false}>
        {/* Section: PLANEACIONES */}
        <Text style={styles.sectionLabel}>PLANEACIONES</Text>
        <View style={styles.sectionGap}>
          {/* Planeación manual */}
          <TouchableOpacity
            style={styles.optionRow}
            onPress={() => handlePlaneacion("CrearPlaneacion")}
            activeOpacity={0.7}
            accessibilityLabel="Planeación manual"
          >
            <View style={[styles.optionIconLg, { backgroundColor: DT.primaryContainer }]}>
              <MaterialIcons name="event-note" size={24} color={DT.onPrimary} />
            </View>
            <View style={styles.optionText}>
              <Text style={styles.optionTitle}>Planeación manual</Text>
              <Text style={styles.optionSubtitle}>
                {isDesktop
                  ? "Diseña tu clase paso a paso con nuestras herramientas avanzadas."
                  : "Configura paso a paso tus objetivos."}
              </Text>
            </View>
            <MaterialIcons name="chevron-right" size={22} color={DT.outlineVariant} />
          </TouchableOpacity>

          {/* Planeación con IA */}
          <TouchableOpacity
            style={styles.optionRow}
            onPress={() => handlePlaneacion("GenerarPlaneacionIA")}
            activeOpacity={0.7}
            accessibilityLabel="Planeación con IA"
          >
            <LinearGradient
              colors={["#004580", "#005da8"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.optionIconLg}
            >
              <MaterialIcons name="auto-awesome" size={24} color={DT.onPrimary} />
            </LinearGradient>
            <View style={styles.optionText}>
              <View style={styles.optionTitleRow}>
                <Text style={styles.optionTitle}>Planeación con IA</Text>
                <View style={styles.iaBadge}>
                  <Text style={styles.iaBadgeText}>IA</Text>
                </View>
              </View>
              <Text style={styles.optionSubtitle}>
                {isDesktop
                  ? "Genera estructuras curriculares completas en segundos usando inteligencia artificial."
                  : "Genera propuestas inteligentes al instante."}
              </Text>
            </View>
          </TouchableOpacity>

          {/* Escaner de plantilla V2 */}
          <TouchableOpacity
            style={styles.optionRow}
            onPress={() => handleDirectNav("EscanerPlantilla")}
            activeOpacity={0.7}
            accessibilityLabel="Escanear plantilla"
          >
            <View style={[styles.optionIconLg, { backgroundColor: DT.primaryFixed }]}>
              <MaterialIcons name="document-scanner" size={24} color={DT.primary} />
            </View>
            <View style={styles.optionText}>
              <Text style={styles.optionTitle}>Escanear plantilla</Text>
              <Text style={styles.optionSubtitle}>
                {isDesktop
                  ? "Convierte un PDF o DOCX real en una estructura reutilizable para DocEditor."
                  : "Crea una plantilla desde PDF o DOCX."}
              </Text>
            </View>
          </TouchableOpacity>
        </View>

        {/* Section: CONTENIDO */}
        <Text style={[styles.sectionLabel, { marginTop: 24 }]}>CONTENIDO</Text>
        <View style={styles.sectionGap}>
          {/* Recurso */}
          <TouchableOpacity
            style={styles.optionRow}
            onPress={() => handleDirectNav("CrearRecurso")}
            activeOpacity={0.7}
            accessibilityLabel="Recurso"
          >
            <View style={[styles.optionIconLg, { backgroundColor: "rgba(160,244,153,0.3)" }]}>
              <MaterialIcons name="folder-special" size={24} color={DT.secondary} />
            </View>
            <View style={styles.optionText}>
              <Text style={styles.optionTitle}>Recurso</Text>
              <Text style={styles.optionSubtitle}>
                {isDesktop
                  ? "Sube documentos, videos o enlaces para tus alumnos."
                  : "Sube archivos, lecturas o multimedia."}
              </Text>
            </View>
          </TouchableOpacity>

          {/* Entregable */}
          <TouchableOpacity
            style={styles.optionRow}
            onPress={() => handleDirectNav("ListaEntregables")}
            activeOpacity={0.7}
            accessibilityLabel="Entregable"
          >
            <View style={[styles.optionIconLg, { backgroundColor: DT.tertiaryFixed }]}>
              <MaterialIcons name="assignment" size={24} color={DT.onTertiaryFixedVariant} />
            </View>
            <View style={styles.optionText}>
              <Text style={styles.optionTitle}>Entregable</Text>
              <Text style={styles.optionSubtitle}>
                {isDesktop
                  ? "Crea actividades de evaluación y tareas específicas."
                  : "Define tareas y criterios de evaluación."}
              </Text>
            </View>
          </TouchableOpacity>

          {/* Plantilla */}
          <TouchableOpacity
            style={styles.optionRow}
            onPress={() => handleDirectNav("EditorPlantilla")}
            activeOpacity={0.7}
            accessibilityLabel="Plantilla"
          >
            <View style={[styles.optionIconLg, { backgroundColor: DT.purpleBg }]}>
              <MaterialIcons name="dashboard-customize" size={24} color={DT.purple} />
            </View>
            <View style={styles.optionText}>
              <Text style={styles.optionTitle}>Plantilla</Text>
              <Text style={styles.optionSubtitle}>
                {isDesktop
                  ? "Guarda estructuras para reutilizarlas en futuros periodos."
                  : "Guarda este formato para uso futuro."}
              </Text>
            </View>
          </TouchableOpacity>
        </View>

        {/* Import option */}
        <TouchableOpacity
          style={styles.importBtn}
          onPress={() => handleDirectNav("ImportarPlaneacion")}
          activeOpacity={0.7}
          accessibilityLabel="Importar desde archivo"
        >
          <MaterialIcons name="file-upload" size={20} color={DT.primary} />
          <Text style={styles.importText}>Importar desde archivo</Text>
        </TouchableOpacity>
      </ScrollView>
    </>
  );

  // ─── Render Level Selector ───
  const renderNivelSelector = () => (
    <>
      {/* Header */}
      <View style={styles.nivelHeader}>
        {isDesktop && (
          <View style={styles.nivelSchoolIcon}>
            <MaterialIcons name="school" size={28} color={DT.primary} />
          </View>
        )}
        <Text style={styles.nivelTitle}>Selecciona el nivel</Text>
        {isDesktop && (
          <Text style={styles.nivelSubtitle}>Personaliza tu experiencia educativa</Text>
        )}
      </View>

      <View style={styles.nivelList}>
        {NIVELES.map((nivel) => (
          <TouchableOpacity
            key={nivel.key}
            style={[styles.nivelBtn, { backgroundColor: nivel.bg }]}
            onPress={() => handleNivelSelect(nivel.key)}
            activeOpacity={0.8}
            accessibilityLabel={nivel.label}
          >
            {isDesktop && (
              <View style={styles.nivelLeft}>
                <MaterialIcons name={nivel.icon} size={22} color={nivel.textColor} />
                <Text style={[styles.nivelLabel, { color: nivel.textColor }]}>{nivel.label}</Text>
              </View>
            )}
            {!isDesktop && (
              <>
                <Text style={[styles.nivelLabel, { color: nivel.textColor }]}>{nivel.label}</Text>
                <MaterialIcons name={nivel.icon} size={22} color={nivel.textColor} />
              </>
            )}
          </TouchableOpacity>
        ))}

        <TouchableOpacity style={styles.cancelBtn} onPress={handleBack} activeOpacity={0.7}>
          <Text style={styles.cancelText}>Cancelar</Text>
        </TouchableOpacity>
      </View>
    </>
  );

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={handleClose}
      statusBarTranslucent
    >
      <Pressable style={styles.overlay} onPress={handleClose}>
        <Pressable
          style={[styles.sheet, isDesktop && styles.sheetDesktop]}
          onPress={(e) => e.stopPropagation()}
        >
          {/* Handle bar (mobile only) */}
          {!isDesktop && (
            <View style={styles.handleContainer}>
              <View style={styles.handle} />
            </View>
          )}

          {step === "menu" ? renderMenu() : renderNivelSelector()}
        </Pressable>
      </Pressable>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,28,58,0.30)",
    justifyContent: "flex-end",
    ...Platform.select({
      web: { backdropFilter: "blur(4px)" as never },
      default: {},
    }),
  },
  sheet: {
    backgroundColor: DT.surfaceLowest,
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    paddingBottom: Platform.OS === "ios" ? 40 : 32,
    maxHeight: "85%",
    ...Platform.select({
      web: { boxShadow: "0px -24px 48px rgba(0,72,132,0.12)" as never },
      default: { elevation: 24 },
    }),
  },
  sheetDesktop: {
    alignSelf: "center",
    width: 480,
    borderRadius: 24,
    marginBottom: "auto",
    marginTop: "auto",
    maxHeight: "80%",
    ...Platform.select({
      web: { boxShadow: "0px 24px 48px rgba(0,72,132,0.08)" as never },
      default: { elevation: 24 },
    }),
  },
  handleContainer: {
    alignItems: "center",
    paddingTop: 16,
    paddingBottom: 8,
  },
  handle: {
    width: 40,
    height: 6,
    borderRadius: 3,
    backgroundColor: DT.outlineVariant,
    opacity: 0.4,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 24,
    paddingVertical: 16,
  },
  headerTitle: {
    flex: 1,
    fontWeight: "800",
    fontSize: 20,
    color: DT.primary,
    letterSpacing: -0.3,
  },
  closeBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: DT.surfaceLow,
    alignItems: "center",
    justifyContent: "center",
  },
  scrollContent: {
    paddingHorizontal: 16,
  },
  sectionLabel: {
    fontSize: 10,
    fontWeight: "800",
    letterSpacing: 1.5,
    textTransform: "uppercase",
    color: DT.outline,
    marginBottom: 8,
    paddingHorizontal: 16,
  },
  sectionGap: {
    gap: 8,
  },
  optionRow: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    backgroundColor: DT.surfaceLow,
    borderRadius: 16,
  },
  optionIconLg: {
    width: 48,
    height: 48,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  optionText: {
    marginLeft: 16,
    flex: 1,
  },
  optionTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  optionTitle: {
    fontWeight: "700",
    fontSize: 16,
    color: DT.onSurface,
  },
  optionSubtitle: {
    fontWeight: "400",
    fontSize: 14,
    color: DT.onSurfaceVariant,
    marginTop: 2,
    lineHeight: 18,
  },
  iaBadge: {
    backgroundColor: DT.primaryFixed,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  iaBadgeText: {
    fontWeight: "800",
    fontSize: 10,
    color: DT.primary,
    textTransform: "uppercase",
  },
  importBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: 16,
    marginTop: 24,
    marginBottom: 8,
    borderRadius: 12,
    borderWidth: 2,
    borderStyle: "dashed",
    borderColor: `rgba(0,69,128,0.10)`,
  },
  importText: {
    fontWeight: "700",
    fontSize: 14,
    color: DT.primary,
    marginLeft: 12,
  },

  // ─── Nivel Selector ───
  nivelHeader: {
    alignItems: "center",
    paddingHorizontal: 24,
    paddingTop: 8,
    paddingBottom: 16,
  },
  nivelSchoolIcon: {
    width: 56,
    height: 56,
    borderRadius: 16,
    backgroundColor: DT.surfaceLow,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
  },
  nivelTitle: {
    fontWeight: "800",
    fontSize: 20,
    color: DT.primary,
    letterSpacing: -0.3,
  },
  nivelSubtitle: {
    fontWeight: "500",
    fontSize: 14,
    color: DT.onSurfaceVariant,
    marginTop: 4,
  },
  nivelList: {
    paddingHorizontal: 24,
    paddingTop: 8,
    gap: 10,
  },
  nivelBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 999,
  },
  nivelLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  nivelLabel: {
    fontWeight: "700",
    fontSize: 16,
  },
  cancelBtn: {
    marginTop: 12,
    alignItems: "center",
    paddingVertical: 12,
  },
  cancelText: {
    fontWeight: "700",
    fontSize: 14,
    color: DT.onSurfaceVariant,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
});

export default CrearNuevoModal;
