import React from "react";
import { Pressable, View, Text, StyleSheet, StatusBar, Alert } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { StackNavigationProp } from "@react-navigation/stack";
import { RouteProp } from "@react-navigation/native";
import { AppRoutesParamList } from "../../../navigation/StackNavigator";
import { COLORS, FONT_SIZES } from "../../../../types";
import WebScrollView from "../../../components/WebScrollView";
import { useEntregables } from "../../../context/EntregablesContext";
import { useGruposContext } from "../../../context/GruposContext";

type DetalleTareaScreenNavigationProp = StackNavigationProp<AppRoutesParamList, "DetalleTarea">;

type DetalleTareaScreenRouteProp = RouteProp<AppRoutesParamList, "DetalleTarea">;

interface DetalleTareaScreenProps {
  navigation: DetalleTareaScreenNavigationProp;
  route: DetalleTareaScreenRouteProp;
}

const TIPO_ICONS: Record<string, { name: string; color: string; bg: string }> = {
  tarea: { name: "description", color: COLORS.primary, bg: `${COLORS.primary}15` },
  examen: { name: "quiz", color: "#E67E22", bg: "#FFF3E0" },
  proyecto: { name: "architecture", color: "#E67E22", bg: "#FFF3E0" },
  investigacion: { name: "manage-search", color: COLORS.textSecondary, bg: "#F0F0F0" },
};

const ESTADO_COLORS: Record<string, { dot: string; text: string; label: string }> = {
  asignada: { dot: COLORS.success, text: COLORS.success, label: "ACTIVA" },
  en_progreso: { dot: "#E67E22", text: "#E67E22", label: "EN PROGRESO" },
  finalizada: { dot: COLORS.textSecondary, text: COLORS.textSecondary, label: "FINALIZADA" },
};

const TIPO_LABELS: Record<string, string> = {
  tarea: "Tarea",
  examen: "Examen",
  proyecto: "Proyecto",
  investigacion: "Investigación",
};

const DetalleTareaScreen: React.FC<DetalleTareaScreenProps> = ({ navigation, route }) => {
  const { tareaId, grupoId } = route.params;
  const { obtenerEntregablePorId, eliminarEntregable } = useEntregables();
  const { grupos } = useGruposContext();

  const entregable = obtenerEntregablePorId(tareaId);
  const grupo = grupos.find((g) => g.id === grupoId);

  const formatDate = (date: Date | string) => {
    const d = new Date(date);
    return d.toLocaleDateString("es-MX", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  const handleEditar = () => {
    navigation.navigate("CrearTareaGrupo", {
      grupoId,
      entregableId: tareaId,
    });
  };

  const handleEliminar = () => {
    Alert.alert("Eliminar entregable", "¿Estás seguro de que deseas eliminar este entregable?", [
      { text: "Cancelar", style: "cancel" },
      {
        text: "Eliminar",
        style: "destructive",
        onPress: async () => {
          await eliminarEntregable(tareaId);
          navigation.goBack();
        },
      },
    ]);
  };

  if (!entregable) {
    return (
      <View style={styles.container}>
        <StatusBar backgroundColor={COLORS.primary} barStyle="light-content" />
        <SafeAreaView style={styles.safeArea}>
          <View style={styles.header}>
            <Pressable
              style={({ pressed }) => pressed && { opacity: 0.6 }}
              onPress={() => navigation.goBack()}
            >
              <MaterialIcons name="arrow-back" size={24} color="white" />
            </Pressable>
            <Text style={styles.headerTitle}>Detalle</Text>
            <View style={{ width: 24 }} />
          </View>
          <View style={styles.notFoundContainer}>
            <MaterialIcons name="error-outline" size={48} color={COLORS.textSecondary} />
            <Text style={styles.notFoundText}>Entregable no encontrado</Text>
          </View>
        </SafeAreaView>
      </View>
    );
  }

  const icon = TIPO_ICONS[entregable.tipo] ?? TIPO_ICONS.tarea;
  const estado = ESTADO_COLORS[entregable.estado] ?? ESTADO_COLORS.asignada;

  return (
    <View style={styles.container}>
      <StatusBar backgroundColor={COLORS.primary} barStyle="light-content" />

      <SafeAreaView style={styles.safeArea}>
        {/* Header */}
        <View style={styles.header}>
          <Pressable
            style={({ pressed }) => pressed && { opacity: 0.6 }}
            onPress={() => navigation.goBack()}
          >
            <MaterialIcons name="arrow-back" size={24} color="white" />
          </Pressable>
          <Text style={styles.headerTitle}>Detalle de Entregable</Text>
          <Pressable style={({ pressed }) => pressed && { opacity: 0.6 }} onPress={handleEditar}>
            <MaterialIcons name="edit" size={24} color="white" />
          </Pressable>
        </View>

        <WebScrollView style={styles.content}>
          {/* Type + Status badge */}
          <View style={styles.badgeRow}>
            <View style={[styles.tipoBadge, { backgroundColor: icon.bg }]}>
              <MaterialIcons name={icon.name as any} size={16} color={icon.color} />
              <Text style={[styles.tipoBadgeText, { color: icon.color }]}>
                {TIPO_LABELS[entregable.tipo] ?? entregable.tipo}
              </Text>
            </View>
            <View style={styles.estadoBadge}>
              <View style={[styles.estadoDot, { backgroundColor: estado.dot }]} />
              <Text style={[styles.estadoBadgeText, { color: estado.text }]}>{estado.label}</Text>
            </View>
          </View>

          {/* Title */}
          <Text style={styles.tareaTitulo}>{entregable.titulo}</Text>

          {/* Grupo card */}
          {grupo && (
            <View style={styles.grupoCard}>
              <MaterialIcons name="groups" size={20} color={COLORS.primary} />
              <View style={styles.grupoCardInfo}>
                <Text style={styles.grupoCardName}>{grupo.nombre}</Text>
                <Text style={styles.grupoCardMeta}>{grupo.materia}</Text>
              </View>
            </View>
          )}

          {/* Info card */}
          <View style={styles.infoCard}>
            <View style={styles.infoRow}>
              <MaterialIcons name="stars" size={20} color={COLORS.textSecondary} />
              <Text style={styles.infoLabel}>Valor</Text>
              <Text style={styles.infoValue}>{entregable.valor} puntos</Text>
            </View>
            <View style={styles.divider} />
            <View style={styles.infoRow}>
              <MaterialIcons name="event" size={20} color={COLORS.textSecondary} />
              <Text style={styles.infoLabel}>Fecha de asignación</Text>
              <Text style={styles.infoValue}>{formatDate(entregable.fechaAsignacion)}</Text>
            </View>
            <View style={styles.divider} />
            <View style={styles.infoRow}>
              <MaterialIcons name="event-available" size={20} color={COLORS.textSecondary} />
              <Text style={styles.infoLabel}>Fecha de entrega</Text>
              <Text style={styles.infoValue}>{formatDate(entregable.fechaEntrega)}</Text>
            </View>
            {entregable.permitirEntregaTardia && entregable.fechaLimiteEntregaTardia && (
              <>
                <View style={styles.divider} />
                <View style={styles.infoRow}>
                  <MaterialIcons name="schedule" size={20} color="#E67E22" />
                  <Text style={styles.infoLabel}>Entrega tardía hasta</Text>
                  <Text style={[styles.infoValue, { color: "#E67E22" }]}>
                    {formatDate(entregable.fechaLimiteEntregaTardia)}
                  </Text>
                </View>
              </>
            )}
            {entregable.calificacionMaxima != null && (
              <>
                <View style={styles.divider} />
                <View style={styles.infoRow}>
                  <MaterialIcons name="grade" size={20} color={COLORS.textSecondary} />
                  <Text style={styles.infoLabel}>Calificación máxima</Text>
                  <Text style={styles.infoValue}>{entregable.calificacionMaxima}</Text>
                </View>
              </>
            )}
          </View>

          {/* Description */}
          {entregable.descripcion ? (
            <View style={styles.sectionCard}>
              <Text style={styles.sectionTitle}>Descripción</Text>
              <Text style={styles.descripcion}>{entregable.descripcion}</Text>
            </View>
          ) : null}

          {/* Instructions */}
          {entregable.instrucciones ? (
            <View style={styles.sectionCard}>
              <Text style={styles.sectionTitle}>Instrucciones</Text>
              <Text style={styles.descripcion}>{entregable.instrucciones}</Text>
            </View>
          ) : null}

          {/* Notas adicionales */}
          {entregable.recursosNecesarios &&
          entregable.recursosNecesarios.length > 0 &&
          entregable.recursosNecesarios[0] ? (
            <View style={styles.sectionCard}>
              <View style={styles.sectionTitleRow}>
                <MaterialIcons name="sticky-note-2" size={18} color={COLORS.primary} />
                <Text style={styles.sectionTitle}>Notas</Text>
              </View>
              <Text style={styles.descripcion}>{entregable.recursosNecesarios[0]}</Text>
            </View>
          ) : null}

          {/* Action buttons */}
          <View style={styles.actionsRow}>
            <Pressable
              style={({ pressed }) => [styles.editButton, pressed && { opacity: 0.6 }]}
              onPress={handleEditar}
            >
              <MaterialIcons name="edit" size={20} color="white" />
              <Text style={styles.editButtonText}>Editar</Text>
            </Pressable>

            <Pressable
              style={({ pressed }) => [styles.calificarButton, pressed && { opacity: 0.6 }]}
              onPress={() => navigation.navigate("CalificarEntregas", { tareaId, grupoId })}
            >
              <MaterialIcons name="rate-review" size={20} color="white" />
              <Text style={styles.calificarButtonText}>Calificar</Text>
            </Pressable>
          </View>

          <Pressable
            style={({ pressed }) => [styles.deleteButton, pressed && { opacity: 0.6 }]}
            onPress={handleEliminar}
          >
            <MaterialIcons name="delete-outline" size={20} color="#D32F2F" />
            <Text style={styles.deleteButtonText}>Eliminar entregable</Text>
          </Pressable>
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
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: COLORS.primary,
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  headerTitle: {
    fontSize: FONT_SIZES.large,
    fontWeight: "bold",
    color: "white",
  },
  content: {
    flex: 1,
    paddingHorizontal: 16,
    paddingBottom: 100,
  },
  notFoundContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    gap: 12,
  },
  notFoundText: {
    fontSize: FONT_SIZES.medium,
    color: COLORS.textSecondary,
  },
  badgeRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginTop: 20,
    marginBottom: 12,
  },
  tipoBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  tipoBadgeText: {
    fontSize: FONT_SIZES.small,
    fontWeight: "600",
  },
  estadoBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  estadoDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  estadoBadgeText: {
    fontSize: FONT_SIZES.small,
    fontWeight: "bold",
  },
  tareaTitulo: {
    fontSize: FONT_SIZES.xxlarge,
    fontWeight: "bold",
    color: COLORS.text,
    marginBottom: 16,
  },
  grupoCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.borderLight,
    borderRadius: 12,
    padding: 14,
    gap: 12,
    marginBottom: 16,
  },
  grupoCardInfo: {
    flex: 1,
  },
  grupoCardName: {
    fontSize: FONT_SIZES.medium,
    fontWeight: "600",
    color: COLORS.text,
  },
  grupoCardMeta: {
    fontSize: FONT_SIZES.small,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  infoCard: {
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.borderLight,
    borderRadius: 14,
    padding: 16,
    marginBottom: 16,
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingVertical: 4,
  },
  infoLabel: {
    flex: 1,
    fontSize: FONT_SIZES.medium,
    color: COLORS.textSecondary,
  },
  infoValue: {
    fontSize: FONT_SIZES.medium,
    fontWeight: "600",
    color: COLORS.text,
  },
  divider: {
    height: 1,
    backgroundColor: COLORS.borderLight,
    marginVertical: 10,
  },
  sectionCard: {
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.borderLight,
    borderRadius: 14,
    padding: 16,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: FONT_SIZES.medium,
    fontWeight: "bold",
    color: COLORS.text,
    marginBottom: 8,
  },
  sectionTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 8,
  },
  descripcion: {
    fontSize: FONT_SIZES.medium,
    color: COLORS.text,
    lineHeight: 22,
  },
  actionsRow: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 12,
  },
  editButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: COLORS.primary,
    paddingVertical: 14,
    borderRadius: 12,
    gap: 8,
  },
  editButtonText: {
    color: "white",
    fontSize: FONT_SIZES.medium,
    fontWeight: "bold",
  },
  calificarButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: COLORS.success,
    paddingVertical: 14,
    borderRadius: 12,
    gap: 8,
  },
  calificarButtonText: {
    color: "white",
    fontSize: FONT_SIZES.medium,
    fontWeight: "bold",
  },
  deleteButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 14,
    gap: 8,
    marginBottom: 40,
  },
  deleteButtonText: {
    color: "#D32F2F",
    fontSize: FONT_SIZES.medium,
    fontWeight: "600",
  },
});

export default DetalleTareaScreen;
