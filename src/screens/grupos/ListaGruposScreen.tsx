import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
  TextInput,
  ActivityIndicator,
  useWindowDimensions,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { StackNavigationProp } from "@react-navigation/stack";
import { RootStackParamList } from "../../navigation/StackNavigator";
import { COLORS, Grupo } from "../../../types";
import { useGrupos } from "../../hooks/useGrupos";
import { isWeb } from "../../utils/responsive";
import WebScrollView from "../../components/WebScrollView";

type ListaGruposScreenNavigationProp = StackNavigationProp<RootStackParamList, "ListaGrupos">;

interface ListaGruposScreenProps {
  navigation: ListaGruposScreenNavigationProp;
}

const ListaGruposScreen: React.FC<ListaGruposScreenProps> = ({ navigation }) => {
  const { width } = useWindowDimensions();
  const wideLayout = width >= 920;

  const { gruposFiltrados, isLoading, error, searchQuery, setSearchQuery, conteoGrupos } =
    useGrupos();

  const handleGrupoPress = (grupo: Partial<Grupo>): void => {
    navigation.navigate("DetalleGrupo", {
      grupoId: grupo.id!,
      grupoNombre: grupo.nombre!,
    });
  };

  if (isLoading) {
    return (
      <View style={styles.container}>
        <StatusBar backgroundColor="#EEF3FA" barStyle="dark-content" />
        <SafeAreaView style={styles.safeArea}>
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#1676D2" />
            <Text style={styles.loadingText}>Cargando grupos...</Text>
          </View>
        </SafeAreaView>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.container}>
        <StatusBar backgroundColor="#EEF3FA" barStyle="dark-content" />
        <SafeAreaView style={styles.safeArea}>
          <View style={styles.errorContainer}>
            <MaterialIcons name="error-outline" size={64} color="#D34553" />
            <Text style={styles.errorTitle}>Error al cargar grupos</Text>
            <Text style={styles.errorText}>{error}</Text>
          </View>
        </SafeAreaView>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar backgroundColor="#EEF3FA" barStyle="dark-content" />

      <SafeAreaView style={styles.safeArea}>
        <View style={styles.header}>
          <Text style={styles.title}>Mis Grupos</Text>
          <Text style={styles.subtitle}>{conteoGrupos} grupos activos</Text>

          <View style={styles.searchContainer}>
            <MaterialIcons name="search" size={20} color="#6B7D96" />
            <TextInput
              style={styles.searchInput}
              placeholder="Buscar grupo..."
              value={searchQuery}
              onChangeText={setSearchQuery}
              placeholderTextColor="#6B7D96"
            />
          </View>
        </View>

        <WebScrollView
          contentContainerStyle={[styles.scrollContent, wideLayout && styles.scrollContentWide]}
        >
          {gruposFiltrados.map((grupo) => (
            <TouchableOpacity
              key={grupo.id}
              style={[styles.grupoCard, wideLayout && styles.grupoCardWide]}
              onPress={() => handleGrupoPress(grupo)}
              activeOpacity={0.9}
            >
              <View style={styles.grupoHeader}>
                <View style={styles.grupoIconContainer}>
                  <MaterialIcons name="groups" size={26} color="#1676D2" />
                </View>

                <View style={styles.grupoInfo}>
                  <Text style={styles.grupoNombre}>{grupo.nombre}</Text>
                  <Text style={styles.grupoMateria}>{grupo.materia}</Text>
                  <Text style={styles.grupoDetalles}>
                    {grupo.carrera} · Semestre {grupo.semestre}
                  </Text>
                </View>

                <MaterialIcons name="chevron-right" size={22} color="#8A9AB1" />
              </View>

              <View style={styles.grupoFooter}>
                <View style={styles.badge}>
                  <MaterialIcons name="person" size={14} color="#1676D2" />
                  <Text style={styles.badgeText}>{grupo.cantidadAlumnos} alumnos</Text>
                </View>

                <View
                  style={[
                    styles.badge,
                    grupo.estado === "activo"
                      ? styles.estadoActivoBadge
                      : styles.estadoInactivoBadge,
                  ]}
                >
                  <Text
                    style={[
                      styles.estadoText,
                      grupo.estado === "activo"
                        ? styles.estadoActivoText
                        : styles.estadoInactivoText,
                    ]}
                  >
                    {grupo.estado === "activo" ? "Activo" : "Inactivo"}
                  </Text>
                </View>
              </View>
            </TouchableOpacity>
          ))}

          {gruposFiltrados.length === 0 && (
            <View style={styles.emptyContainer}>
              <MaterialIcons name="search-off" size={56} color="#9AABBF" />
              <Text style={styles.emptyTitle}>No se encontraron grupos</Text>
              <Text style={styles.emptyText}>Prueba ajustando el texto de búsqueda.</Text>
            </View>
          )}
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
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: "#6B7D96",
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  errorTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#D34553",
    marginTop: 12,
    marginBottom: 6,
  },
  errorText: {
    fontSize: 14,
    color: "#5C6E86",
    textAlign: "center",
  },
  header: {
    paddingHorizontal: 16,
    paddingTop: 14,
    paddingBottom: 10,
    width: "100%",
    alignSelf: "center",
    maxWidth: 1220,
  },
  title: {
    fontSize: 34,
    fontWeight: "800",
    color: "#1E2A3A",
    letterSpacing: -0.4,
  },
  subtitle: {
    marginTop: 2,
    fontSize: 15,
    color: "#5C6E86",
    marginBottom: 10,
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: "#E3EAF4",
    minHeight: 48,
    boxShadow: "0px 8px 14px rgba(18, 44, 86, 0.06)",
  },
  searchInput: {
    flex: 1,
    marginLeft: 8,
    fontSize: 15,
    color: "#1E2A3A",
    paddingVertical: 0,
  },
  scrollContent: {
    width: "100%",
    maxWidth: 1220,
    alignSelf: "center",
    paddingHorizontal: 16,
    paddingBottom: isWeb() ? 28 : 110,
    gap: 10,
  },
  scrollContentWide: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  grupoCard: {
    width: "100%",
    backgroundColor: "#FFFFFF",
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#E3EAF4",
    padding: 14,
    gap: 10,
    boxShadow: "0px 10px 22px rgba(33, 60, 109, 0.08)",
  },
  grupoCardWide: {
    width: "49%",
  },
  grupoHeader: {
    flexDirection: "row",
    alignItems: "center",
  },
  grupoIconContainer: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: "#EAF4FF",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 10,
  },
  grupoInfo: {
    flex: 1,
  },
  grupoNombre: {
    fontSize: 17,
    fontWeight: "700",
    color: "#1E2A3A",
  },
  grupoMateria: {
    fontSize: 14,
    color: "#4D5D74",
    marginTop: 1,
  },
  grupoDetalles: {
    marginTop: 1,
    fontSize: 12,
    color: "#7D8EA7",
  },
  grupoFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  badge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#EAF4FF",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 14,
    gap: 5,
  },
  badgeText: {
    fontSize: 12,
    color: "#1676D2",
    fontWeight: "700",
  },
  estadoText: {
    fontSize: 12,
    fontWeight: "700",
  },
  estadoActivoBadge: {
    backgroundColor: "#E7F9F3",
  },
  estadoInactivoBadge: {
    backgroundColor: "#FFF1E7",
  },
  estadoActivoText: {
    color: "#0D9E70",
  },
  estadoInactivoText: {
    color: "#C77A2B",
  },
  emptyContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 60,
    width: "100%",
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#4D5D74",
    marginTop: 8,
  },
  emptyText: {
    fontSize: 14,
    color: "#7D8EA7",
    marginTop: 3,
  },
});

export default ListaGruposScreen;
