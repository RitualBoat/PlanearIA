import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  StatusBar,
  TextInput,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { COLORS, FONT_SIZES, Recurso } from "../../../types";
import BottomNavBar from "../../components/BottomNavBar";
import { useListaRecursosViewModel } from "../../hooks/useListaRecursosViewModel";

/**
 * Pantalla de Lista de Recursos (View)
 * Solo JSX y StyleSheet - la logica vive en useListaRecursosViewModel
 */
const ListaRecursosScreen: React.FC = () => {
  const { searchQuery, setSearchQuery, getIconByTipo, getColorByTipo } =
    useListaRecursosViewModel();

  // Recursos de ejemplo
  const recursosEjemplo: Partial<Recurso>[] = [
    {
      id: 1,
      titulo: "Examen de Álgebra - Parcial 2",
      tipo: "examen",
      descripcion: "Ecuaciones de segundo grado",
      origen: "ia",
      fechaCreacion: new Date(),
    },
    {
      id: 2,
      titulo: "Presentación: Revolución Mexicana",
      tipo: "presentacion",
      descripcion: "20 diapositivas con imágenes",
      origen: "plantilla",
      fechaCreacion: new Date(),
    },
    {
      id: 3,
      titulo: "Mapa Mental: Sistema Nervioso",
      tipo: "mapa_mental",
      descripcion: "Anatomía y funciones",
      origen: "manual",
      fechaCreacion: new Date(),
    },
  ];

  return (
    <View style={styles.container}>
      <StatusBar backgroundColor={COLORS.primary} barStyle="light-content" />
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.header}>
          <Text style={styles.title}>Mis Recursos</Text>
          <Text style={styles.subtitle}>{recursosEjemplo.length} recursos</Text>

          <View style={styles.searchContainer}>
            <MaterialIcons
              name="search"
              size={24}
              color={COLORS.textSecondary}
            />
            <TextInput
              style={styles.searchInput}
              placeholder="Buscar recurso..."
              value={searchQuery}
              onChangeText={setSearchQuery}
              placeholderTextColor={COLORS.textSecondary}
            />
          </View>
        </View>

        <ScrollView contentContainerStyle={styles.scrollContent}>
          {recursosEjemplo.map((recurso) => (
            <TouchableOpacity key={recurso.id} style={styles.recursoCard}>
              <View style={styles.recursoHeader}>
                <View
                  style={[
                    styles.recursoIcon,
                    { backgroundColor: `${getColorByTipo(recurso.tipo!)}20` },
                  ]}
                >
                  <MaterialIcons
                    name={getIconByTipo(recurso.tipo!) as any}
                    size={30}
                    color={getColorByTipo(recurso.tipo!)}
                  />
                </View>
                <View style={styles.recursoInfo}>
                  <Text style={styles.recursoTitulo}>{recurso.titulo}</Text>
                  <Text style={styles.recursoDescripcion}>
                    {recurso.descripcion}
                  </Text>
                  <View style={styles.recursoBadges}>
                    <View style={styles.badge}>
                      <Text style={styles.badgeText}>
                        {recurso.tipo?.replace("_", " ")}
                      </Text>
                    </View>
                    <View style={[styles.badge, styles.origenBadge]}>
                      <MaterialIcons
                        name={
                          recurso.origen === "ia"
                            ? "auto-awesome"
                            : recurso.origen === "plantilla"
                              ? "dashboard"
                              : "edit"
                        }
                        size={12}
                        color={COLORS.primary}
                      />
                      <Text style={styles.badgeText}>{recurso.origen}</Text>
                    </View>
                  </View>
                </View>
              </View>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </SafeAreaView>
      <BottomNavBar currentScreen="Lista de Recursos" />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  safeArea: { flex: 1 },
  header: { padding: 20, paddingBottom: 10 },
  title: {
    fontSize: FONT_SIZES.xlarge,
    fontWeight: "bold",
    color: COLORS.primary,
    marginBottom: 4,
  },
  subtitle: {
    fontSize: FONT_SIZES.medium,
    color: COLORS.textSecondary,
    marginBottom: 15,
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.surface,
    borderRadius: 10,
    paddingHorizontal: 15,
    paddingVertical: 10,
    boxShadow: "0px 1px 3px rgba(26, 26, 26, 0.1)",
  },
  searchInput: {
    flex: 1,
    marginLeft: 10,
    fontSize: FONT_SIZES.medium,
    color: COLORS.text,
  },
  scrollContent: { padding: 20, paddingTop: 10 },
  recursoCard: {
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    padding: 15,
    marginBottom: 15,
    boxShadow: "0px 2px 5px rgba(26, 26, 26, 0.15)",
  },
  recursoHeader: { flexDirection: "row" },
  recursoIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  recursoInfo: { flex: 1 },
  recursoTitulo: {
    fontSize: FONT_SIZES.medium,
    fontWeight: "bold",
    color: COLORS.text,
    marginBottom: 4,
  },
  recursoDescripcion: {
    fontSize: FONT_SIZES.small,
    color: COLORS.textSecondary,
    marginBottom: 8,
  },
  recursoBadges: { flexDirection: "row", gap: 8 },
  badge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: `${COLORS.primary}15`,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  origenBadge: { gap: 4 },
  badgeText: {
    fontSize: FONT_SIZES.small - 2,
    color: COLORS.primary,
    fontWeight: "600",
    textTransform: "capitalize",
  },
});

export default ListaRecursosScreen;
