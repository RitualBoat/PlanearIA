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
import { NivelAcademico } from "../../types/planeacion";

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
  iconBg: string;
  textColor: string;
}[] = [
  {
    key: NivelAcademico.PRIMARIA,
    label: "PRIMARIA",
    icon: "child-care",
    bg: DT.primaryFixed,
    iconBg: DT.primary,
    textColor: DT.onPrimaryFixed,
  },
  {
    key: NivelAcademico.SECUNDARIA,
    label: "SECUNDARIA",
    icon: "school",
    bg: DT.secondaryContainer,
    iconBg: DT.secondary,
    textColor: DT.onSecondaryFixedVariant,
  },
  {
    key: NivelAcademico.PREPARATORIA,
    label: "PREPARATORIA",
    icon: "menu-book",
    bg: DT.amberBg,
    iconBg: DT.tertiaryContainer,
    textColor: DT.onTertiaryFixedVariant,
  },
  {
    key: NivelAcademico.UNIVERSIDAD,
    label: "UNIVERSIDAD",
    icon: "account-balance",
    bg: DT.purpleBg,
    iconBg: DT.purple,
    textColor: DT.darkPurple,
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
        <Text style={styles.headerTitle}>Crear Nuevo</Text>
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
              <MaterialIcons name="edit-note" size={24} color={DT.onPrimary} />
            </View>
            <View style={styles.optionText}>
              <Text style={styles.optionTitle}>Planeación manual</Text>
              <Text style={styles.optionSubtitle}>Crea desde cero paso a paso</Text>
            </View>
          </TouchableOpacity>

          {/* Planeación con IA */}
          <TouchableOpacity
            style={styles.optionRow}
            onPress={() => handlePlaneacion("GenerarPlaneacionIA")}
            activeOpacity={0.7}
            accessibilityLabel="Planeación con IA"
          >
            <View style={[styles.optionIconLg, styles.gradientIcon]}>
              <MaterialIcons name="auto-awesome" size={24} color={DT.onPrimary} />
            </View>
            <View style={styles.optionText}>
              <View style={styles.optionTitleRow}>
                <Text style={styles.optionTitle}>Planeación con IA</Text>
                <View style={styles.iaBadge}>
                  <Text style={styles.iaBadgeText}>IA</Text>
                </View>
              </View>
              <Text style={styles.optionSubtitle}>Genera automáticamente</Text>
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
            <View style={[styles.optionIconSm, { backgroundColor: DT.secondaryContainer }]}>
              <MaterialIcons name="description" size={20} color={DT.onSecondaryFixedVariant} />
            </View>
            <View style={styles.optionText}>
              <Text style={styles.optionTitle}>Recurso</Text>
            </View>
          </TouchableOpacity>

          {/* Entregable */}
          <TouchableOpacity
            style={styles.optionRow}
            onPress={() => handleDirectNav("ListaEntregables")}
            activeOpacity={0.7}
            accessibilityLabel="Entregable"
          >
            <View style={[styles.optionIconSm, { backgroundColor: DT.tertiaryFixed }]}>
              <MaterialIcons name="assignment" size={20} color={DT.onTertiaryFixedVariant} />
            </View>
            <View style={styles.optionText}>
              <Text style={styles.optionTitle}>Entregable</Text>
            </View>
          </TouchableOpacity>

          {/* Plantilla */}
          <TouchableOpacity
            style={styles.optionRow}
            onPress={() => handleDirectNav("EditorPlantilla")}
            activeOpacity={0.7}
            accessibilityLabel="Plantilla"
          >
            <View style={[styles.optionIconSm, { backgroundColor: DT.primaryFixed }]}>
              <MaterialIcons
                name="dashboard-customize"
                size={20}
                color={DT.onPrimaryFixedVariant}
              />
            </View>
            <View style={styles.optionText}>
              <Text style={styles.optionTitle}>Plantilla</Text>
            </View>
          </TouchableOpacity>
        </View>

        {/* Import option */}
        <TouchableOpacity
          style={styles.importBtn}
          onPress={() => handleDirectNav("ImportarPlaneacion")}
          activeOpacity={0.7}
          accessibilityLabel="Importar planeación"
        >
          <MaterialIcons name="cloud-upload" size={20} color={DT.outline} />
          <Text style={styles.importText}>Importar planeación</Text>
        </TouchableOpacity>
      </ScrollView>
    </>
  );

  // ─── Render Level Selector ───
  const renderNivelSelector = () => (
    <>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.closeBtn} onPress={handleBack} accessibilityLabel="Volver">
          <MaterialIcons name="close" size={20} color={DT.onSurfaceVariant} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { marginLeft: 8 }]}>Selecciona el nivel</Text>
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
            <View style={styles.nivelLeft}>
              <View style={[styles.nivelIcon, { backgroundColor: nivel.iconBg }]}>
                <MaterialIcons name={nivel.icon} size={24} color="#ffffff" />
              </View>
              <Text style={[styles.nivelLabel, { color: nivel.textColor }]}>{nivel.label}</Text>
            </View>
            <MaterialIcons
              name="chevron-right"
              size={24}
              color={nivel.textColor}
              style={{ opacity: 0.4 }}
            />
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
    backgroundColor: "rgba(23, 28, 33, 0.20)",
    justifyContent: "flex-end",
    ...Platform.select({
      web: { backdropFilter: "blur(8px)" as never },
      default: {},
    }),
  },
  sheet: {
    backgroundColor: DT.surfaceLowest,
    borderTopLeftRadius: 40,
    borderTopRightRadius: 40,
    paddingBottom: Platform.OS === "ios" ? 40 : 32,
    maxHeight: "85%",
    ...Platform.select({
      web: { boxShadow: "0px 0px 48px rgba(0,0,0,0.12)" as never },
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
  },
  handleContainer: {
    alignItems: "center",
    paddingTop: 16,
    paddingBottom: 8,
  },
  handle: {
    width: 48,
    height: 6,
    borderRadius: 3,
    backgroundColor: DT.surfaceHighest,
    opacity: 0.6,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 24,
    paddingVertical: 16,
  },
  headerTitle: {
    flex: 1,
    fontFamily: "Manrope",
    fontWeight: "700",
    fontSize: 18,
    color: DT.primary,
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
    paddingHorizontal: 24,
  },
  sectionLabel: {
    fontFamily: "Manrope",
    fontSize: 10,
    fontWeight: "700",
    letterSpacing: 2,
    textTransform: "uppercase",
    color: DT.outline,
    marginBottom: 12,
    paddingHorizontal: 4,
  },
  sectionGap: {
    gap: 12,
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
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
  },
  optionIconSm: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  gradientIcon: {
    backgroundColor: DT.primaryContainer,
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
    fontFamily: "Manrope",
    fontWeight: "700",
    fontSize: 16,
    color: DT.onSurface,
  },
  optionSubtitle: {
    fontFamily: "Manrope",
    fontWeight: "500",
    fontSize: 12,
    color: DT.onSurfaceVariant,
    marginTop: 2,
  },
  iaBadge: {
    backgroundColor: DT.primaryFixed,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 999,
  },
  iaBadgeText: {
    fontFamily: "Manrope",
    fontWeight: "900",
    fontSize: 9,
    color: DT.onPrimaryFixed,
    textTransform: "uppercase",
    letterSpacing: -0.5,
  },
  importBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
    marginTop: 24,
    borderRadius: 16,
    borderWidth: 2,
    borderStyle: "dashed",
    borderColor: `${DT.outlineVariant}4D`,
    backgroundColor: DT.surface,
  },
  importText: {
    fontFamily: "Manrope",
    fontWeight: "700",
    fontSize: 14,
    color: DT.onSurfaceVariant,
    marginLeft: 12,
  },

  // ─── Nivel Selector ───
  nivelList: {
    paddingHorizontal: 24,
    paddingTop: 16,
    gap: 16,
  },
  nivelBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 24,
    borderRadius: 16,
  },
  nivelLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
  },
  nivelIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
  },
  nivelLabel: {
    fontFamily: "Manrope",
    fontWeight: "700",
    fontSize: 14,
    letterSpacing: 1.5,
    textTransform: "uppercase",
  },
  cancelBtn: {
    marginTop: 8,
    alignItems: "center",
    paddingVertical: 16,
    borderRadius: 999,
  },
  cancelText: {
    fontFamily: "Manrope",
    fontWeight: "700",
    fontSize: 14,
    color: DT.primaryContainer,
  },
});

export default CrearNuevoModal;
