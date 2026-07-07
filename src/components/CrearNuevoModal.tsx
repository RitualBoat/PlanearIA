import React, { useCallback } from "react";
import {
  View,
  Text,
  Modal,
  Pressable,
  StyleSheet,
  useWindowDimensions,
  Platform,
  ScrollView,
} from "react-native";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { LinearGradient } from "expo-linear-gradient";

const DT = {
  primary: "#004580",
  primaryContainer: "#005da8",
  primaryFixed: "#d4e3ff",
  onPrimary: "#ffffff",
  surfaceLow: "#eff4fb",
  surfaceLowest: "#ffffff",
  onSurface: "#171c21",
  onSurfaceVariant: "#414751",
  outline: "#727782",
  outlineVariant: "#c1c7d3",
  secondary: "#1b6d24",
  tertiaryFixed: "#ffdcc6",
  onTertiaryFixedVariant: "#723600",
  purple: "#6A1B9A",
  purpleBg: "#E1BEE7",
};

interface CrearNuevoModalProps {
  visible: boolean;
  onClose: () => void;
  onNavigate: (screen: string, params?: Record<string, unknown>) => void;
}

export const CrearNuevoModal: React.FC<CrearNuevoModalProps> = ({
  visible,
  onClose,
  onNavigate,
}) => {
  const { width } = useWindowDimensions();
  const isDesktop = width >= 900;

  const handleClose = useCallback(() => {
    onClose();
  }, [onClose]);

  const handleDirectNav = useCallback(
    (screen: string, params?: Record<string, unknown>) => {
      onClose();
      onNavigate(screen, params);
    },
    [onClose, onNavigate]
  );

  if (!visible) {
    return null;
  }

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
          {!isDesktop && (
            <View style={styles.handleContainer}>
              <View style={styles.handle} />
            </View>
          )}

          <View style={styles.header}>
            <Text style={styles.headerTitle}>Crear nuevo</Text>
            <Pressable
              style={({ pressed }) => [styles.closeBtn, pressed && { opacity: 0.6 }]}
              onPress={handleClose}
              accessibilityLabel="Cerrar"
            >
              <MaterialIcons name="close" size={20} color={DT.onSurfaceVariant} />
            </Pressable>
          </View>

          <ScrollView
            style={styles.scrollContent}
            contentContainerStyle={styles.scrollContentContainer}
            showsVerticalScrollIndicator={false}
            bounces={false}
            keyboardShouldPersistTaps="handled"
          >
            <Text style={styles.sectionLabel}>PLANEACIONES</Text>
            <View style={styles.sectionGap}>
              <Pressable
                style={({ pressed }) => [styles.optionRow, pressed && { opacity: 0.7 }]}
                onPress={() => handleDirectNav("CrearPlaneacion")}
                accessibilityLabel="Planeacion"
              >
                <View style={[styles.optionIconLg, { backgroundColor: DT.primaryContainer }]}>
                  <MaterialIcons name="event-note" size={24} color={DT.onPrimary} />
                </View>
                <View style={styles.optionText}>
                  <Text style={styles.optionTitle}>Planeacion</Text>
                  <Text style={styles.optionSubtitle}>
                    {isDesktop
                      ? "Elige plantilla y abre directo DocEditor tipo Word/Docs."
                      : "Selecciona plantilla y abre DocEditor."}
                  </Text>
                </View>
                <MaterialIcons name="chevron-right" size={22} color={DT.outlineVariant} />
              </Pressable>

              <Pressable
                style={({ pressed }) => [styles.optionRow, pressed && { opacity: 0.7 }]}
                onPress={() => handleDirectNav("EscanerPlantilla")}
                accessibilityLabel="Escanear plantilla"
              >
                <View style={[styles.optionIconLg, { backgroundColor: DT.primaryFixed }]}>
                  <MaterialIcons name="document-scanner" size={24} color={DT.primary} />
                </View>
                <View style={styles.optionText}>
                  <Text style={styles.optionTitle}>Escanear plantilla</Text>
                  <Text style={styles.optionSubtitle}>
                    {isDesktop
                      ? "Convierte Word/PDF a plantilla reutilizable para Planeaciones."
                      : "Crea una plantilla desde Word o PDF."}
                  </Text>
                </View>
              </Pressable>
            </View>

            <Text style={[styles.sectionLabel, { marginTop: 24 }]}>CONTENIDO</Text>
            <View style={styles.sectionGap}>
              <Pressable
                style={({ pressed }) => [styles.optionRow, pressed && { opacity: 0.7 }]}
                onPress={() => handleDirectNav("CrearRecurso")}
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
                      : "Sube archivos o multimedia."}
                  </Text>
                </View>
              </Pressable>

              <Pressable
                style={({ pressed }) => [styles.optionRow, pressed && { opacity: 0.7 }]}
                onPress={() => handleDirectNav("ListaEntregables")}
                accessibilityLabel="Entregable"
              >
                <View style={[styles.optionIconLg, { backgroundColor: DT.tertiaryFixed }]}>
                  <MaterialIcons name="assignment" size={24} color={DT.onTertiaryFixedVariant} />
                </View>
                <View style={styles.optionText}>
                  <Text style={styles.optionTitle}>Entregable</Text>
                  <Text style={styles.optionSubtitle}>
                    {isDesktop
                      ? "Crea actividades de evaluacion y tareas."
                      : "Define tareas y criterios."}
                  </Text>
                </View>
              </Pressable>

              <Pressable
                style={({ pressed }) => [styles.optionRow, pressed && { opacity: 0.7 }]}
                onPress={() => handleDirectNav("EditorPlantilla")}
                accessibilityLabel="Plantilla"
              >
                <View style={[styles.optionIconLg, { backgroundColor: DT.purpleBg }]}>
                  <MaterialIcons name="dashboard-customize" size={24} color={DT.purple} />
                </View>
                <View style={styles.optionText}>
                  <Text style={styles.optionTitle}>Plantilla</Text>
                  <Text style={styles.optionSubtitle}>
                    {isDesktop
                      ? "Guarda formatos reutilizables para tus recursos."
                      : "Guarda este formato para uso futuro."}
                  </Text>
                </View>
              </Pressable>
            </View>

            <Pressable
              style={({ pressed }) => [styles.importBtn, pressed && { opacity: 0.7 }]}
              onPress={() => handleDirectNav("ImportarPlaneacion")}
              accessibilityLabel="Importar desde archivo"
            >
              <MaterialIcons name="file-upload" size={20} color={DT.primary} />
              <Text style={styles.importText}>Importar desde archivo</Text>
            </Pressable>
          </ScrollView>
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
  scrollContentContainer: {
    paddingBottom: 10,
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
    borderColor: "rgba(0,69,128,0.10)",
  },
  importText: {
    fontWeight: "700",
    fontSize: 14,
    color: DT.primary,
    marginLeft: 12,
  },
});

export default CrearNuevoModal;
