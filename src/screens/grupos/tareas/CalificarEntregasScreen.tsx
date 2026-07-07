import React from "react";
import { Pressable, StatusBar, StyleSheet, Text, TextInput, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { RouteProp, useRoute } from "@react-navigation/native";
import { COLORS, FONT_SIZES } from "../../../../types";
import WebScrollView from "../../../components/WebScrollView";
import { RootStackParamList } from "../../../navigation/StackNavigator";
import { useCalificarEntregasViewModel } from "../../../hooks/useCalificarEntregasViewModel";

const CalificarEntregasScreen: React.FC = () => {
  const route = useRoute<RouteProp<RootStackParamList, "CalificarEntregas">>();
  const {
    tareaId,
    grupoId,
    tituloTarea,
    calificacionMaxima,
    entregas,
    calificaciones,
    isSaving,
    isSuggestingFeedback,
    updateCalificacion,
    handleSugerirRetroalimentacion,
    handleGuardarCalificaciones,
    handleCancelar,
  } = useCalificarEntregasViewModel(route.params.tareaId, route.params.grupoId);

  return (
    <View style={styles.container}>
      <StatusBar backgroundColor={COLORS.background} barStyle="dark-content" />

      <SafeAreaView style={styles.safeArea}>
        <WebScrollView style={styles.content}>
          <View style={styles.header}>
            <Text style={styles.pageTitle}>Calificar entregas</Text>
            <Text style={styles.pageSubtitle}>
              {tituloTarea} - Tarea ID: {tareaId} - Grupo ID: {grupoId}
            </Text>
          </View>

          <View style={styles.calificacionesContainer}>
            {entregas.length === 0 ? (
              <View style={styles.emptyCard}>
                <MaterialIcons name="groups" size={32} color={COLORS.primary} />
                <Text style={styles.emptyTitle}>No hay alumnos en este grupo</Text>
                <Text style={styles.emptyText}>
                  Agrega o importa alumnos desde Classroom para poder calificar esta actividad.
                </Text>
              </View>
            ) : null}

            {entregas.map((entrega) => (
              <View key={entrega.id} style={styles.entregaCard}>
                <View style={styles.alumnoHeader}>
                  <MaterialIcons name="account-circle" size={40} color={COLORS.primary} />
                  <View style={styles.alumnoInfo}>
                    <Text style={styles.alumnoNombre}>{entrega.nombre}</Text>
                    <Text style={styles.entregaInfo}>
                      Estado: {entrega.estado} {entrega.calificada ? "- calificada" : ""}
                    </Text>
                  </View>
                </View>

                <View style={styles.inputGroup}>
                  <Text style={styles.label}>Calificacion (0-{calificacionMaxima}) *</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="Ej: 9.5"
                    keyboardType="decimal-pad"
                    value={calificaciones[entrega.alumnoId]?.calificacion || ""}
                    onChangeText={(value) =>
                      updateCalificacion(entrega.alumnoId, "calificacion", value)
                    }
                    placeholderTextColor={COLORS.textSecondary}
                  />
                </View>

                <View style={styles.inputGroup}>
                  <Text style={styles.label}>Retroalimentacion</Text>
                  <TextInput
                    style={[styles.input, styles.textArea]}
                    placeholder="Comentarios para el alumno..."
                    multiline
                    numberOfLines={3}
                    value={calificaciones[entrega.alumnoId]?.retroalimentacion || ""}
                    onChangeText={(value) =>
                      updateCalificacion(entrega.alumnoId, "retroalimentacion", value)
                    }
                    placeholderTextColor={COLORS.textSecondary}
                  />
                </View>

                <Pressable
                  style={({ pressed }) => [
                    styles.aiFeedbackButton,
                    isSuggestingFeedback ? styles.buttonDisabled : null,
                    pressed && { opacity: 0.6 },
                  ]}
                  disabled={Boolean(isSuggestingFeedback)}
                  onPress={() => handleSugerirRetroalimentacion(entrega.alumnoId)}
                >
                  <MaterialIcons name="auto-awesome" size={18} color={COLORS.primary} />
                  <Text style={styles.aiFeedbackText}>
                    {isSuggestingFeedback === entrega.alumnoId
                      ? "Sugiriendo..."
                      : "Sugerir retroalimentacion IA"}
                  </Text>
                </Pressable>

                <Pressable
                  style={({ pressed }) => [styles.verArchivoButton, pressed && { opacity: 0.6 }]}
                  disabled={!entrega.archivo}
                >
                  <MaterialIcons name="attachment" size={20} color={COLORS.primaryLight} />
                  <Text style={styles.verArchivoText}>
                    {entrega.archivo ? "Ver archivo entregado" : "Sin archivo entregado"}
                  </Text>
                </Pressable>
              </View>
            ))}
          </View>

          <View style={styles.buttonContainer}>
            <Pressable
              style={({ pressed }) => [
                styles.button,
                styles.buttonSecondary,
                pressed && { opacity: 0.6 },
              ]}
              onPress={handleCancelar}
            >
              <Text style={styles.buttonTextSecondary}>Cancelar</Text>
            </Pressable>

            <Pressable
              style={({ pressed }) => [
                styles.button,
                styles.buttonPrimary,
                isSaving ? styles.buttonDisabled : null,
                pressed && { opacity: 0.6 },
              ]}
              onPress={handleGuardarCalificaciones}
              disabled={isSaving}
            >
              <MaterialIcons name="save" size={20} color="white" />
              <Text style={styles.buttonText}>{isSaving ? "Guardando..." : "Guardar"}</Text>
            </Pressable>
          </View>
        </WebScrollView>
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
  content: {
    flex: 1,
  },
  header: {
    alignSelf: "center",
    backgroundColor: "transparent",
    marginBottom: 15,
    maxWidth: 980,
    paddingBottom: 10,
    paddingHorizontal: 16,
    paddingTop: 14,
    width: "100%",
  },
  pageTitle: {
    color: COLORS.text,
    fontSize: FONT_SIZES.xxlarge,
    fontWeight: "bold",
    marginBottom: 8,
  },
  pageSubtitle: {
    color: COLORS.textSecondary,
    fontSize: FONT_SIZES.medium,
  },
  calificacionesContainer: {
    alignSelf: "center",
    maxWidth: 980,
    paddingBottom: 110,
    paddingHorizontal: 16,
    paddingTop: 0,
    width: "100%",
  },
  emptyCard: {
    alignItems: "center",
    backgroundColor: COLORS.surface,
    borderColor: COLORS.border,
    borderRadius: 14,
    borderWidth: 1,
    gap: 8,
    marginBottom: 15,
    padding: 20,
  },
  emptyTitle: {
    color: COLORS.text,
    fontSize: FONT_SIZES.large,
    fontWeight: "700",
  },
  emptyText: {
    color: COLORS.textSecondary,
    fontSize: FONT_SIZES.medium,
    textAlign: "center",
  },
  entregaCard: {
    backgroundColor: COLORS.surface,
    borderColor: COLORS.border,
    borderRadius: 12,
    borderWidth: 1,
    boxShadow: "0px 8px 18px rgba(18, 44, 86, 0.08)",
    marginBottom: 15,
    padding: 20,
  },
  alumnoHeader: {
    alignItems: "center",
    flexDirection: "row",
    marginBottom: 15,
  },
  alumnoInfo: {
    flex: 1,
    marginLeft: 12,
  },
  alumnoNombre: {
    color: COLORS.text,
    fontSize: FONT_SIZES.large,
    fontWeight: "600",
    marginBottom: 4,
  },
  entregaInfo: {
    color: COLORS.textSecondary,
    fontSize: FONT_SIZES.small,
    textTransform: "capitalize",
  },
  inputGroup: {
    marginBottom: 15,
  },
  label: {
    color: COLORS.text,
    fontSize: FONT_SIZES.medium,
    fontWeight: "600",
    marginBottom: 8,
  },
  input: {
    backgroundColor: COLORS.backgroundSoft,
    borderColor: COLORS.borderLight,
    borderRadius: 8,
    borderWidth: 1,
    color: COLORS.text,
    fontSize: FONT_SIZES.medium,
    padding: 12,
  },
  textArea: {
    minHeight: 80,
    textAlignVertical: "top",
  },
  aiFeedbackButton: {
    alignItems: "center",
    backgroundColor: "#EAF2FF",
    borderColor: "#CFE0F7",
    borderRadius: 12,
    borderWidth: 1,
    flexDirection: "row",
    gap: 8,
    marginBottom: 6,
    paddingHorizontal: 12,
    paddingVertical: 11,
  },
  aiFeedbackText: {
    color: COLORS.primary,
    fontSize: FONT_SIZES.small,
    fontWeight: "700",
  },
  verArchivoButton: {
    alignItems: "center",
    flexDirection: "row",
    gap: 8,
    paddingVertical: 10,
  },
  verArchivoText: {
    color: COLORS.primaryLight,
    fontSize: FONT_SIZES.medium,
    fontWeight: "500",
  },
  buttonContainer: {
    alignSelf: "center",
    flexDirection: "row",
    gap: 10,
    maxWidth: 980,
    paddingBottom: 20,
    paddingHorizontal: 16,
    paddingTop: 6,
    width: "100%",
  },
  button: {
    alignItems: "center",
    borderRadius: 10,
    flex: 1,
    flexDirection: "row",
    gap: 8,
    justifyContent: "center",
    paddingVertical: 15,
  },
  buttonPrimary: {
    backgroundColor: COLORS.primary,
  },
  buttonSecondary: {
    backgroundColor: COLORS.surface,
    borderColor: COLORS.primary,
    borderWidth: 1,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    color: "white",
    fontSize: FONT_SIZES.medium,
    fontWeight: "bold",
  },
  buttonTextSecondary: {
    color: COLORS.primary,
    fontSize: FONT_SIZES.medium,
    fontWeight: "bold",
  },
});

export default CalificarEntregasScreen;
