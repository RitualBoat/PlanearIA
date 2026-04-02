import React, { useMemo } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
  ScrollView,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { useNavigation, useRoute, RouteProp } from "@react-navigation/native";
import { StackNavigationProp } from "@react-navigation/stack";
import { RootStackParamList } from "../../navigation/StackNavigator";
import { COLORS, FONT_SIZES } from "../../../types";
import { usePlantillas } from "../../context/PlantillasContext";
import { isWeb } from "../../utils/responsive";

const TIPO_META: Record<string, { label: string; icon: string; color: string }> = {
  examen: { label: "Examen", icon: "quiz", color: COLORS.warning },
  presentacion: { label: "Presentación", icon: "play-circle-filled", color: COLORS.primary },
  mapa_mental: { label: "Mapa Mental", icon: "dashboard-customize", color: COLORS.purple },
  linea_tiempo: { label: "Línea de Tiempo", icon: "timeline", color: "#FF5722" },
  postal: { label: "Postal", icon: "mail", color: COLORS.teal },
  reporte: { label: "Reporte", icon: "assessment", color: COLORS.success },
  otro: { label: "Otro", icon: "description", color: "#757575" },
};

const DetallePlantillaScreen: React.FC = () => {
  const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();
  const route = useRoute<RouteProp<RootStackParamList, "DetallePlantilla">>();
  const { obtenerPlantillaPorId, eliminarPlantilla } = usePlantillas();

  const plantilla = obtenerPlantillaPorId(route.params.plantillaId);
  const meta = TIPO_META[plantilla?.tipo ?? "otro"] ?? TIPO_META.otro;

  const contenidoParsed = useMemo(() => {
    if (!plantilla?.contenido) return null;
    try {
      return JSON.parse(plantilla.contenido) as Record<string, unknown>;
    } catch {
      return null;
    }
  }, [plantilla]);

  const handleEditar = () => {
    if (!plantilla) return;
    navigation.navigate("EditorPlantilla", { plantillaId: plantilla.id as number });
  };

  const handleEliminar = () => {
    if (!plantilla) return;
    Alert.alert("Eliminar plantilla", `¿Estás seguro de eliminar "${plantilla.nombre}"?`, [
      { text: "Cancelar", style: "cancel" },
      {
        text: "Eliminar",
        style: "destructive",
        onPress: async () => {
          await eliminarPlantilla(plantilla.id as number);
          navigation.goBack();
        },
      },
    ]);
  };

  if (!plantilla) {
    return (
      <View style={styles.container}>
        <StatusBar backgroundColor={COLORS.surface} barStyle="dark-content" />
        <SafeAreaView style={styles.safeArea}>
          <View style={styles.header}>
            <TouchableOpacity onPress={() => navigation.goBack()}>
              <MaterialIcons name="arrow-back" size={24} color={COLORS.text} />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Detalle</Text>
            <View style={{ width: 24 }} />
          </View>
          <View style={styles.center}>
            <MaterialIcons name="error-outline" size={64} color={COLORS.borderLight} />
            <Text style={styles.notFoundText}>Plantilla no encontrada</Text>
          </View>
        </SafeAreaView>
      </View>
    );
  }

  const fechaCreacion = new Date(plantilla.fechaCreacion).toLocaleDateString("es-MX", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  return (
    <View style={styles.container}>
      <StatusBar backgroundColor={COLORS.surface} barStyle="dark-content" />
      <SafeAreaView style={styles.safeArea}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} activeOpacity={0.7}>
            <MaterialIcons name="arrow-back" size={24} color={COLORS.text} />
          </TouchableOpacity>
          <Text style={styles.headerTitle} numberOfLines={1}>
            {plantilla.nombre}
          </Text>
          <TouchableOpacity onPress={handleEditar} activeOpacity={0.7}>
            <MaterialIcons name="edit" size={22} color={COLORS.primary} />
          </TouchableOpacity>
        </View>

        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Hero */}
          <View style={[styles.heroCard, { borderLeftColor: meta.color }]}>
            <View style={[styles.heroIcon, { backgroundColor: `${meta.color}18` }]}>
              <MaterialIcons name={meta.icon as any} size={36} color={meta.color} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.heroTitle}>{plantilla.nombre}</Text>
              <View style={styles.badgesRow}>
                <View style={[styles.badge, { backgroundColor: `${meta.color}18` }]}>
                  <Text style={[styles.badgeText, { color: meta.color }]}>
                    {meta.label.toUpperCase()}
                  </Text>
                </View>
                <View
                  style={[
                    styles.badge,
                    {
                      backgroundColor: plantilla.esDelSistema ? "#F0F0F0" : `${COLORS.purple}14`,
                    },
                  ]}
                >
                  <Text
                    style={[
                      styles.badgeText,
                      { color: plantilla.esDelSistema ? COLORS.textSecondary : COLORS.purple },
                    ]}
                  >
                    {plantilla.esDelSistema ? "DEL SISTEMA" : "PERSONALIZADA"}
                  </Text>
                </View>
              </View>
            </View>
          </View>

          {/* Description */}
          {!!plantilla.descripcion && (
            <View style={styles.card}>
              <Text style={styles.cardLabel}>DESCRIPCIÓN</Text>
              <Text style={styles.cardBody}>{plantilla.descripcion}</Text>
            </View>
          )}

          {/* Meta info */}
          <View style={styles.card}>
            <Text style={styles.cardLabel}>INFORMACIÓN</Text>
            <View style={styles.infoRow}>
              <MaterialIcons name="schedule" size={16} color={COLORS.textTertiary} />
              <Text style={styles.infoText}>Usado {plantilla.usosCount} veces</Text>
            </View>
            <View style={styles.infoRow}>
              <MaterialIcons name="event" size={16} color={COLORS.textTertiary} />
              <Text style={styles.infoText}>Creada el {fechaCreacion}</Text>
            </View>
          </View>

          {/* Tags */}
          {plantilla.tags.filter((t) => t !== "__borrador__").length > 0 && (
            <View style={styles.card}>
              <Text style={styles.cardLabel}>ETIQUETAS</Text>
              <View style={styles.tagsContainer}>
                {plantilla.tags
                  .filter((t) => t !== "__borrador__")
                  .map((tag) => (
                    <View key={tag} style={styles.tagChip}>
                      <Text style={styles.tagChipText}>{tag}</Text>
                    </View>
                  ))}
              </View>
            </View>
          )}

          {/* Content preview */}
          {contenidoParsed && (
            <View style={styles.card}>
              <Text style={styles.cardLabel}>CONTENIDO</Text>
              {contenidoParsed.instrucciones && (
                <>
                  <Text style={styles.subLabel}>Instrucciones</Text>
                  <Text style={styles.cardBody}>{String(contenidoParsed.instrucciones)}</Text>
                </>
              )}
              {Array.isArray(contenidoParsed.secciones) && contenidoParsed.secciones.length > 0 && (
                <>
                  <Text style={styles.subLabel}>Secciones</Text>
                  {(contenidoParsed.secciones as string[]).map((s, i) => (
                    <View key={i} style={styles.seccionItem}>
                      <Text style={styles.seccionBullet}>{i + 1}.</Text>
                      <Text style={styles.cardBody}>{s}</Text>
                    </View>
                  ))}
                </>
              )}
              {contenidoParsed.duracion && (
                <View style={styles.infoRow}>
                  <MaterialIcons name="timer" size={16} color={COLORS.textTertiary} />
                  <Text style={styles.infoText}>Duración: {String(contenidoParsed.duracion)}</Text>
                </View>
              )}
              {contenidoParsed.puntosTotales && (
                <View style={styles.infoRow}>
                  <MaterialIcons name="grade" size={16} color={COLORS.textTertiary} />
                  <Text style={styles.infoText}>
                    Puntos: {String(contenidoParsed.puntosTotales)}
                  </Text>
                </View>
              )}
            </View>
          )}

          {/* Actions */}
          <View style={styles.actionsRow}>
            <TouchableOpacity style={styles.btnPrimary} onPress={handleEditar} activeOpacity={0.8}>
              <MaterialIcons name="edit" size={18} color="#FFFFFF" />
              <Text style={styles.btnPrimaryText}>Editar plantilla</Text>
            </TouchableOpacity>
          </View>

          {!plantilla.esDelSistema && (
            <TouchableOpacity style={styles.btnDanger} onPress={handleEliminar} activeOpacity={0.8}>
              <MaterialIcons name="delete-outline" size={18} color={COLORS.error} />
              <Text style={styles.btnDangerText}>Eliminar plantilla</Text>
            </TouchableOpacity>
          )}
        </ScrollView>
      </SafeAreaView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  safeArea: { flex: 1 },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 14,
    backgroundColor: COLORS.surface,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.borderLight,
  },
  headerTitle: {
    flex: 1,
    fontSize: FONT_SIZES.large,
    fontWeight: "bold",
    color: COLORS.text,
    marginHorizontal: 12,
  },
  scrollContent: { paddingHorizontal: 16, paddingBottom: isWeb() ? 28 : 110, paddingTop: 12 },
  center: { flex: 1, justifyContent: "center", alignItems: "center", paddingHorizontal: 40 },
  notFoundText: {
    fontSize: FONT_SIZES.medium,
    color: COLORS.textSecondary,
    marginTop: 12,
    textAlign: "center",
  },
  // Hero
  heroCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.surface,
    borderRadius: 16,
    padding: 18,
    marginBottom: 12,
    borderLeftWidth: 4,
  },
  heroIcon: {
    width: 56,
    height: 56,
    borderRadius: 14,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 14,
  },
  heroTitle: { fontSize: 18, fontWeight: "bold", color: COLORS.text, marginBottom: 6 },
  badgesRow: { flexDirection: "row", gap: 6 },
  badge: { borderRadius: 6, paddingHorizontal: 8, paddingVertical: 2 },
  badgeText: { fontSize: 10, fontWeight: "700" },
  // Cards
  card: {
    backgroundColor: COLORS.surface,
    borderRadius: 14,
    padding: 18,
    marginBottom: 12,
  },
  cardLabel: {
    fontSize: 12,
    fontWeight: "700",
    color: COLORS.textTertiary,
    letterSpacing: 0.8,
    marginBottom: 10,
  },
  subLabel: {
    fontSize: 13,
    fontWeight: "600",
    color: COLORS.textSecondary,
    marginTop: 10,
    marginBottom: 4,
  },
  cardBody: { fontSize: 14, color: COLORS.text, lineHeight: 21 },
  infoRow: { flexDirection: "row", alignItems: "center", gap: 8, marginTop: 8 },
  infoText: { fontSize: 13, color: COLORS.textSecondary },
  // Tags
  tagsContainer: { flexDirection: "row", flexWrap: "wrap", gap: 6 },
  tagChip: {
    backgroundColor: `${COLORS.primary}14`,
    borderRadius: 14,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  tagChipText: { fontSize: 12, fontWeight: "600", color: COLORS.primary },
  // Secciones
  seccionItem: { flexDirection: "row", gap: 6, marginBottom: 4 },
  seccionBullet: { fontSize: 14, fontWeight: "600", color: COLORS.textSecondary },
  // Actions
  actionsRow: { marginTop: 4, marginBottom: 10 },
  btnPrimary: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 14,
    borderRadius: 24,
    backgroundColor: COLORS.primary,
  },
  btnPrimaryText: { fontSize: 15, fontWeight: "600", color: "#FFFFFF" },
  btnDanger: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    paddingVertical: 12,
    borderRadius: 24,
    borderWidth: 1.5,
    borderColor: COLORS.error,
    marginBottom: 10,
  },
  btnDangerText: { fontSize: 14, fontWeight: "600", color: COLORS.error },
});

export default DetallePlantillaScreen;
