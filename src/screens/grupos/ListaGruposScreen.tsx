import React from "react";
import {
  Pressable,
  View,
  Text,
  StyleSheet,
  StatusBar,
  TextInput,
  ActivityIndicator,
} from "react-native";
import { useBreakpoint } from "../../hooks/useBreakpoint";
import { SafeAreaView } from "react-native-safe-area-context";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { StackNavigationProp } from "@react-navigation/stack";
import { AppRoutesParamList } from "../../navigation/StackNavigator";
import { COLORS, Grupo } from "../../../types";
import { useGrupos } from "../../hooks/useGrupos";
import { isWeb } from "../../utils/responsive";
import WebScrollView from "../../components/WebScrollView";
import ScreenBackButton from "../../components/ScreenBackButton";

type ListaGruposScreenNavigationProp = StackNavigationProp<AppRoutesParamList, "ListaGrupos">;

interface ListaGruposScreenProps {
  navigation: ListaGruposScreenNavigationProp;
}

const ListaGruposScreen: React.FC<ListaGruposScreenProps> = ({ navigation }) => {
  const { width } = useBreakpoint();
  const wideLayout = width >= 920;

  const {
    gruposFiltrados,
    isLoading,
    error,
    searchQuery,
    setSearchQuery,
    conteoGrupos,
    syncStatus,
    pendingSyncCount,
    isOnline,
    sincronizarGrupos,
  } = useGrupos();

  const syncLabel = !isOnline
    ? "Sin conexión"
    : syncStatus === "syncing"
      ? "Sincronizando..."
      : syncStatus === "error"
        ? "Error de sincronización"
        : pendingSyncCount > 0
          ? `${pendingSyncCount} pendientes`
          : "Sincronizado";

  const handleGrupoPress = (grupo: Partial<Grupo>): void => {
    navigation.navigate("DetalleGrupo", {
      grupoId: grupo.id!,
      grupoNombre: grupo.nombre!,
    });
  };

  if (isLoading) {
    return (
      <View style={styles.container}>
        <StatusBar backgroundColor={COLORS.background} barStyle="dark-content" />
        <SafeAreaView style={styles.safeArea}>
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={COLORS.primary} />
            <Text style={styles.loadingText}>Cargando grupos...</Text>
          </View>
        </SafeAreaView>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.container}>
        <StatusBar backgroundColor={COLORS.background} barStyle="dark-content" />
        <SafeAreaView style={styles.safeArea}>
          <View style={styles.errorContainer}>
            <MaterialIcons name="error-outline" size={64} color={COLORS.danger} />
            <Text style={styles.errorTitle}>Error al cargar grupos</Text>
            <Text style={styles.errorText}>{error}</Text>
          </View>
        </SafeAreaView>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar backgroundColor={COLORS.background} barStyle="dark-content" />

      <SafeAreaView style={styles.safeArea}>
        <View style={styles.header}>
          <ScreenBackButton style={{ marginLeft: -8, marginBottom: 2 }} />
          <Text style={styles.title}>Mis Grupos</Text>
          <Text style={styles.subtitle}>{conteoGrupos} grupos activos</Text>

          <View style={styles.syncRow}>
            <View
              style={[
                styles.syncBadge,
                !isOnline
                  ? styles.syncOffline
                  : syncStatus === "error"
                    ? styles.syncError
                    : pendingSyncCount > 0
                      ? styles.syncPending
                      : styles.syncOk,
              ]}
            >
              <MaterialIcons
                name={
                  !isOnline ? "cloud-off" : pendingSyncCount > 0 ? "cloud-upload" : "cloud-done"
                }
                size={14}
                color={
                  !isOnline
                    ? "#B87424"
                    : syncStatus === "error"
                      ? COLORS.dangerDark
                      : pendingSyncCount > 0
                        ? COLORS.primaryDark
                        : COLORS.successLight
                }
              />
              <Text style={styles.syncText}>{syncLabel}</Text>
            </View>

            <Pressable
              style={({ pressed }) => [styles.syncButton, pressed && { opacity: 0.6 }]}
              onPress={() => void sincronizarGrupos()}
              disabled={!isOnline || syncStatus === "syncing"}
            >
              <MaterialIcons name="sync" size={16} color={COLORS.primary} />
              <Text style={styles.syncButtonText}>Sincronizar</Text>
            </Pressable>
          </View>

          <View style={styles.searchContainer}>
            <MaterialIcons name="search" size={20} color={COLORS.textTertiary} />
            <TextInput
              style={styles.searchInput}
              placeholder="Buscar grupo..."
              value={searchQuery}
              onChangeText={setSearchQuery}
              placeholderTextColor={COLORS.textTertiary}
            />
          </View>
        </View>

        <WebScrollView
          contentContainerStyle={[styles.scrollContent, wideLayout && styles.scrollContentWide]}
        >
          {gruposFiltrados.map((grupo) => (
            <Pressable
              key={grupo.id}
              style={({ pressed }) => [
                styles.grupoCard,
                wideLayout && styles.grupoCardWide,
                pressed && { opacity: 0.9 },
              ]}
              onPress={() => handleGrupoPress(grupo)}
            >
              <View style={styles.grupoHeader}>
                <View style={styles.grupoIconContainer}>
                  <MaterialIcons name="groups" size={26} color={COLORS.primary} />
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
                  <MaterialIcons name="person" size={14} color={COLORS.primary} />
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
            </Pressable>
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
    backgroundColor: COLORS.background,
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
    color: COLORS.textTertiary,
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
    color: COLORS.danger,
    marginTop: 12,
    marginBottom: 6,
  },
  errorText: {
    fontSize: 14,
    color: COLORS.textSecondary,
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
    color: COLORS.text,
    letterSpacing: -0.4,
  },
  subtitle: {
    marginTop: 2,
    fontSize: 15,
    color: COLORS.textSecondary,
    marginBottom: 10,
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
    minHeight: 48,
    boxShadow: "0px 8px 14px rgba(18, 44, 86, 0.06)",
  },
  syncRow: {
    marginBottom: 10,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 8,
  },
  syncBadge: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderWidth: 1,
    gap: 6,
  },
  syncOk: {
    backgroundColor: COLORS.successTint,
    borderColor: "#B8EAD8",
  },
  syncPending: {
    backgroundColor: COLORS.primaryTint,
    borderColor: "#CAE1FB",
  },
  syncError: {
    backgroundColor: COLORS.errorTint,
    borderColor: COLORS.errorTint,
  },
  syncOffline: {
    backgroundColor: "#FFF5E9",
    borderColor: "#F5D7B0",
  },
  syncText: {
    fontSize: 12,
    fontWeight: "700",
    color: COLORS.text,
  },
  syncButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    borderWidth: 1,
    borderColor: COLORS.borderLight,
    backgroundColor: COLORS.surface,
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  syncButtonText: {
    fontSize: 12,
    fontWeight: "700",
    color: COLORS.primary,
  },
  searchInput: {
    flex: 1,
    marginLeft: 8,
    fontSize: 15,
    color: COLORS.text,
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
    backgroundColor: COLORS.surface,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: COLORS.border,
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
    backgroundColor: COLORS.primaryTint,
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
    color: COLORS.text,
  },
  grupoMateria: {
    fontSize: 14,
    color: COLORS.textDark,
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
    backgroundColor: COLORS.primaryTint,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 14,
    gap: 5,
  },
  badgeText: {
    fontSize: 12,
    color: COLORS.primary,
    fontWeight: "700",
  },
  estadoText: {
    fontSize: 12,
    fontWeight: "700",
  },
  estadoActivoBadge: {
    backgroundColor: COLORS.successTint,
  },
  estadoInactivoBadge: {
    backgroundColor: "#FFF1E7",
  },
  estadoActivoText: {
    color: COLORS.successLight,
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
    color: COLORS.textDark,
    marginTop: 8,
  },
  emptyText: {
    fontSize: 14,
    color: "#7D8EA7",
    marginTop: 3,
  },
});

export default ListaGruposScreen;
