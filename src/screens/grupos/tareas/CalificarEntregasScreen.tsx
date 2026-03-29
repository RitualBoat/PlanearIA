import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  StatusBar,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { COLORS, FONT_SIZES } from "../../../../types";
import WebScrollView from "../../../components/WebScrollView";
import { useCalificarEntregasViewModel } from "../../../hooks/useCalificarEntregasViewModel";

/**
 * Pantalla para calificar las entregas de una tarea (View)
 * Solo JSX y StyleSheet - la logica vive en useCalificarEntregasViewModel
 */
const CalificarEntregasScreen: React.FC = () => {
  const {
    tareaId,
    grupoId,
    entregas,
    calificaciones,
    updateCalificacion,
    handleGuardarCalificaciones,
    handleCancelar,
  } = useCalificarEntregasViewModel();

  return (
    <View style={styles.container}>
      <StatusBar backgroundColor="#EEF3FA" barStyle="dark-content" />

      <SafeAreaView style={styles.safeArea}>
        <WebScrollView style={styles.content}>
          <View style={styles.header}>
            <Text style={styles.pageTitle}>Calificar Entregas</Text>
            <Text style={styles.pageSubtitle}>
              Tarea ID: {tareaId} • Grupo ID: {grupoId}
            </Text>
          </View>

          <View style={styles.calificacionesContainer}>
            {entregas.map((entrega) => (
              <View key={entrega.id} style={styles.entregaCard}>
                <View style={styles.alumnoHeader}>
                  <MaterialIcons
                    name="account-circle"
                    size={40}
                    color={COLORS.primary}
                  />
                  <View style={styles.alumnoInfo}>
                    <Text style={styles.alumnoNombre}>{entrega.nombre}</Text>
                    <Text style={styles.entregaInfo}>Entrega revisable</Text>
                  </View>
                </View>

                {/* Calificación */}
                <View style={styles.inputGroup}>
                  <Text style={styles.label}>Calificación (0-10) *</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="Ej: 9.5"
                    keyboardType="decimal-pad"
                    value={calificaciones[entrega.alumnoId]?.calificacion || ""}
                    onChangeText={(value) =>
                      updateCalificacion(
                        entrega.alumnoId,
                        "calificacion",
                        value,
                      )
                    }
                    placeholderTextColor={COLORS.textSecondary}
                  />
                </View>

                {/* Retroalimentación */}
                <View style={styles.inputGroup}>
                  <Text style={styles.label}>Retroalimentación</Text>
                  <TextInput
                    style={[styles.input, styles.textArea]}
                    placeholder="Comentarios para el alumno..."
                    multiline
                    numberOfLines={3}
                    value={
                      calificaciones[entrega.alumnoId]?.retroalimentacion || ""
                    }
                    onChangeText={(value) =>
                      updateCalificacion(
                        entrega.alumnoId,
                        "retroalimentacion",
                        value,
                      )
                    }
                    placeholderTextColor={COLORS.textSecondary}
                  />
                </View>

                {/* Ver archivo */}
                <TouchableOpacity style={styles.verArchivoButton}>
                  <MaterialIcons name="attachment" size={20} color="#2196F3" />
                  <Text style={styles.verArchivoText}>
                    Ver archivo entregado
                  </Text>
                </TouchableOpacity>
              </View>
            ))}
          </View>

          {/* Botones de acción */}
          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={[styles.button, styles.buttonSecondary]}
              onPress={handleCancelar}
            >
              <Text style={styles.buttonTextSecondary}>Cancelar</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.button, styles.buttonPrimary]}
              onPress={handleGuardarCalificaciones}
            >
              <MaterialIcons name="save" size={20} color="white" />
              <Text style={styles.buttonText}>Guardar</Text>
            </TouchableOpacity>
          </View>
        </WebScrollView>
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
  content: {
    flex: 1,
  },
  header: {
    width: "100%",
    maxWidth: 980,
    alignSelf: "center",
    paddingHorizontal: 16,
    paddingTop: 14,
    paddingBottom: 10,
    backgroundColor: "transparent",
    marginBottom: 15,
  },
  pageTitle: {
    fontSize: FONT_SIZES.xxlarge,
    fontWeight: "bold",
    color: COLORS.text,
    marginBottom: 8,
  },
  pageSubtitle: {
    fontSize: FONT_SIZES.medium,
    color: COLORS.textSecondary,
  },
  calificacionesContainer: {
    width: "100%",
    maxWidth: 980,
    alignSelf: "center",
    paddingHorizontal: 16,
    paddingTop: 0,
    paddingBottom: 110,
  },
  entregaCard: {
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E3EAF4",
    padding: 20,
    borderRadius: 12,
    marginBottom: 15,
    boxShadow: "0px 8px 18px rgba(18, 44, 86, 0.08)",
  },
  alumnoHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 15,
  },
  alumnoInfo: {
    flex: 1,
    marginLeft: 12,
  },
  alumnoNombre: {
    fontSize: FONT_SIZES.large,
    fontWeight: "600",
    color: COLORS.text,
    marginBottom: 4,
  },
  entregaInfo: {
    fontSize: FONT_SIZES.small,
    color: COLORS.textSecondary,
  },
  inputGroup: {
    marginBottom: 15,
  },
  label: {
    fontSize: FONT_SIZES.medium,
    fontWeight: "600",
    color: COLORS.text,
    marginBottom: 8,
  },
  input: {
    backgroundColor: "#F8FBFF",
    borderWidth: 1,
    borderColor: "#DCE6F3",
    borderRadius: 8,
    padding: 12,
    fontSize: FONT_SIZES.medium,
    color: COLORS.text,
  },
  textArea: {
    minHeight: 80,
    textAlignVertical: "top",
  },
  verArchivoButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 10,
    gap: 8,
  },
  verArchivoText: {
    fontSize: FONT_SIZES.medium,
    color: "#2196F3",
    fontWeight: "500",
  },
  buttonContainer: {
    flexDirection: "row",
    gap: 10,
    width: "100%",
    maxWidth: 980,
    alignSelf: "center",
    paddingHorizontal: 16,
    paddingTop: 6,
    paddingBottom: 20,
  },
  button: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 15,
    borderRadius: 10,
    gap: 8,
  },
  buttonPrimary: {
    backgroundColor: COLORS.primary,
  },
  buttonSecondary: {
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: COLORS.primary,
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
