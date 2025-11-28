import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  StatusBar,
  SafeAreaView,
} from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { StackNavigationProp } from "@react-navigation/stack";
import { RouteProp } from "@react-navigation/native";
import { RootStackParamList } from "../../../navigation/StackNavigator";
import { COLORS, FONT_SIZES } from "../../../../types";
import BottomNavBar from "../../../components/BottomNavBar";
import WebScrollView from "../../../components/WebScrollView";

type CalificarEntregasScreenNavigationProp = StackNavigationProp<
  RootStackParamList,
  "CalificarEntregas"
>;

type CalificarEntregasScreenRouteProp = RouteProp<
  RootStackParamList,
  "CalificarEntregas"
>;

interface CalificarEntregasScreenProps {
  navigation: CalificarEntregasScreenNavigationProp;
  route: CalificarEntregasScreenRouteProp;
}

interface Calificacion {
  alumnoId: number;
  calificacion: string;
  retroalimentacion: string;
}

/**
 * Pantalla para calificar las entregas de una tarea
 */
const CalificarEntregasScreen: React.FC<CalificarEntregasScreenProps> = ({
  navigation,
  route,
}) => {
  const { tareaId, grupoId } = route.params;

  // Entregas a calificar
  const entregas = [
    { id: 1, alumnoId: 1, nombre: "Juan Pérez García" },
    { id: 2, alumnoId: 2, nombre: "María López Martínez" },
    { id: 3, alumnoId: 4, nombre: "Ana Torres Silva" },
  ];

  const [calificaciones, setCalificaciones] = useState<
    Record<number, Calificacion>
  >({});

  const updateCalificacion = (
    alumnoId: number,
    field: keyof Calificacion,
    value: string
  ) => {
    setCalificaciones((prev) => ({
      ...prev,
      [alumnoId]: {
        ...(prev[alumnoId] || {
          alumnoId,
          calificacion: "",
          retroalimentacion: "",
        }),
        [field]: value,
      },
    }));
  };

  const handleGuardarCalificaciones = () => {
    // TODO: Implementar lógica de guardado
    console.log("Guardando calificaciones:", calificaciones);
    navigation.goBack();
  };

  return (
    <View style={styles.container}>
      <StatusBar backgroundColor={COLORS.primary} barStyle="light-content" />

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
                        value
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
                        value
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
              onPress={() => navigation.goBack()}
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

      <BottomNavBar currentScreen="Calificar Entregas" />
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
    padding: 20,
    backgroundColor: COLORS.surface,
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
    padding: 20,
    paddingTop: 0,
  },
  entregaCard: {
    backgroundColor: COLORS.surface,
    padding: 20,
    borderRadius: 10,
    marginBottom: 15,
    elevation: 2,
    shadowColor: COLORS.text,
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 1 },
    shadowRadius: 3,
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
    backgroundColor: "#f5f5f5",
    borderWidth: 1,
    borderColor: "#e0e0e0",
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
    padding: 20,
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
    backgroundColor: COLORS.surface,
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
