import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  Pressable,
  View,
  Text,
  StyleSheet,
  StatusBar,
  ActivityIndicator,
  Modal,
  TextInput,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { StackNavigationProp } from "@react-navigation/stack";
import { RouteProp } from "@react-navigation/native";
import { AppRoutesParamList } from "../../../navigation/StackNavigator";
import { COLORS } from "../../../../types";
import WebScrollView from "../../../components/WebScrollView";
import { navigateToHub } from "../../../navigation/navigateToHub";
import {
  asignarEntregablesAGrupo,
  asignarRecursosAGrupo,
  AsignableItem,
  desvincularEntregableDeGrupo,
  desvincularRecursoDeGrupo,
  listarAsignadosGrupo,
  obtenerEntregables,
  obtenerRecursos,
} from "../../../services/grupoAsignacionesService";

type AsignarRecursoScreenNavigationProp = StackNavigationProp<AppRoutesParamList, "AsignarRecurso">;

type AsignarRecursoScreenRouteProp = RouteProp<AppRoutesParamList, "AsignarRecurso">;

interface AsignarRecursoScreenProps {
  navigation: AsignarRecursoScreenNavigationProp;
  route: AsignarRecursoScreenRouteProp;
}

type SourceType = "recurso" | "entregable";

/**
 * Pantalla para asignar un recurso existente (examen) a un grupo
 */
const AsignarRecursoScreen: React.FC<AsignarRecursoScreenProps> = ({ navigation, route }) => {
  const { grupoId } = route.params;
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [successState, setSuccessState] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [modalVisible, setModalVisible] = useState(false);
  const [confirmVisible, setConfirmVisible] = useState(false);
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [selectedType, setSelectedType] = useState<SourceType>("recurso");
  const [confirmRemoveItem, setConfirmRemoveItem] = useState<AsignableItem | null>(null);
  const [recursosDisponibles, setRecursosDisponibles] = useState<AsignableItem[]>([]);
  const [entregablesDisponibles, setEntregablesDisponibles] = useState<AsignableItem[]>([]);
  const [asignadosGrupo, setAsignadosGrupo] = useState<AsignableItem[]>([]);

  const loadData = useCallback(async () => {
    try {
      setIsLoading(true);
      setError("");

      const [recursos, entregables, asignados] = await Promise.all([
        obtenerRecursos(),
        obtenerEntregables(),
        listarAsignadosGrupo(grupoId),
      ]);

      setRecursosDisponibles(
        recursos.map((item) => ({
          id: item.id,
          titulo: item.titulo,
          tipo: "recurso",
          subtipo: item.tipo,
          grupoId: item.grupoId,
        }))
      );
      setEntregablesDisponibles(
        entregables.map((item) => ({
          id: item.id,
          titulo: item.titulo,
          tipo: "entregable",
          subtipo: item.tipo,
          grupoId: item.grupoId,
        }))
      );
      setAsignadosGrupo(asignados);
    } catch {
      setError("No se pudieron cargar recursos y entregables.");
    } finally {
      setIsLoading(false);
    }
  }, [grupoId]);

  useEffect(() => {
    void loadData();
  }, [loadData]);

  const totalEntregablesAsignados = useMemo(
    () => asignadosGrupo.filter((item) => item.tipo === "entregable").length,
    [asignadosGrupo]
  );

  const totalRecursosAsignados = useMemo(
    () => asignadosGrupo.filter((item) => item.tipo === "recurso").length,
    [asignadosGrupo]
  );

  const availableByType = useMemo(() => {
    const source = selectedType === "recurso" ? recursosDisponibles : entregablesDisponibles;
    const filtered = source.filter((item) => item.grupoId !== grupoId);
    const query = searchQuery.trim().toLowerCase();

    if (!query) return filtered;
    return filtered.filter(
      (item) =>
        item.titulo.toLowerCase().includes(query) ||
        (item.subtipo || "").toLowerCase().includes(query)
    );
  }, [selectedType, recursosDisponibles, entregablesDisponibles, grupoId, searchQuery]);

  const openModal = useCallback((type: SourceType) => {
    setSelectedType(type);
    setSelectedIds([]);
    setSearchQuery("");
    setModalVisible(true);
  }, []);

  const toggleItem = useCallback((id: number) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  }, []);

  const openConfirmAssign = useCallback(() => {
    if (selectedIds.length === 0) return;
    setConfirmVisible(true);
  }, [selectedIds.length]);

  const confirmAssign = useCallback(async () => {
    if (selectedIds.length === 0) return;

    try {
      setIsSaving(true);
      setError("");

      if (selectedType === "recurso") {
        await asignarRecursosAGrupo(grupoId, selectedIds);
      } else {
        await asignarEntregablesAGrupo(grupoId, selectedIds);
      }

      setConfirmVisible(false);
      setModalVisible(false);
      setSelectedIds([]);
      setSuccessState(true);
      await loadData();
    } catch {
      setError("No se pudo completar la asignación.");
    } finally {
      setIsSaving(false);
    }
  }, [grupoId, loadData, selectedIds, selectedType]);

  const confirmRemove = useCallback(async () => {
    if (!confirmRemoveItem) return;

    try {
      setIsSaving(true);
      setError("");
      if (confirmRemoveItem.tipo === "recurso") {
        await desvincularRecursoDeGrupo(grupoId, confirmRemoveItem.id);
      } else {
        await desvincularEntregableDeGrupo(grupoId, confirmRemoveItem.id);
      }
      setConfirmRemoveItem(null);
      await loadData();
    } catch {
      setError("No se pudo quitar la asignación.");
    } finally {
      setIsSaving(false);
    }
  }, [confirmRemoveItem, grupoId, loadData]);

  const goCreateNew = useCallback(() => {
    if (selectedType === "recurso") {
      // Los recursos viven en el hub Office; cruce de hub con forma anidada.
      navigateToHub(navigation, "OfficeTab", "ListaRecursos");
      return;
    }
    navigation.navigate("CrearTareaGrupo", { grupoId });
  }, [grupoId, navigation, selectedType]);

  if (successState) {
    return (
      <View style={styles.container}>
        <StatusBar backgroundColor={COLORS.background} barStyle="dark-content" />
        <SafeAreaView style={styles.safeArea}>
          <View style={styles.successContainer}>
            <View style={styles.successIconWrap}>
              <MaterialIcons name="check" size={42} color={COLORS.primary} />
            </View>
            <Text style={styles.successTitle}>Asignación completada</Text>
            <Text style={styles.successSubtitle}>
              Los elementos fueron vinculados al grupo seleccionado.
            </Text>

            <View style={styles.infoCard}>
              <MaterialIcons name="info-outline" size={18} color="#96510A" />
              <Text style={styles.infoCardText}>
                La asignación vincula al grupo y no duplica contenido.
              </Text>
            </View>

            <Pressable
              style={({ pressed }) => [styles.primaryAction, pressed && { opacity: 0.6 }]}
              onPress={() => navigation.goBack()}
            >
              <Text style={styles.primaryActionText}>Volver al detalle</Text>
            </Pressable>

            <Pressable
              style={({ pressed }) => [styles.secondaryAction, pressed && { opacity: 0.6 }]}
              onPress={() => {
                setSuccessState(false);
              }}
            >
              <Text style={styles.secondaryActionText}>Ver elementos asignados</Text>
            </Pressable>
          </View>
        </SafeAreaView>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar backgroundColor={COLORS.background} barStyle="dark-content" />

      <SafeAreaView style={styles.safeArea}>
        <WebScrollView style={styles.content}>
          <View style={styles.header}>
            <Text style={styles.pageTitle}>Recursos y Entregables</Text>
            <Text style={styles.pageSubtitle}>Gestión de materiales pedagógicos</Text>
          </View>

          <View style={styles.statsRow}>
            <View style={styles.statCard}>
              <Text style={styles.statValue}>{totalEntregablesAsignados}</Text>
              <Text style={styles.statLabel}>Entregables</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statValue}>{totalRecursosAsignados}</Text>
              <Text style={styles.statLabel}>Recursos</Text>
            </View>
          </View>

          <View style={styles.actionStack}>
            <Pressable
              style={({ pressed }) => [styles.primaryAction, pressed && { opacity: 0.6 }]}
              onPress={() => openModal("entregable")}
            >
              <MaterialIcons name="playlist-add-check" size={20} color={COLORS.surface} />
              <Text style={styles.primaryActionText}>Asignar entregable</Text>
            </Pressable>

            <Pressable
              style={({ pressed }) => [styles.secondaryAction, pressed && { opacity: 0.6 }]}
              onPress={() => openModal("recurso")}
            >
              <MaterialIcons name="note-add" size={20} color={COLORS.primary} />
              <Text style={styles.secondaryActionText}>Asignar recurso</Text>
            </Pressable>
          </View>

          {error ? (
            <View style={styles.inlineError}>
              <Text style={styles.inlineErrorText}>{error}</Text>
            </View>
          ) : null}

          <View style={styles.listaContainer}>
            <Text style={styles.sectionTitle}>Elementos asignados</Text>

            {isLoading ? (
              <View style={styles.loadingWrap}>
                <ActivityIndicator size="small" color={COLORS.primary} />
                <Text style={styles.loadingText}>Cargando asignaciones...</Text>
              </View>
            ) : null}

            {!isLoading && asignadosGrupo.length > 0
              ? asignadosGrupo.map((item) => (
                  <View key={`${item.tipo}-${item.id}`} style={styles.recursoItem}>
                    <View style={styles.itemIconWrap}>
                      <MaterialIcons
                        name={item.tipo === "recurso" ? "description" : "assignment"}
                        size={20}
                        color={item.tipo === "recurso" ? "#2979C7" : "#D14B4B"}
                      />
                    </View>
                    <View style={styles.recursoInfo}>
                      <Text style={styles.recursoTitulo}>{item.titulo}</Text>
                      <Text style={styles.recursoMetadata}>
                        {item.tipo === "recurso" ? "Recurso" : "Entregable"} •{" "}
                        {item.subtipo || "General"}
                      </Text>
                    </View>
                    <Pressable
                      onPress={() => setConfirmRemoveItem(item)}
                      disabled={isSaving}
                      style={({ pressed }) => [styles.removeButton, pressed && { opacity: 0.6 }]}
                    >
                      <MaterialIcons name="delete-outline" size={20} color="#6E7E96" />
                    </Pressable>
                  </View>
                ))
              : null}
          </View>

          {!isLoading && asignadosGrupo.length === 0 ? (
            <View style={styles.emptyStateContainer}>
              <MaterialIcons name="inventory-2" size={58} color="#C4D1E4" />
              <Text style={styles.emptyStateTitle}>No hay elementos disponibles</Text>
              <Text style={styles.emptyStateText}>
                Aún no has añadido materiales para este grupo.
              </Text>
              <Pressable
                style={({ pressed }) => [styles.emptyStateButton, pressed && { opacity: 0.6 }]}
                onPress={() => openModal("recurso")}
              >
                <MaterialIcons name="add-circle-outline" size={18} color={COLORS.primaryDark} />
                <Text style={styles.emptyStateButtonText}>Asignar primer recurso</Text>
              </Pressable>
            </View>
          ) : null}

          <View style={styles.tipCard}>
            <MaterialIcons name="tips-and-updates" size={18} color="#96510A" />
            <Text style={styles.tipText}>
              Puedes asignar recursos existentes o crear nuevos para vincularlos automáticamente.
            </Text>
          </View>
        </WebScrollView>

        <Modal visible={modalVisible} animationType="slide" transparent>
          <View style={styles.modalBackdrop}>
            <View style={styles.modalCard}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>
                  {selectedType === "recurso" ? "Asignar Recursos" : "Asignar Entregables"}
                </Text>
                <Pressable
                  style={({ pressed }) => pressed && { opacity: 0.6 }}
                  onPress={() => setModalVisible(false)}
                >
                  <MaterialIcons name="close" size={24} color="#60758E" />
                </Pressable>
              </View>

              <View style={styles.searchBox}>
                <MaterialIcons name="search" size={18} color="#7A8DA8" />
                <TextInput
                  value={searchQuery}
                  onChangeText={setSearchQuery}
                  placeholder={`Buscar ${selectedType === "recurso" ? "recursos" : "entregables"} por nombre o tipo`}
                  placeholderTextColor="#90A1B8"
                  style={styles.searchInput}
                />
              </View>

              <WebScrollView style={{ maxHeight: 300 }}>
                {availableByType.length === 0 ? (
                  <Text style={styles.modalEmpty}>No hay elementos disponibles para asignar.</Text>
                ) : (
                  availableByType.map((item) => {
                    const selected = selectedIds.includes(item.id);
                    return (
                      <Pressable
                        key={`${item.tipo}-${item.id}`}
                        style={({ pressed }) => [
                          styles.modalItem,
                          selected && styles.modalItemSelected,
                          pressed && { opacity: 0.6 },
                        ]}
                        onPress={() => toggleItem(item.id)}
                      >
                        <View style={styles.itemIconWrap}>
                          <MaterialIcons
                            name={selectedType === "recurso" ? "description" : "assignment"}
                            size={18}
                            color="#2979C7"
                          />
                        </View>
                        <View style={{ flex: 1 }}>
                          <Text style={styles.modalItemTitle}>{item.titulo}</Text>
                          <Text style={styles.modalItemMeta}>{item.subtipo || "General"}</Text>
                        </View>
                        <MaterialIcons
                          name={selected ? "check-circle" : "radio-button-unchecked"}
                          size={22}
                          color={selected ? COLORS.primary : "#9FB0C7"}
                        />
                      </Pressable>
                    );
                  })
                )}
              </WebScrollView>

              <View style={styles.selectionRow}>
                <Text style={styles.selectionText}>{selectedIds.length} seleccionados</Text>
                <Pressable
                  style={({ pressed }) => pressed && { opacity: 0.6 }}
                  onPress={() => setSelectedIds([])}
                >
                  <Text style={styles.clearText}>Limpiar selección</Text>
                </Pressable>
              </View>

              <Pressable
                style={({ pressed }) => [
                  styles.primaryAction,
                  selectedIds.length === 0 && styles.disabledAction,
                  pressed && { opacity: 0.6 },
                ]}
                onPress={openConfirmAssign}
                disabled={selectedIds.length === 0}
              >
                <Text style={styles.primaryActionText}>Asignar seleccionados</Text>
              </Pressable>

              <Pressable
                style={({ pressed }) => [styles.secondaryAction, pressed && { opacity: 0.6 }]}
                onPress={goCreateNew}
              >
                <Text style={styles.secondaryActionText}>Crear nuevo</Text>
              </Pressable>
            </View>
          </View>
        </Modal>

        <Modal visible={confirmVisible} animationType="fade" transparent>
          <View style={styles.modalBackdrop}>
            <View style={styles.confirmCard}>
              <MaterialIcons name="group-add" size={34} color="#1E77CE" />
              <Text style={styles.confirmTitle}>Confirmar acción</Text>
              <Text style={styles.confirmText}>
                ¿Desea agregar {selectedIds.length} elemento(s) al grupo {grupoId}?
              </Text>
              <Pressable
                style={({ pressed }) => [styles.primaryAction, pressed && { opacity: 0.6 }]}
                onPress={() => void confirmAssign()}
                disabled={isSaving}
              >
                <Text style={styles.primaryActionText}>
                  {isSaving ? "Asignando..." : "Confirmar asignación"}
                </Text>
              </Pressable>
              <Pressable
                style={({ pressed }) => [styles.secondaryAction, pressed && { opacity: 0.6 }]}
                onPress={() => setConfirmVisible(false)}
              >
                <Text style={styles.secondaryActionText}>Cancelar</Text>
              </Pressable>
            </View>
          </View>
        </Modal>

        <Modal visible={!!confirmRemoveItem} animationType="fade" transparent>
          <View style={styles.modalBackdrop}>
            <View style={styles.confirmCard}>
              <MaterialIcons name="remove-circle-outline" size={34} color="#CC5A12" />
              <Text style={styles.confirmTitle}>Quitar asignación</Text>
              <Text style={styles.confirmText}>
                El elemento seguirá en el sistema y solo se desvinculará del grupo.
              </Text>
              <Pressable
                style={({ pressed }) => [styles.primaryAction, pressed && { opacity: 0.6 }]}
                onPress={() => void confirmRemove()}
                disabled={isSaving}
              >
                <Text style={styles.primaryActionText}>Quitar del grupo</Text>
              </Pressable>
              <Pressable
                style={({ pressed }) => [styles.secondaryAction, pressed && { opacity: 0.6 }]}
                onPress={() => setConfirmRemoveItem(null)}
              >
                <Text style={styles.secondaryActionText}>Cancelar</Text>
              </Pressable>
            </View>
          </View>
        </Modal>
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
    width: "100%",
    maxWidth: 960,
    alignSelf: "center",
    paddingHorizontal: 16,
    paddingTop: 14,
    paddingBottom: 8,
  },
  pageTitle: {
    fontSize: 41,
    fontWeight: "800",
    color: COLORS.text,
    marginBottom: 4,
    letterSpacing: -0.4,
  },
  pageSubtitle: {
    fontSize: 24,
    color: COLORS.textSecondary,
    marginBottom: 10,
  },
  statsRow: {
    flexDirection: "row",
    gap: 10,
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  statCard: {
    flex: 1,
    backgroundColor: COLORS.primaryTint,
    borderRadius: 18,
    paddingHorizontal: 14,
    paddingVertical: 14,
  },
  statValue: {
    color: "#1D74CE",
    fontWeight: "800",
    fontSize: 40,
  },
  statLabel: {
    color: COLORS.textSecondary,
    fontSize: 16,
    textTransform: "uppercase",
    fontWeight: "700",
    letterSpacing: 0.3,
  },
  actionStack: {
    paddingHorizontal: 16,
    gap: 10,
    marginBottom: 14,
  },
  primaryAction: {
    borderRadius: 14,
    backgroundColor: COLORS.primary,
    minHeight: 50,
    paddingHorizontal: 14,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    boxShadow: "0px 10px 20px rgba(22, 118, 210, 0.26)",
  },
  primaryActionText: {
    color: COLORS.surface,
    fontWeight: "800",
    fontSize: 18,
  },
  secondaryAction: {
    borderRadius: 14,
    backgroundColor: COLORS.surface,
    minHeight: 50,
    borderWidth: 1,
    borderColor: "#D7E2F1",
    paddingHorizontal: 14,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  secondaryActionText: {
    color: COLORS.primaryDark,
    fontWeight: "800",
    fontSize: 18,
  },
  disabledAction: {
    opacity: 0.5,
  },
  listaContainer: {
    width: "100%",
    maxWidth: 960,
    alignSelf: "center",
    paddingHorizontal: 16,
    paddingTop: 4,
    paddingBottom: 24,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: "800",
    color: COLORS.textSecondary,
    textTransform: "uppercase",
    marginBottom: 10,
    letterSpacing: 0.5,
  },
  loadingWrap: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingVertical: 10,
  },
  loadingText: {
    color: COLORS.textSecondary,
    fontSize: 14,
  },
  recursoItem: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: 14,
    borderRadius: 16,
    marginBottom: 12,
    boxShadow: "0px 8px 18px rgba(18, 44, 86, 0.08)",
  },
  itemIconWrap: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: "#EDF3FB",
    alignItems: "center",
    justifyContent: "center",
  },
  recursoInfo: {
    flex: 1,
    marginLeft: 10,
  },
  recursoTitulo: {
    fontSize: 18,
    fontWeight: "700",
    color: COLORS.text,
    marginBottom: 2,
  },
  recursoMetadata: {
    fontSize: 13,
    color: COLORS.textSecondary,
  },
  removeButton: {
    padding: 6,
  },
  inlineError: {
    marginHorizontal: 16,
    marginBottom: 10,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#F3C8CF",
    backgroundColor: "#FFF1F4",
    paddingHorizontal: 10,
    paddingVertical: 8,
  },
  inlineErrorText: {
    color: "#AD2A37",
    fontWeight: "700",
    fontSize: 13,
  },
  emptyStateContainer: {
    marginHorizontal: 16,
    marginBottom: 14,
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 16,
    padding: 24,
    alignItems: "center",
  },
  emptyStateTitle: {
    marginTop: 8,
    marginBottom: 6,
    color: COLORS.text,
    fontSize: 30,
    fontWeight: "800",
  },
  emptyStateText: {
    fontSize: 20,
    color: COLORS.textSecondary,
    textAlign: "center",
    lineHeight: 29,
    marginBottom: 14,
  },
  emptyStateButton: {
    minHeight: 46,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#D7E2F1",
    backgroundColor: COLORS.surface,
    paddingHorizontal: 14,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    width: "100%",
  },
  emptyStateButtonText: {
    color: COLORS.primaryDark,
    fontSize: 17,
    fontWeight: "800",
  },
  tipCard: {
    marginHorizontal: 16,
    marginBottom: 120,
    borderWidth: 1,
    borderColor: "#F2D0B2",
    backgroundColor: COLORS.warningTint,
    borderRadius: 14,
    padding: 12,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  tipText: {
    flex: 1,
    color: "#6E4B23",
    fontSize: 14,
    lineHeight: 21,
    fontWeight: "600",
  },
  successContainer: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 36,
  },
  successIconWrap: {
    alignSelf: "center",
    width: 130,
    height: 130,
    borderRadius: 999,
    borderWidth: 10,
    borderColor: COLORS.surface,
    backgroundColor: "#EAF3FF",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 18,
  },
  successTitle: {
    textAlign: "center",
    color: COLORS.text,
    fontSize: 46,
    fontWeight: "800",
    marginBottom: 8,
  },
  successSubtitle: {
    textAlign: "center",
    color: COLORS.textSecondary,
    fontSize: 18,
    marginBottom: 18,
  },
  infoCard: {
    borderWidth: 1,
    borderColor: "#F2D0B2",
    backgroundColor: COLORS.warningTint,
    borderRadius: 14,
    paddingHorizontal: 12,
    paddingVertical: 10,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 16,
  },
  infoCardText: {
    flex: 1,
    color: "#6E4B23",
    fontSize: 14,
    lineHeight: 20,
    fontWeight: "600",
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: "rgba(24, 35, 52, 0.42)",
    justifyContent: "flex-end",
  },
  modalCard: {
    backgroundColor: COLORS.backgroundSoft,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 26,
  },
  modalHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 10,
  },
  modalTitle: {
    color: COLORS.text,
    fontSize: 26,
    fontWeight: "800",
  },
  searchBox: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.borderLight,
    paddingHorizontal: 12,
    minHeight: 46,
    marginBottom: 10,
  },
  searchInput: {
    flex: 1,
    marginLeft: 8,
    color: COLORS.text,
    fontSize: 14,
    paddingVertical: 0,
  },
  modalEmpty: {
    color: "#6E7E96",
    fontSize: 14,
    textAlign: "center",
    paddingVertical: 14,
  },
  modalItem: {
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.borderLight,
    borderRadius: 14,
    paddingHorizontal: 10,
    paddingVertical: 12,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 8,
  },
  modalItemSelected: {
    borderColor: COLORS.primary,
    backgroundColor: "#EFF6FF",
  },
  modalItemTitle: {
    color: COLORS.text,
    fontSize: 16,
    fontWeight: "700",
  },
  modalItemMeta: {
    color: COLORS.textSecondary,
    fontSize: 13,
    marginTop: 2,
  },
  selectionRow: {
    marginVertical: 8,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  selectionText: {
    color: "#2C6CB8",
    fontSize: 13,
    fontWeight: "800",
    textTransform: "uppercase",
  },
  clearText: {
    color: "#4D7FB9",
    fontSize: 13,
    fontWeight: "700",
  },
  confirmCard: {
    marginHorizontal: 24,
    marginBottom: 140,
    backgroundColor: COLORS.surface,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: COLORS.borderLight,
    paddingHorizontal: 16,
    paddingVertical: 16,
    gap: 10,
    alignItems: "center",
    alignSelf: "center",
    width: "100%",
    maxWidth: 360,
  },
  confirmTitle: {
    color: COLORS.text,
    fontSize: 28,
    fontWeight: "800",
    textTransform: "capitalize",
  },
  confirmText: {
    color: "#4E607B",
    fontSize: 18,
    textAlign: "center",
    lineHeight: 26,
  },
});

export default AsignarRecursoScreen;
