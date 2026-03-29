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
  useWindowDimensions,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { useNavigation } from "@react-navigation/native";
import type { StackNavigationProp } from "@react-navigation/stack";
import { COLORS } from "../../../types";
import type { RootStackParamList } from "../../navigation/StackNavigator";

type Nav = StackNavigationProp<RootStackParamList, "ImportarPlaneacion">;

const ImportarPlaneacionScreen: React.FC = () => {
  const navigation = useNavigation<Nav>();
  const { width } = useWindowDimensions();

  const wideLayout = width >= 980;

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
      <StatusBar backgroundColor="#EEF3FA" barStyle="dark-content" />

      <SafeAreaView style={styles.safeArea}>
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.headerRow}>
            <TouchableOpacity
              style={styles.headerIconButton}
              onPress={() => navigation.goBack()}
              accessibilityLabel="Regresar"
              activeOpacity={0.8}
            >
              <MaterialIcons name="arrow-back" size={24} color="#1676D2" />
            </TouchableOpacity>

            <View style={styles.headerTitleWrap}>
              <Text style={styles.headerTitle}>Importar Planeación</Text>
              <Text style={styles.headerSubtitle}>Importa desde PDF o DOCX</Text>
            </View>

            <TouchableOpacity
              style={styles.headerIconButton}
              onPress={showPendingMessage}
              activeOpacity={0.8}
            >
              <MaterialIcons name="more-vert" size={22} color="#7A8BA3" />
            </TouchableOpacity>
          </View>

          <View style={[styles.mainLayout, wideLayout && styles.mainLayoutWide]}>
            <View style={[styles.leftColumn, wideLayout && styles.leftColumnWide]}>
              <View style={styles.card}>
                <Text style={styles.sectionTitle}>Seleccionar archivo</Text>

                <View style={styles.uploadZone}>
                  <View style={styles.uploadIconCircle}>
                    <MaterialIcons name="upload-file" size={28} color="#1676D2" />
                  </View>
                  <Text style={styles.uploadTitle}>Arrastra o selecciona un archivo</Text>
                  <Text style={styles.uploadSubtitle}>Formatos permitidos: PDF, DOCX</Text>
                </View>

                <TouchableOpacity
                  style={styles.primaryButton}
                  onPress={showPendingMessage}
                  activeOpacity={0.9}
                >
                  <MaterialIcons name="add" size={20} color="#FFFFFF" />
                  <Text style={styles.primaryButtonText}>Seleccionar archivo</Text>
                </TouchableOpacity>

                <View style={styles.formatChipsRow}>
                  <View style={styles.formatChip}>
                    <MaterialIcons name="picture-as-pdf" size={16} color="#1676D2" />
                    <Text style={styles.formatChipText}>PDF</Text>
                  </View>
                  <View style={styles.formatChip}>
                    <MaterialIcons name="description" size={16} color="#1676D2" />
                    <Text style={styles.formatChipText}>DOCX</Text>
                  </View>
                </View>
              </View>

              <View style={styles.errorCard}>
                <MaterialIcons name="warning-amber" size={24} color="#D34553" />
                <Text style={styles.errorText}>
                  El formato .jpg no es compatible. Por favor usa PDF o DOCX.
                </Text>
              </View>

              <View style={styles.card}>
                <View style={styles.stateRow}>
                  <View style={styles.stateIconCircle}>
                    <MaterialIcons name="sync" size={22} color="#1676D2" />
                  </View>
                  <View style={styles.stateTextWrap}>
                    <Text style={styles.stateTitle}>Procesando archivo...</Text>
                    <Text style={styles.stateSubtitle}>Extrayendo contenido...</Text>
                  </View>
                </View>

                <View style={styles.stateRowMuted}>
                  <View style={[styles.stateIconCircle, styles.stateIconCircleMuted]}>
                    <MaterialIcons name="check-circle" size={22} color="#0BA5A5" />
                  </View>
                  <View style={styles.stateTextWrap}>
                    <Text style={styles.stateTitleMuted}>Contenido extraído</Text>
                    <Text style={styles.stateSubtitleMuted}>Correctamente procesado</Text>
                  </View>
                </View>
              </View>
            </View>

            <View style={[styles.rightColumn, wideLayout && styles.rightColumnWide]}>
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
                  <MaterialIcons name="format-list-bulleted" size={18} color="#6B7D96" />
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
                  <MaterialIcons name="info" size={20} color="#1676D2" />
                  <Text style={styles.infoNoticeText}>
                    Puedes ajustar estos datos antes de guardar definitivamente en tu repositorio.
                  </Text>
                </View>
              </View>
            </View>
          </View>

          <View style={[styles.footerActions, wideLayout && styles.footerActionsWide]}>
            <TouchableOpacity
              style={styles.primaryButtonLarge}
              onPress={showPendingMessage}
              activeOpacity={0.9}
            >
              <MaterialIcons name="save-alt" size={22} color="#FFFFFF" />
              <Text style={styles.primaryButtonLargeText}>Importar y continuar</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.cancelButton}
              onPress={() => navigation.goBack()}
              activeOpacity={0.8}
            >
              <Text style={styles.cancelButtonText}>Cancelar</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
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
    width: "100%",
    maxWidth: 1240,
    alignSelf: "center",
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 110,
    gap: 12,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  headerIconButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E3EAF4",
  },
  headerTitleWrap: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 30,
    fontWeight: "800",
    color: "#1E2A3A",
    letterSpacing: -0.4,
  },
  headerSubtitle: {
    marginTop: 2,
    fontSize: 14,
    color: "#5C6E86",
  },
  mainLayout: {
    gap: 12,
  },
  mainLayoutWide: {
    flexDirection: "row",
    alignItems: "flex-start",
  },
  leftColumn: {
    gap: 12,
  },
  leftColumnWide: {
    width: "35%",
  },
  rightColumn: {
    gap: 10,
  },
  rightColumnWide: {
    width: "65%",
  },
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#E3EAF4",
    padding: 14,
    gap: 10,
    boxShadow: "0px 12px 22px rgba(18, 44, 86, 0.08)",
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#1E2A3A",
  },
  uploadZone: {
    borderWidth: 1,
    borderStyle: "dashed",
    borderColor: "#BFD0E4",
    borderRadius: 14,
    minHeight: 175,
    alignItems: "center",
    justifyContent: "center",
    padding: 14,
    gap: 7,
    backgroundColor: "#F8FBFF",
  },
  uploadIconCircle: {
    width: 68,
    height: 68,
    borderRadius: 34,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#DFF1FF",
  },
  uploadTitle: {
    textAlign: "center",
    color: "#1E2A3A",
    fontSize: 16,
    fontWeight: "700",
  },
  uploadSubtitle: {
    textAlign: "center",
    color: "#6B7D96",
    fontSize: 13,
  },
  primaryButton: {
    minHeight: 52,
    borderRadius: 12,
    backgroundColor: "#1676D2",
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: 8,
  },
  primaryButtonText: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "700",
  },
  formatChipsRow: {
    flexDirection: "row",
    gap: 10,
  },
  formatChip: {
    borderRadius: 16,
    paddingVertical: 7,
    paddingHorizontal: 12,
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "#EAF4FF",
  },
  formatChipText: {
    color: "#1E2A3A",
    fontSize: 12,
    fontWeight: "700",
  },
  errorCard: {
    borderWidth: 1,
    borderColor: "#F6C4CB",
    borderRadius: 12,
    padding: 12,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    backgroundColor: "#FFF7F7",
  },
  errorText: {
    flex: 1,
    color: "#B12635",
    fontSize: 13,
    lineHeight: 19,
    fontWeight: "600",
  },
  stateRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  stateRowMuted: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    opacity: 0.72,
  },
  stateIconCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#EAF4FF",
  },
  stateIconCircleMuted: {
    backgroundColor: "#DEF6F5",
  },
  stateTextWrap: {
    flex: 1,
  },
  stateTitle: {
    fontSize: 15,
    color: "#1E2A3A",
    fontWeight: "700",
  },
  stateSubtitle: {
    marginTop: 1,
    fontSize: 13,
    color: "#6B7D96",
  },
  stateTitleMuted: {
    fontSize: 15,
    color: "#4D5D74",
    fontWeight: "700",
  },
  stateSubtitleMuted: {
    marginTop: 1,
    fontSize: 13,
    color: "#6B7D96",
  },
  previewHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  previewHeaderTitle: {
    color: "#1E2A3A",
    fontSize: 24,
    fontWeight: "800",
  },
  badgeDraft: {
    borderRadius: 10,
    backgroundColor: "#DFF1FF",
    paddingVertical: 5,
    paddingHorizontal: 10,
  },
  badgeDraftText: {
    color: "#1676D2",
    fontSize: 11,
    fontWeight: "800",
    letterSpacing: 0.7,
  },
  fieldLabel: {
    color: "#6B7D96",
    fontSize: 12,
    fontWeight: "700",
    letterSpacing: 0.4,
  },
  fieldValueCard: {
    borderRadius: 12,
    backgroundColor: "#F7FAFE",
    minHeight: 50,
    paddingHorizontal: 12,
    justifyContent: "center",
  },
  fieldValueCardAccent: {
    borderRadius: 12,
    backgroundColor: "#F7FAFE",
    minHeight: 50,
    paddingHorizontal: 12,
    justifyContent: "center",
    borderLeftWidth: 4,
    borderLeftColor: "#1676D2",
  },
  fieldValueText: {
    color: "#1E2A3A",
    fontSize: 15,
    fontWeight: "600",
  },
  structureTitleRow: {
    marginTop: 4,
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  structureTitle: {
    color: "#1E2A3A",
    fontSize: 15,
    fontWeight: "700",
  },
  activityCard: {
    borderRadius: 12,
    backgroundColor: "#F7FAFE",
    padding: 10,
    flexDirection: "row",
    gap: 10,
  },
  activityIndexCircle: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: "#1676D2",
    alignItems: "center",
    justifyContent: "center",
  },
  activityIndexText: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "700",
  },
  activityTextWrap: {
    flex: 1,
    gap: 1,
  },
  activityTitle: {
    color: "#1E2A3A",
    fontSize: 14,
    fontWeight: "700",
  },
  activityDesc: {
    color: "#4D5D74",
    fontSize: 12,
    lineHeight: 17,
  },
  dualInfoRow: {
    flexDirection: "row",
    gap: 8,
  },
  infoMiniCardWarm: {
    flex: 1,
    borderRadius: 12,
    padding: 10,
    backgroundColor: "#FFF4E8",
    gap: 4,
  },
  infoMiniCardCool: {
    flex: 1,
    borderRadius: 12,
    padding: 10,
    backgroundColor: "#EAF4FF",
    gap: 4,
  },
  miniCardTitle: {
    color: "#1E2A3A",
    fontSize: 13,
    fontWeight: "700",
  },
  miniCardText: {
    color: "#5C6E86",
    fontSize: 12,
  },
  infoNotice: {
    borderRadius: 12,
    padding: 11,
    backgroundColor: "#EAF4FF",
    flexDirection: "row",
    gap: 8,
  },
  infoNoticeText: {
    flex: 1,
    color: "#1676D2",
    fontSize: 12,
    fontWeight: "700",
    lineHeight: 16,
  },
  footerActions: {
    gap: 10,
  },
  footerActionsWide: {
    flexDirection: "row",
    alignItems: "center",
  },
  primaryButtonLarge: {
    minHeight: 54,
    borderRadius: 14,
    backgroundColor: "#1676D2",
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: 8,
    flex: 1,
  },
  primaryButtonLargeText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "700",
  },
  cancelButton: {
    minHeight: 52,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#D6E0EE",
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 24,
  },
  cancelButtonText: {
    color: "#5C6E86",
    fontSize: 15,
    fontWeight: "700",
  },
});

export default ImportarPlaneacionScreen;
