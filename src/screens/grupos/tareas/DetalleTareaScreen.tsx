import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { StackNavigationProp } from "@react-navigation/stack";
import { RouteProp } from "@react-navigation/native";
import { RootStackParamList } from "../../../navigation/StackNavigator";
import { COLORS, FONT_SIZES } from "../../../../types";
import WebScrollView from "../../../components/WebScrollView";

type DetalleTareaScreenNavigationProp = StackNavigationProp<
  RootStackParamList,
  "DetalleTarea"
>;

type DetalleTareaScreenRouteProp = RouteProp<
  RootStackParamList,
  "DetalleTarea"
>;

interface DetalleTareaScreenProps {
  navigation: DetalleTareaScreenNavigationProp;
  route: DetalleTareaScreenRouteProp;
}

/**
 * Pantalla de detalle de una tarea con lista de entregas
 */
const DetalleTareaScreen: React.FC<DetalleTareaScreenProps> = ({
  navigation,
  route,
}) => {
  const { tareaId, grupoId } = route.params;

  // Datos de ejemplo
  const tarea = {
    titulo: "Investigación sobre IA",
    tipo: "tarea",
    descripcion:
      "Realizar una investigación detallada sobre Inteligencia Artificial",
    valor: 20,
    fechaAsignacion: "15 Nov 2025",
    fechaEntrega: "30 Nov 2025",
  };

  const entregas = [
    {
      id: 1,
      alumno: "Juan Pérez García",
      estado: "entregada",
      fecha: "28 Nov",
      calificacion: 9.5,
    },
    {
      id: 2,
      alumno: "María López Martínez",
      estado: "entregada",
      fecha: "29 Nov",
      calificacion: 8.0,
    },
    { id: 3, alumno: "Carlos Gómez Ruiz", estado: "pendiente", fecha: null },
    {
      id: 4,
      alumno: "Ana Torres Silva",
      estado: "tarde",
      fecha: "1 Dic",
      calificacion: null,
    },
  ];

  const getEstadoIcon = (estado: string) => {
    switch (estado) {
      case "entregada":
        return { name: "check-circle", color: "#4CAF50" };
      case "pendiente":
        return { name: "schedule", color: "#FFC107" };
      case "tarde":
        return { name: "warning", color: "#F44336" };
      default:
        return { name: "help", color: COLORS.textSecondary };
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar backgroundColor="#EEF3FA" barStyle="dark-content" />

      <SafeAreaView style={styles.safeArea}>
        <WebScrollView style={styles.content}>
          {/* Información de la tarea */}
          <View style={styles.tareaInfoCard}>
            <Text style={styles.tareaTitulo}>{tarea.titulo}</Text>
            <View style={styles.tareaMetadataContainer}>
              <View style={styles.metadataItem}>
                <MaterialIcons
                  name="assignment"
                  size={18}
                  color={COLORS.textSecondary}
                />
                <Text style={styles.metadataText}>Tipo: {tarea.tipo}</Text>
              </View>
              <View style={styles.metadataItem}>
                <MaterialIcons
                  name="stars"
                  size={18}
                  color={COLORS.textSecondary}
                />
                <Text style={styles.metadataText}>
                  Valor: {tarea.valor} pts
                </Text>
              </View>
              <View style={styles.metadataItem}>
                <MaterialIcons
                  name="event"
                  size={18}
                  color={COLORS.textSecondary}
                />
                <Text style={styles.metadataText}>
                  Entrega: {tarea.fechaEntrega}
                </Text>
              </View>
            </View>
            <Text style={styles.descripcion}>{tarea.descripcion}</Text>
          </View>

          {/* Estadísticas */}
          <View style={styles.statsContainer}>
            <View style={styles.statCard}>
              <Text style={styles.statNumber}>15/28</Text>
              <Text style={styles.statLabel}>Entregadas</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statNumber}>54%</Text>
              <Text style={styles.statLabel}>Progreso</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statNumber}>8.75</Text>
              <Text style={styles.statLabel}>Promedio</Text>
            </View>
          </View>

          {/* Lista de entregas */}
          <View style={styles.entregasContainer}>
            <Text style={styles.sectionTitle}>
              Estado de Entregas ({entregas.length} alumnos)
            </Text>

            {entregas.map((entrega) => {
              const icon = getEstadoIcon(entrega.estado);
              return (
                <View key={entrega.id} style={styles.entregaItem}>
                  <MaterialIcons
                    name={icon.name as any}
                    size={28}
                    color={icon.color}
                  />
                  <View style={styles.entregaInfo}>
                    <Text style={styles.alumnoNombre}>{entrega.alumno}</Text>
                    <Text style={styles.entregaStatus}>
                      {entrega.estado === "entregada" &&
                        `Entregado: ${entrega.fecha} • ${entrega.calificacion}/10`}
                      {entrega.estado === "pendiente" && "Pendiente de entrega"}
                      {entrega.estado === "tarde" &&
                        `Entregado tarde: ${entrega.fecha}`}
                    </Text>
                  </View>
                  {entrega.estado !== "pendiente" && (
                    <TouchableOpacity
                      onPress={() => {
                        navigation.navigate("CalificarEntregas", {
                          tareaId,
                          grupoId,
                        });
                      }}
                    >
                      <MaterialIcons
                        name="edit"
                        size={24}
                        color={COLORS.primary}
                      />
                    </TouchableOpacity>
                  )}
                </View>
              );
            })}
          </View>

          {/* Botón calificar */}
          <TouchableOpacity
            style={styles.calificarButton}
            onPress={() => {
              navigation.navigate("CalificarEntregas", { tareaId, grupoId });
            }}
          >
            <MaterialIcons name="rate-review" size={24} color="white" />
            <Text style={styles.calificarButtonText}>
              Calificar Todas las Entregas
            </Text>
          </TouchableOpacity>
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
  tareaInfoCard: {
    width: "100%",
    maxWidth: 980,
    alignSelf: "center",
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E3EAF4",
    borderRadius: 12,
    padding: 16,
    marginBottom: 15,
  },
  tareaTitulo: {
    fontSize: FONT_SIZES.xxlarge,
    fontWeight: "bold",
    color: COLORS.text,
    marginBottom: 15,
  },
  tareaMetadataContainer: {
    marginBottom: 15,
  },
  metadataItem: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  metadataText: {
    fontSize: FONT_SIZES.medium,
    color: COLORS.textSecondary,
    marginLeft: 8,
  },
  descripcion: {
    fontSize: FONT_SIZES.medium,
    color: COLORS.text,
    lineHeight: 22,
  },
  statsContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    width: "100%",
    maxWidth: 980,
    alignSelf: "center",
    padding: 14,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E3EAF4",
    borderRadius: 12,
    marginBottom: 15,
  },
  statCard: {
    alignItems: "center",
  },
  statNumber: {
    fontSize: 28,
    fontWeight: "bold",
    color: COLORS.primary,
    marginBottom: 5,
  },
  statLabel: {
    fontSize: FONT_SIZES.small,
    color: COLORS.textSecondary,
  },
  entregasContainer: {
    width: "100%",
    maxWidth: 980,
    alignSelf: "center",
    paddingHorizontal: 16,
    paddingTop: 2,
    paddingBottom: 110,
  },
  sectionTitle: {
    fontSize: FONT_SIZES.large,
    fontWeight: "bold",
    color: COLORS.text,
    marginBottom: 15,
  },
  entregaItem: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E3EAF4",
    padding: 15,
    borderRadius: 12,
    marginBottom: 10,
    boxShadow: "0px 8px 18px rgba(18, 44, 86, 0.08)",
  },
  entregaInfo: {
    flex: 1,
    marginLeft: 12,
  },
  alumnoNombre: {
    fontSize: FONT_SIZES.medium,
    fontWeight: "600",
    color: COLORS.text,
    marginBottom: 4,
  },
  entregaStatus: {
    fontSize: FONT_SIZES.small,
    color: COLORS.textSecondary,
  },
  calificarButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: COLORS.primary,
    padding: 18,
    borderRadius: 12,
    margin: 20,
    gap: 10,
    boxShadow: "0px 8px 18px rgba(22, 118, 210, 0.32)",
  },
  calificarButtonText: {
    color: "white",
    fontSize: FONT_SIZES.medium,
    fontWeight: "bold",
  },
});

export default DetalleTareaScreen;
