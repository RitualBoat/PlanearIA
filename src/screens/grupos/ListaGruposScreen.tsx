import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
  SafeAreaView,
  TextInput,
} from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { StackNavigationProp } from "@react-navigation/stack";
import { RootStackParamList } from "../../navigation/StackNavigator";
import { COLORS, FONT_SIZES, Grupo } from "../../../types";
import BottomNavBar from "../../components/BottomNavBar";
import WebScrollView from "../../components/WebScrollView";

/**
 * Tipo para las props de navegación
 */
type ListaGruposScreenNavigationProp = StackNavigationProp<
  RootStackParamList,
  "ListaGrupos"
>;

/**
 * Props del componente
 */
interface ListaGruposScreenProps {
  navigation: ListaGruposScreenNavigationProp;
}

/**
 * Pantalla de Lista de Grupos
 * Muestra todos los grupos del docente
 */
const ListaGruposScreen: React.FC<ListaGruposScreenProps> = ({
  navigation,
}) => {
  const [searchQuery, setSearchQuery] = useState<string>("");

  // Datos de ejemplo - en producción vendrían de un context o API
  const gruposEjemplo: Partial<Grupo>[] = [
    {
      id: 1,
      nombre: "7A - Matemáticas Avanzadas",
      materia: "Matemáticas Avanzadas",
      carrera: "ISC",
      semestre: 7,
      cantidadAlumnos: 28,
      estado: "activo",
      periodo: "Enero-Junio 2024",
    },
    {
      id: 2,
      nombre: "5B - Programación Web",
      materia: "Programación Web",
      carrera: "ITICS",
      semestre: 5,
      cantidadAlumnos: 32,
      estado: "activo",
      periodo: "Enero-Junio 2024",
    },
    {
      id: 3,
      nombre: "3A - Estructuras de Datos",
      materia: "Estructuras de Datos",
      carrera: "ISC",
      semestre: 3,
      cantidadAlumnos: 25,
      estado: "activo",
      periodo: "Enero-Junio 2024",
    },
  ];

  /**
   * Maneja el clic en un grupo
   */
  const handleGrupoPress = (grupo: Partial<Grupo>): void => {
    navigation.navigate("DetalleGrupo", {
      grupoId: grupo.id!,
      grupoNombre: grupo.nombre!,
    });
  };

  /**
   * Filtra los grupos según la búsqueda
   */
  const gruposFiltrados = gruposEjemplo.filter((grupo) =>
    grupo.nombre?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <View style={styles.container}>
      <StatusBar backgroundColor={COLORS.primary} barStyle="light-content" />

      <SafeAreaView style={styles.safeArea}>
        <View style={styles.header}>
          <Text style={styles.title}>Mis Grupos</Text>
          <Text style={styles.subtitle}>
            {gruposEjemplo.length} grupos activos
          </Text>

          {/* Barra de búsqueda */}
          <View style={styles.searchContainer}>
            <MaterialIcons
              name="search"
              size={24}
              color={COLORS.textSecondary}
            />
            <TextInput
              style={styles.searchInput}
              placeholder="Buscar grupo..."
              value={searchQuery}
              onChangeText={setSearchQuery}
              placeholderTextColor={COLORS.textSecondary}
            />
          </View>
        </View>

        <WebScrollView contentContainerStyle={styles.scrollContent}>
          {gruposFiltrados.map((grupo) => (
            <TouchableOpacity
              key={grupo.id}
              style={styles.grupoCard}
              onPress={() => handleGrupoPress(grupo)}
              activeOpacity={0.7}
            >
              <View style={styles.grupoHeader}>
                <View style={styles.grupoIconContainer}>
                  <MaterialIcons
                    name="groups"
                    size={40}
                    color={COLORS.primary}
                  />
                </View>
                <View style={styles.grupoInfo}>
                  <Text style={styles.grupoNombre}>{grupo.nombre}</Text>
                  <Text style={styles.grupoMateria}>{grupo.materia}</Text>
                  <Text style={styles.grupoDetalles}>
                    {grupo.carrera} • Semestre {grupo.semestre}
                  </Text>
                </View>
              </View>

              <View style={styles.grupoFooter}>
                <View style={styles.badge}>
                  <MaterialIcons
                    name="person"
                    size={16}
                    color={COLORS.primary}
                  />
                  <Text style={styles.badgeText}>
                    {grupo.cantidadAlumnos} alumnos
                  </Text>
                </View>
                <View style={[styles.badge, styles.estadoBadge]}>
                  <Text style={styles.estadoText}>
                    {grupo.estado === "activo" ? "Activo" : "Inactivo"}
                  </Text>
                </View>
              </View>
            </TouchableOpacity>
          ))}

          {gruposFiltrados.length === 0 && (
            <View style={styles.emptyContainer}>
              <MaterialIcons
                name="search-off"
                size={64}
                color={COLORS.textSecondary}
              />
              <Text style={styles.emptyText}>No se encontraron grupos</Text>
            </View>
          )}
        </WebScrollView>
      </SafeAreaView>

      <BottomNavBar currentScreen="Lista de Grupos" />
    </View>
  );
};

/**
 * Estilos del componente
 */
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  safeArea: {
    flex: 1,
  },
  header: {
    padding: 20,
    paddingBottom: 10,
  },
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
    elevation: 2,
    shadowColor: COLORS.text,
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 1 },
    shadowRadius: 3,
  },
  searchInput: {
    flex: 1,
    marginLeft: 10,
    fontSize: FONT_SIZES.medium,
    color: COLORS.text,
  },
  scrollContent: {
    padding: 20,
    paddingTop: 10,
  },
  grupoCard: {
    backgroundColor: COLORS.surface,
    borderRadius: 15,
    padding: 20,
    marginBottom: 15,
    elevation: 3,
    shadowColor: COLORS.text,
    shadowOpacity: 0.15,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 5,
  },
  grupoHeader: {
    flexDirection: "row",
    marginBottom: 15,
  },
  grupoIconContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: `${COLORS.primary}20`,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 15,
  },
  grupoInfo: {
    flex: 1,
    justifyContent: "center",
  },
  grupoNombre: {
    fontSize: FONT_SIZES.large,
    fontWeight: "bold",
    color: COLORS.text,
    marginBottom: 4,
  },
  grupoMateria: {
    fontSize: FONT_SIZES.medium,
    color: COLORS.textSecondary,
    marginBottom: 2,
  },
  grupoDetalles: {
    fontSize: FONT_SIZES.small,
    color: COLORS.textSecondary,
  },
  grupoFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  badge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: `${COLORS.primary}15`,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  badgeText: {
    fontSize: FONT_SIZES.small,
    color: COLORS.primary,
    marginLeft: 4,
    fontWeight: "600",
  },
  estadoBadge: {
    backgroundColor: "#4CAF5020",
  },
  estadoText: {
    fontSize: FONT_SIZES.small,
    color: "#4CAF50",
    fontWeight: "600",
  },
  emptyContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: FONT_SIZES.medium,
    color: COLORS.textSecondary,
    marginTop: 15,
  },
});

export default ListaGruposScreen;
