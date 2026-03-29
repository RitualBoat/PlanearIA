import React, { useMemo } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
  ScrollView,
  Alert,
  Platform,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { useNavigation } from "@react-navigation/native";
import type { StackNavigationProp } from "@react-navigation/stack";
import { COLORS, FONT_SIZES } from "../../../types";
import type { RootStackParamList } from "../../navigation/StackNavigator";

type Nav = StackNavigationProp<RootStackParamList, "ImportarPlaneacion">;

const ImportarPlaneacionScreen: React.FC = () => {
  const navigation = useNavigation<Nav>();

  const actividadesPreview = useMemo(
    () => [
      {
        id: "01",
        titulo: "Inicio",
        descripcion: "Recuperación de conocimientos previos mediante lluvia de ideas.",
      },
      {
        id: "02",
        titulo: "Desarrollo",
        descripcion: "Explicación de la fórmula general y resolución de 5 ejercicios prácticos.",
      },
      {
        id: "03",
        titulo: "Cierre",
        descripcion: "Plenaria para aclarar dudas sobre los resultados obtenidos.",
      },
    ],
    []
  );

  const showPendingMessage = () => {
    const msg = "La selección y parseo de archivos se implementará en la siguiente tarea.";
    if (Platform.OS === "web") {
      window.alert(msg);
      return;
    }
    Alert.alert("Importar planeación", msg);
  };

  return (
    <View style={styles.container}>
      <StatusBar backgroundColor={COLORS.background} barStyle="dark-content" />

      <SafeAreaView style={styles.safeArea}>
        <View style={styles.headerRow}>
          <TouchableOpacity
            style={styles.headerIconButton}
            onPress={() => navigation.goBack()}
            accessibilityLabel="Regresar"
          >
            <MaterialIcons name="arrow-back" size={28} color={COLORS.primary} />
          </TouchableOpacity>

          <View style={styles.headerTitleWrap}>
            <Text style={styles.headerTitle}>Importar Planeación</Text>
            <Text style={styles.headerSubtitle}>Importa desde PDF o DOCX</Text>
          </View>

          <TouchableOpacity style={styles.headerIconButton} onPress={showPendingMessage}>
            <MaterialIcons name="more-vert" size={24} color={COLORS.textSecondary} />
          </TouchableOpacity>
        </View>

        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={true}
          bounces={false}
        >
          <View style={styles.card}>
            <Text style={styles.sectionTitle}>Seleccionar archivo</Text>

            <View style={styles.uploadZone}>
              <View style={styles.uploadIconCircle}>
                <MaterialIcons name="upload-file" size={28} color={COLORS.primary} />
              </View>
              <Text style={styles.uploadTitle}>Arrastra o selecciona un archivo</Text>
              <Text style={styles.uploadSubtitle}>Formatos permitidos: PDF, DOCX</Text>
            </View>

            <TouchableOpacity style={styles.primaryButton} onPress={showPendingMessage}>
              <MaterialIcons name="add" size={22} color={COLORS.surface} />
              <Text style={styles.primaryButtonText}>Seleccionar archivo</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.formatChipsRow}>
            <View style={styles.formatChip}>
              <MaterialIcons name="picture-as-pdf" size={18} color={COLORS.primary} />
              <Text style={styles.formatChipText}>PDF</Text>
            </View>
            <View style={styles.formatChip}>
              <MaterialIcons name="description" size={18} color={COLORS.primary} />
              <Text style={styles.formatChipText}>DOCX</Text>
            </View>
          </View>

          <View style={styles.errorCard}>
            <MaterialIcons name="warning-amber" size={28} color={COLORS.error} />
            <Text style={styles.errorText}>El formato .jpg no es compatible. Por favor usa PDF o DOCX.</Text>
          </View>

          <View style={styles.card}>
            <View style={styles.stateRow}>
              <View style={styles.stateIconCircle}>
                <MaterialIcons name="sync" size={24} color={COLORS.primary} />
              </View>
              <View style={styles.stateTextWrap}>
                <Text style={styles.stateTitle}>Procesando archivo...</Text>
                <Text style={styles.stateSubtitle}>Extrayendo contenido...</Text>
              </View>
            </View>

            <View style={styles.stateRowMuted}>
              <View style={[styles.stateIconCircle, styles.stateIconCircleMuted]}>
                <MaterialIcons name="check-circle" size={24} color={COLORS.secondary} />
              </View>
              <View style={styles.stateTextWrap}>
                <Text style={styles.stateTitleMuted}>Contenido extraído</Text>
                <Text style={styles.stateSubtitleMuted}>Correctamente procesado</Text>
              </View>
            </View>
          </View>

          <View style={styles.previewHeaderRow}>
            <Text style={styles.previewHeaderTitle}>Vista previa</Text>
            <View style={styles.badgeDraft}>
              <Text style={styles.badgeDraftText}>BORRADOR</Text>
            </View>
          </View>

          <View style={styles.card}>
            <Text style={styles.fieldLabel}>ASIGNATURA</Text>
            <View style={styles.fieldValueCardAccent}>
              <Text style={styles.fieldValueText}>Matemáticas Aplicadas</Text>
            </View>

            <Text style={styles.fieldLabel}>GRADO Y GRUPO</Text>
            <View style={styles.fieldValueCard}>
              <Text style={styles.fieldValueText}>3° Grado - Grupo B</Text>
            </View>

            <Text style={styles.fieldLabel}>TEMA DE LA SESIÓN</Text>
            <View style={styles.fieldValueCard}>
              <Text style={styles.fieldValueText}>Ecuaciones Cuadráticas Complejas</Text>
            </View>

            <View style={styles.structureTitleRow}>
              <MaterialIcons name="format-list-bulleted" size={20} color={COLORS.textSecondary} />
              <Text style={styles.structureTitle}>Estructura de Actividades</Text>
            </View>

            {actividadesPreview.map((item) => (
              <View key={item.id} style={styles.activityCard}>
                <View style={styles.activityIndexCircle}>
                  <Text style={styles.activityIndexText}>{item.id}</Text>
                </View>
                <View style={styles.activityTextWrap}>
                  <Text style={styles.activityTitle}>{item.titulo}</Text>
                  <Text style={styles.activityDesc}>{item.descripcion}</Text>
                </View>
              </View>
            ))}

            <View style={styles.dualInfoRow}>
              <View style={styles.infoMiniCardWarm}>
                <Text style={styles.miniCardTitle}>Evaluación</Text>
                <Text style={styles.miniCardText}>Lista de cotejo</Text>
              </View>
              <View style={styles.infoMiniCardCool}>
                <Text style={styles.miniCardTitle}>Recursos</Text>
                <Text style={styles.miniCardText}>Libro, Pizarrón</Text>
              </View>
            </View>

            <View style={styles.infoNotice}>
              <MaterialIcons name="info" size={22} color={COLORS.primary} />
              <Text style={styles.infoNoticeText}>
                Puedes ajustar estos datos antes de guardar definitivamente en tu repositorio.
              </Text>
            </View>
          </View>

          <TouchableOpacity style={styles.primaryButtonLarge} onPress={showPendingMessage}>
            <MaterialIcons name="save-alt" size={22} color={COLORS.surface} />
            <Text style={styles.primaryButtonLargeText}>Importar y continuar</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.cancelButton} onPress={() => navigation.goBack()}>
            <Text style={styles.cancelButtonText}>Cancelar</Text>
          </TouchableOpacity>

          <View style={styles.spacer} />
        </ScrollView>
      </SafeAreaView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  safeArea: {
    flex: 1,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 14,
    paddingTop: 4,
    paddingBottom: 10,
    gap: 8,
  },
  headerIconButton: {
    width: 36,
    height: 36,
    alignItems: "center",
    justifyContent: "center",
  },
  headerTitleWrap: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 38 / 2,
    fontWeight: "700",
    color: COLORS.primary,
  },
  headerSubtitle: {
    marginTop: 2,
    fontSize: FONT_SIZES.large,
    color: COLORS.text,
  },
  scrollContent: {
    paddingHorizontal: 14,
    paddingBottom: 34,
    gap: 14,
  },
  card: {
    backgroundColor: COLORS.surface,
    borderRadius: 18,
    padding: 16,
    gap: 12,
  },
  sectionTitle: {
    fontSize: 34 / 2,
    fontWeight: "700",
    color: COLORS.text,
  },
  uploadZone: {
    borderWidth: 1,
    borderStyle: "dashed",
    borderColor: COLORS.textSecondary + "44",
    borderRadius: 16,
    minHeight: 230,
    alignItems: "center",
    justifyContent: "center",
    padding: 16,
    gap: 8,
    backgroundColor: COLORS.background,
  },
  uploadIconCircle: {
    width: 82,
    height: 82,
    borderRadius: 41,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: COLORS.secondary,
  },
  uploadTitle: {
    textAlign: "center",
    color: COLORS.text,
    fontSize: FONT_SIZES.xlarge,
    fontWeight: "700",
  },
  uploadSubtitle: {
    textAlign: "center",
    color: COLORS.textSecondary,
    fontSize: FONT_SIZES.large,
  },
  primaryButton: {
    minHeight: 64,
    borderRadius: 16,
    backgroundColor: COLORS.primary,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: 8,
  },
  primaryButtonText: {
    color: COLORS.surface,
    fontSize: FONT_SIZES.xxlarge,
    fontWeight: "700",
  },
  formatChipsRow: {
    flexDirection: "row",
    gap: 10,
  },
  formatChip: {
    borderRadius: 22,
    paddingVertical: 10,
    paddingHorizontal: 16,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: COLORS.secondary,
  },
  formatChipText: {
    color: COLORS.text,
    fontSize: FONT_SIZES.large,
    fontWeight: "700",
  },
  errorCard: {
    borderWidth: 1,
    borderColor: COLORS.error + "66",
    borderRadius: 16,
    padding: 14,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    backgroundColor: "#fff7f7",
  },
  errorText: {
    flex: 1,
    color: "#b3261e",
    fontSize: FONT_SIZES.large,
    lineHeight: 28,
    fontWeight: "600",
  },
  stateRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  stateRowMuted: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    opacity: 0.65,
  },
  stateIconCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: COLORS.background,
  },
  stateIconCircleMuted: {
    backgroundColor: COLORS.secondary,
  },
  stateTextWrap: {
    flex: 1,
  },
  stateTitle: {
    fontSize: 36 / 2,
    color: COLORS.text,
    fontWeight: "700",
  },
  stateSubtitle: {
    marginTop: 2,
    fontSize: FONT_SIZES.xlarge,
    color: COLORS.textSecondary,
  },
  stateTitleMuted: {
    fontSize: 36 / 2,
    color: COLORS.textSecondary,
    fontWeight: "700",
  },
  stateSubtitleMuted: {
    marginTop: 2,
    fontSize: FONT_SIZES.xlarge,
    color: COLORS.textSecondary,
  },
  previewHeaderRow: {
    marginTop: 8,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  previewHeaderTitle: {
    color: COLORS.text,
    fontSize: 46 / 2,
    fontWeight: "700",
  },
  badgeDraft: {
    borderRadius: 10,
    backgroundColor: COLORS.secondary,
    paddingVertical: 6,
    paddingHorizontal: 12,
  },
  badgeDraftText: {
    color: COLORS.primary,
    fontSize: FONT_SIZES.small,
    fontWeight: "800",
    letterSpacing: 1,
  },
  fieldLabel: {
    color: COLORS.textSecondary,
    fontSize: FONT_SIZES.medium,
    fontWeight: "700",
  },
  fieldValueCard: {
    borderRadius: 14,
    backgroundColor: COLORS.background,
    minHeight: 60,
    paddingHorizontal: 14,
    justifyContent: "center",
  },
  fieldValueCardAccent: {
    borderRadius: 14,
    backgroundColor: COLORS.background,
    minHeight: 60,
    paddingHorizontal: 14,
    justifyContent: "center",
    borderLeftWidth: 4,
    borderLeftColor: COLORS.primary,
  },
  fieldValueText: {
    color: COLORS.text,
    fontSize: FONT_SIZES.xxlarge,
    fontWeight: "600",
  },
  structureTitleRow: {
    marginTop: 8,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  structureTitle: {
    color: COLORS.text,
    fontSize: FONT_SIZES.xlarge,
    fontWeight: "700",
  },
  activityCard: {
    borderRadius: 16,
    backgroundColor: COLORS.background,
    padding: 14,
    flexDirection: "row",
    gap: 12,
  },
  activityIndexCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: COLORS.primary,
    alignItems: "center",
    justifyContent: "center",
  },
  activityIndexText: {
    color: COLORS.surface,
    fontSize: FONT_SIZES.medium,
    fontWeight: "700",
  },
  activityTextWrap: {
    flex: 1,
    gap: 2,
  },
  activityTitle: {
    color: COLORS.text,
    fontSize: FONT_SIZES.xxlarge,
    fontWeight: "700",
  },
  activityDesc: {
    color: COLORS.text,
    fontSize: FONT_SIZES.large,
    lineHeight: 30,
  },
  dualInfoRow: {
    flexDirection: "row",
    gap: 10,
  },
  infoMiniCardWarm: {
    flex: 1,
    borderRadius: 16,
    padding: 14,
    backgroundColor: "#f3ece1",
    gap: 6,
  },
  infoMiniCardCool: {
    flex: 1,
    borderRadius: 16,
    padding: 14,
    backgroundColor: COLORS.background,
    gap: 6,
  },
  miniCardTitle: {
    color: COLORS.text,
    fontSize: FONT_SIZES.xlarge,
    fontWeight: "700",
  },
  miniCardText: {
    color: COLORS.textSecondary,
    fontSize: FONT_SIZES.large,
  },
  infoNotice: {
    marginTop: 2,
    borderRadius: 16,
    padding: 14,
    backgroundColor: COLORS.background,
    flexDirection: "row",
    gap: 10,
  },
  infoNoticeText: {
    flex: 1,
    color: COLORS.primary,
    fontSize: FONT_SIZES.xxlarge,
    fontWeight: "700",
    lineHeight: 32,
  },
  primaryButtonLarge: {
    minHeight: 72,
    borderRadius: 20,
    backgroundColor: COLORS.primary,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: 10,
    marginTop: 8,
  },
  primaryButtonLargeText: {
    color: COLORS.surface,
    fontSize: 40 / 2,
    fontWeight: "700",
  },
  cancelButton: {
    minHeight: 50,
    alignItems: "center",
    justifyContent: "center",
  },
  cancelButtonText: {
    color: COLORS.textSecondary,
    fontSize: 40 / 2,
    fontWeight: "600",
  },
  spacer: {
    height: 22,
  },
});

export default ImportarPlaneacionScreen;
