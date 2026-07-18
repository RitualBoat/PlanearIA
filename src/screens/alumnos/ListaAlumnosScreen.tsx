import React, { useMemo, useState } from "react";
import {
  Alert,
  FlatList,
  Platform,
  Pressable,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  View,
  useWindowDimensions,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { useNavigation } from "@react-navigation/native";
import type { StackNavigationProp } from "@react-navigation/stack";
import type { AppRoutesParamList } from "../../navigation/StackNavigator";
import { useAlumnos } from "../../context/AlumnosContext";
import type { Alumno } from "../../../types";
import WebScrollView from "../../components/WebScrollView";
import { COLORS } from "../../../types";

type Nav = StackNavigationProp<AppRoutesParamList, "ListaAlumnos">;

const ListaAlumnosScreen: React.FC = () => {
  const navigation = useNavigation<Nav>();
  const { width } = useWindowDimensions();
  const isDesktopWeb = Platform.OS === "web" && width >= 1080;

  const { alumnos, isLoading, eliminarAlumno } = useAlumnos();
  const [searchQuery, setSearchQuery] = useState("");
  const [filtroCarrera, setFiltroCarrera] = useState("Carrera");
  const [filtroGrupo, setFiltroGrupo] = useState("Grupo");
  const [filtroEscuela, setFiltroEscuela] = useState("Escuela");

  const carreraOptions = useMemo(() => {
    const unique = Array.from(new Set(alumnos.map((alumno) => alumno.carrera))).sort();
    return ["Carrera", ...unique];
  }, [alumnos]);

  const grupoOptions = useMemo(() => {
    const unique = Array.from(
      new Set(
        alumnos.map((alumno) =>
          typeof alumno.grupoId === "number" ? `Grupo ${alumno.grupoId}` : "Sin grupo"
        )
      )
    ).sort();

    return ["Grupo", ...unique];
  }, [alumnos]);

  const escuelaOptions = useMemo(() => {
    const unique = Array.from(
      new Set(
        alumnos.map((alumno) => {
          const escuela = (alumno as Alumno & { escuela?: string }).escuela;
          return escuela?.trim() || "Sin escuela";
        })
      )
    ).sort();

    return ["Escuela", ...unique];
  }, [alumnos]);

  const alumnosFiltrados = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();

    return alumnos.filter((alumno) => {
      const nombreCompleto = `${alumno.nombre} ${alumno.apellidos}`.trim().toLowerCase();
      const numeroControl = alumno.numeroControl.toLowerCase();
      const escuela = ((alumno as Alumno & { escuela?: string }).escuela || "Sin escuela").trim();
      const grupoLabel =
        typeof alumno.grupoId === "number" ? `Grupo ${alumno.grupoId}` : "Sin grupo";

      const coincideBusqueda =
        !query || nombreCompleto.includes(query) || numeroControl.includes(query);
      const coincideCarrera = filtroCarrera === "Carrera" || alumno.carrera === filtroCarrera;
      const coincideGrupo = filtroGrupo === "Grupo" || grupoLabel === filtroGrupo;
      const coincideEscuela = filtroEscuela === "Escuela" || escuela === filtroEscuela;

      return coincideBusqueda && coincideCarrera && coincideGrupo && coincideEscuela;
    });
  }, [alumnos, filtroCarrera, filtroEscuela, filtroGrupo, searchQuery]);

  const confirmDelete = (item: Alumno) => {
    const nombre = `${item.nombre} ${item.apellidos}`.trim();
    Alert.alert("Eliminar alumno", `Se eliminara a ${nombre}.`, [
      { text: "Cancelar", style: "cancel" },
      {
        text: "Eliminar",
        style: "destructive",
        onPress: () => {
          void eliminarAlumno(item.id);
        },
      },
    ]);
  };

  const renderMobileCard = ({ item }: { item: Alumno }) => {
    const nombreCompleto = `${item.nombre} ${item.apellidos}`.trim();
    const escuela = (
      (item as Alumno & { escuela?: string }).escuela || "Escuela no definida"
    ).trim();
    const grupoLabel = typeof item.grupoId === "number" ? `Grupo ${item.grupoId}` : "Sin grupo";

    return (
      <View style={styles.mobileCard}>
        <View style={styles.mobileCardHead}>
          <View style={styles.mobileAvatar}>
            <MaterialIcons name="person" size={20} color={COLORS.primary} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.mobileName}>{nombreCompleto}</Text>
            <Text style={styles.mobileControl}>#{item.numeroControl}</Text>
          </View>
          <Pressable
            style={({ pressed }) => pressed && { opacity: 0.6 }}
            testID={`delete-menu-${item.id}`}
            onPress={() => confirmDelete(item)}
          >
            <MaterialIcons name="more-vert" size={20} color="#6B7E98" />
          </Pressable>
        </View>

        <Text style={styles.mobileMeta}>• {item.carrera}</Text>
        <Text style={styles.mobileMeta}>
          • {grupoLabel} | {escuela}
        </Text>

        <View style={styles.mobileActionsRow}>
          <Pressable
            testID={`view-${item.id}`}
            onPress={() => navigation.navigate("DetalleAlumno", { alumnoId: item.id })}
            style={({ pressed }) => [styles.mobileActionBtn, pressed && { opacity: 0.6 }]}
          >
            <Text style={styles.mobileActionText}>VER</Text>
          </Pressable>
          <Pressable
            testID={`edit-${item.id}`}
            onPress={() =>
              navigation.navigate("CrearAlumno", { modo: "editar", alumnoId: item.id })
            }
            style={({ pressed }) => [styles.mobileActionBtn, pressed && { opacity: 0.6 }]}
          >
            <Text style={styles.mobileActionText}>EDITAR</Text>
          </Pressable>
        </View>
      </View>
    );
  };

  const renderMobileContent = () => {
    if (isLoading) {
      return <LoadingSkeletonMobile />;
    }

    if (alumnos.length === 0) {
      return (
        <View style={styles.emptyWrap}>
          <View style={styles.emptyCircle}>
            <MaterialIcons name="school" size={82} color="#D9A65D" />
          </View>
          <Text style={styles.emptyTitle}>Aun no has registrado alumnos</Text>
          <Text style={styles.emptyText}>
            Comienza a organizar tu clase anadiendo tus estudiantes para planificar sus lecciones.
          </Text>
          <Pressable
            style={({ pressed }) => [styles.emptyPrimaryBtn, pressed && { opacity: 0.6 }]}
            onPress={() => navigation.navigate("CrearAlumno")}
          >
            <MaterialIcons name="add-circle" size={18} color={COLORS.surface} />
            <Text style={styles.emptyPrimaryBtnText}>Crear primer alumno</Text>
          </Pressable>
        </View>
      );
    }

    return (
      <>
        <FlatList
          data={alumnosFiltrados}
          keyExtractor={(item) => String(item.id)}
          renderItem={renderMobileCard}
          contentContainerStyle={styles.mobileListContent}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View style={styles.stateCard}>
              <MaterialIcons name="search-off" size={24} color="#5F7EA0" />
              <Text style={styles.stateTitle}>No hay resultados</Text>
              <Text style={styles.stateText}>Intenta ajustar la busqueda o filtros.</Text>
            </View>
          }
        />
        <Pressable
          style={({ pressed }) => [styles.fabButton, pressed && { opacity: 0.9 }]}
          onPress={() => navigation.navigate("CrearAlumno")}
        >
          <MaterialIcons name="person-add" size={24} color={COLORS.surface} />
        </Pressable>
      </>
    );
  };

  const renderWebContent = () => {
    if (isLoading) {
      return (
        <View style={styles.webPanel}>
          <Text style={styles.webTitle}>Lista de Alumnos</Text>
          <LoadingSkeletonWeb />
        </View>
      );
    }

    if (alumnos.length === 0) {
      return (
        <View style={styles.webPanel}>
          <Text style={styles.webTitle}>Lista de Alumnos</Text>
          <View style={styles.webEmptyWrap}>
            <View style={styles.webEmptyCard}>
              <View style={styles.webEmptyIcon}>
                <MaterialIcons name="school" size={44} color="#9EC0E3" />
              </View>
            </View>
            <View style={styles.webEmptyInfo}>
              <Text style={styles.webEmptyTitle}>Aun no tienes alumnos registrados</Text>
              <Text style={styles.webEmptyText}>
                Agrega a tus primeros alumnos para gestionar su progreso.
              </Text>
              <View style={styles.webEmptyActions}>
                <Pressable
                  style={({ pressed }) => [styles.webPrimaryBtn, pressed && { opacity: 0.6 }]}
                  onPress={() => navigation.navigate("CrearAlumno")}
                >
                  <MaterialIcons name="person-add" size={16} color={COLORS.surface} />
                  <Text style={styles.webPrimaryBtnText}>Registrar primer alumno</Text>
                </Pressable>
              </View>
            </View>
          </View>
        </View>
      );
    }

    return (
      <View style={styles.webPanel}>
        <View style={styles.webPanelHeader}>
          <View>
            <Text style={styles.webTitle}>Lista de Alumnos</Text>
            <Text style={styles.webSubtitle}>Gestion academica y seguimiento de matricula</Text>
          </View>
          <Pressable
            style={({ pressed }) => [styles.webPrimaryBtn, pressed && { opacity: 0.6 }]}
            onPress={() => navigation.navigate("CrearAlumno")}
          >
            <MaterialIcons name="add" size={18} color={COLORS.surface} />
            <Text style={styles.webPrimaryBtnText}>Nuevo Alumno</Text>
          </Pressable>
        </View>

        <View style={styles.webFiltersRow}>
          <FilterSelect
            value={filtroCarrera}
            options={carreraOptions}
            onChange={setFiltroCarrera}
            mobile={false}
          />
          <FilterSelect
            value={filtroGrupo}
            options={grupoOptions}
            onChange={setFiltroGrupo}
            mobile={false}
          />
          <FilterSelect
            value={filtroEscuela}
            options={escuelaOptions}
            onChange={setFiltroEscuela}
            mobile={false}
          />
          <Pressable
            style={({ pressed }) => [styles.webClearBtn, pressed && { opacity: 0.6 }]}
            onPress={() => {
              setFiltroCarrera("Carrera");
              setFiltroGrupo("Grupo");
              setFiltroEscuela("Escuela");
            }}
          >
            <Text style={styles.webClearBtnText}>Limpiar filtros</Text>
          </Pressable>
        </View>

        <View style={styles.tableCard}>
          <View style={styles.tableHeader}>
            <Text style={[styles.tableHeadText, styles.colAlumno]}>Alumno</Text>
            <Text style={[styles.tableHeadText, styles.colControl]}>Control</Text>
            <Text style={[styles.tableHeadText, styles.colCarrera]}>Carrera</Text>
            <Text style={[styles.tableHeadText, styles.colGrupo]}>Grupo</Text>
            <Text style={[styles.tableHeadText, styles.colEscuela]}>Escuela</Text>
            <Text style={[styles.tableHeadText, styles.colAcciones]}>Acciones</Text>
          </View>

          {alumnosFiltrados.map((item) => {
            const nombreCompleto = `${item.nombre} ${item.apellidos}`.trim();
            const escuela = (
              (item as Alumno & { escuela?: string }).escuela || "Sin escuela"
            ).trim();
            const grupoLabel = typeof item.grupoId === "number" ? `A-${item.grupoId}` : "-";
            return (
              <View style={styles.tableRow} key={item.id}>
                <Text style={[styles.tableCell, styles.colAlumno]}>{nombreCompleto}</Text>
                <Text style={[styles.tableCell, styles.colControl]}>{item.numeroControl}</Text>
                <Text style={[styles.tableCell, styles.colCarrera]}>{item.carrera}</Text>
                <Text style={[styles.tableCell, styles.colGrupo]}>{grupoLabel}</Text>
                <Text style={[styles.tableCell, styles.colEscuela]}>{escuela}</Text>
                <View style={[styles.tableActions, styles.colAcciones]}>
                  <Pressable
                    style={({ pressed }) => [styles.tableActionBtn, pressed && { opacity: 0.6 }]}
                    onPress={() => navigation.navigate("DetalleAlumno", { alumnoId: item.id })}
                  >
                    <Text style={styles.tableActionText}>Ver</Text>
                  </Pressable>
                  <Pressable
                    style={({ pressed }) => [styles.tableActionBtn, pressed && { opacity: 0.6 }]}
                    onPress={() =>
                      navigation.navigate("CrearAlumno", { modo: "editar", alumnoId: item.id })
                    }
                  >
                    <Text style={styles.tableActionText}>Editar</Text>
                  </Pressable>
                  <Pressable
                    style={({ pressed }) => [styles.tableActionBtn, pressed && { opacity: 0.6 }]}
                    onPress={() => confirmDelete(item)}
                  >
                    <Text style={styles.tableActionDanger}>Eliminar</Text>
                  </Pressable>
                </View>
              </View>
            );
          })}
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <StatusBar backgroundColor={COLORS.background} barStyle="dark-content" />
      <SafeAreaView style={styles.safeArea}>
        {isDesktopWeb ? (
          <View style={styles.webLayout}>
            <View style={styles.webSidebar}>
              <Text style={styles.webBrand}>Cognitive Sanctuary</Text>
              <SideItem label="Dashboard" icon="dashboard" />
              <SideItem label="Students" icon="groups" active />
              <SideItem label="Lesson Plans" icon="menu-book" />
              <SideItem label="Schedule" icon="event" />
              <SideItem label="Reports" icon="assessment" />
            </View>

            <View style={styles.webMain}>{renderWebContent()}</View>
          </View>
        ) : (
          <View style={{ flex: 1 }}>
            <View style={styles.headerMobile}>
              <Pressable
                style={({ pressed }) => pressed && { opacity: 0.6 }}
                onPress={() => navigation.goBack()}
              >
                <MaterialIcons name="menu" size={24} color="#3D4F67" />
              </Pressable>
              <Text style={styles.mobileTitle}>Students</Text>
              <Pressable
                style={({ pressed }) => pressed && { opacity: 0.6 }}
                onPress={() => setSearchQuery("")}
              >
                <MaterialIcons name="search" size={22} color="#3D4F67" />
              </Pressable>
            </View>

            <View style={styles.mobileSearchWrap}>
              <MaterialIcons name="search" size={18} color="#8DA0B9" />
              <TextInput
                value={searchQuery}
                onChangeText={setSearchQuery}
                placeholder="Buscar alumnos..."
                placeholderTextColor="#8FA1B8"
                style={styles.searchInput}
              />
            </View>

            <View style={styles.mobileFiltersRow}>
              <FilterSelect
                value={filtroCarrera}
                options={carreraOptions}
                onChange={setFiltroCarrera}
                mobile
              />
              <FilterSelect
                value={filtroGrupo}
                options={grupoOptions}
                onChange={setFiltroGrupo}
                mobile
              />
              <FilterSelect
                value={filtroEscuela}
                options={escuelaOptions}
                onChange={setFiltroEscuela}
                mobile
              />
            </View>

            <View style={{ flex: 1 }}>{renderMobileContent()}</View>
          </View>
        )}
      </SafeAreaView>
    </View>
  );
};

const FilterSelect: React.FC<{
  value: string;
  options: string[];
  onChange: (value: string) => void;
  mobile: boolean;
}> = ({ value, options, onChange, mobile }) => {
  const pick = () => {
    Alert.alert(
      "Seleccionar filtro",
      "",
      options.map((item) => ({ text: item, onPress: () => onChange(item) }))
    );
  };

  return (
    <Pressable
      style={({ pressed }) => [
        mobile ? styles.mobileFilterChip : styles.webFilterSelect,
        value !== options[0] && styles.filterActive,
        pressed && { opacity: 0.6 },
      ]}
      onPress={pick}
    >
      <Text style={mobile ? styles.mobileFilterText : styles.webFilterText}>{value}</Text>
      <MaterialIcons name="expand-more" size={18} color="#70829B" />
    </Pressable>
  );
};

const SideItem: React.FC<{
  label: string;
  icon: keyof typeof MaterialIcons.glyphMap;
  active?: boolean;
}> = ({ label, icon, active = false }) => (
  <View style={[styles.sideItem, active && styles.sideItemActive]}>
    <MaterialIcons name={icon} size={16} color={active ? COLORS.primaryDark : "#6A7D97"} />
    <Text style={[styles.sideItemText, active && styles.sideItemTextActive]}>{label}</Text>
  </View>
);

const LoadingSkeletonMobile: React.FC = () => (
  <View style={styles.skeletonWrap}>
    {[1, 2, 3, 4].map((row) => (
      <View style={styles.skeletonCard} key={row}>
        <View style={styles.skeletonAvatar} />
        <View style={{ flex: 1 }}>
          <View style={styles.skeletonLineLg} />
          <View style={styles.skeletonLineSm} />
        </View>
      </View>
    ))}
  </View>
);

const LoadingSkeletonWeb: React.FC = () => (
  <View style={styles.webSkeletonWrap}>
    {[1, 2, 3, 4].map((row) => (
      <View style={styles.webSkeletonLine} key={row} />
    ))}
  </View>
);

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  safeArea: { flex: 1 },

  headerMobile: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 14,
    paddingTop: 8,
    paddingBottom: 8,
  },
  mobileTitle: { color: "#1E73BC", fontSize: 32, fontWeight: "800" },
  mobileSearchWrap: {
    marginHorizontal: 12,
    marginTop: 6,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: "#D8E4F4",
    borderRadius: 14,
    backgroundColor: COLORS.surface,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 12,
  },
  searchInput: {
    flex: 1,
    color: "#2E4058",
    fontSize: 15,
    paddingVertical: 12,
  },
  mobileFiltersRow: { flexDirection: "row", gap: 8, paddingHorizontal: 12, marginBottom: 6 },
  mobileFilterChip: {
    flex: 1,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: "#D7E3F2",
    backgroundColor: COLORS.surface,
    paddingHorizontal: 10,
    paddingVertical: 8,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  mobileFilterText: { color: "#667A95", fontWeight: "700", fontSize: 13 },
  filterActive: { backgroundColor: "#DFF2FF", borderColor: "#B5DEF9" },

  mobileListContent: { paddingHorizontal: 12, paddingBottom: 100 },
  mobileCard: {
    borderRadius: 16,
    borderWidth: 1,
    borderColor: COLORS.borderLight,
    backgroundColor: COLORS.surface,
    padding: 12,
    marginTop: 10,
  },
  mobileCardHead: { flexDirection: "row", alignItems: "center", gap: 10 },
  mobileAvatar: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#E9F3FF",
  },
  mobileName: { color: "#2E4058", fontSize: 19, fontWeight: "800" },
  mobileControl: { color: "#7890AC", marginTop: 2 },
  mobileMeta: { marginTop: 8, color: "#4F6887", fontWeight: "600" },
  mobileActionsRow: {
    marginTop: 10,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: "#EDF2FA",
    flexDirection: "row",
    gap: 14,
  },
  mobileActionBtn: { paddingVertical: 2 },
  mobileActionText: { color: "#2A72B6", fontWeight: "800", letterSpacing: 0.5 },

  fabButton: {
    position: "absolute",
    right: 16,
    bottom: 16,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: "#1572C3",
    alignItems: "center",
    justifyContent: "center",
    boxShadow: "0px 8px 16px rgba(14, 67, 117, 0.28)",
  },

  stateCard: {
    marginTop: 16,
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#DDE8F7",
    padding: 16,
    alignItems: "center",
    gap: 8,
  },
  stateTitle: { fontSize: 15, fontWeight: "700", color: "#2D3E57" },
  stateText: { fontSize: 13, color: COLORS.textTertiary, textAlign: "center" },

  emptyWrap: { alignItems: "center", paddingHorizontal: 28, paddingTop: 28 },
  emptyCircle: {
    width: 190,
    height: 190,
    borderRadius: 95,
    backgroundColor: COLORS.surface,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  emptyTitle: {
    marginTop: 20,
    textAlign: "center",
    color: "#2B3C54",
    fontSize: 19,
    fontWeight: "800",
  },
  emptyText: {
    marginTop: 10,
    color: "#677B95",
    textAlign: "center",
    lineHeight: 22,
    fontSize: 18,
  },
  emptyPrimaryBtn: {
    marginTop: 20,
    borderRadius: 999,
    backgroundColor: COLORS.primary,
    paddingHorizontal: 22,
    paddingVertical: 13,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  emptyPrimaryBtnText: { color: COLORS.surface, fontWeight: "800", fontSize: 16 },

  skeletonWrap: { paddingHorizontal: 12, paddingTop: 8, gap: 10 },
  skeletonCard: {
    borderRadius: 16,
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: "#E2EAF4",
    padding: 12,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  skeletonAvatar: { width: 38, height: 38, borderRadius: 19, backgroundColor: COLORS.border },
  skeletonLineLg: {
    width: "75%",
    height: 12,
    borderRadius: 8,
    backgroundColor: COLORS.border,
    marginBottom: 8,
  },
  skeletonLineSm: { width: "45%", height: 10, borderRadius: 8, backgroundColor: COLORS.border },

  webLayout: { flex: 1, flexDirection: "row" },
  webSidebar: {
    width: 220,
    backgroundColor: "#F2F6FC",
    borderRightWidth: 1,
    borderRightColor: "#E0E8F5",
    padding: 14,
    gap: 6,
  },
  webBrand: { fontSize: 26, color: "#2F59A1", fontWeight: "800", marginBottom: 16 },
  sideItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingHorizontal: 10,
    paddingVertical: 10,
    borderRadius: 10,
  },
  sideItemActive: { backgroundColor: "#E8F2FF" },
  sideItemText: { color: "#6D7F99", fontWeight: "700" },
  sideItemTextActive: { color: COLORS.primaryDark },

  webMain: { flex: 1, padding: 16 },
  webPanel: {
    flex: 1,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#DEE7F4",
    backgroundColor: COLORS.surface,
    padding: 16,
  },
  webPanelHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 14,
  },
  webTitle: { color: "#25384F", fontSize: 40, fontWeight: "800" },
  webSubtitle: { color: COLORS.textTertiary, marginTop: 4 },
  webFiltersRow: { flexDirection: "row", gap: 10, marginBottom: 12 },
  webFilterSelect: {
    width: 200,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#DCE6F4",
    backgroundColor: COLORS.backgroundSoft,
    paddingHorizontal: 10,
    paddingVertical: 10,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  webFilterText: { color: "#5D7391", fontWeight: "700" },
  webClearBtn: {
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#DCE6F4",
    backgroundColor: COLORS.backgroundSoft,
    paddingHorizontal: 14,
    justifyContent: "center",
  },
  webClearBtnText: { color: "#5D7391", fontWeight: "700" },
  webPrimaryBtn: {
    borderRadius: 999,
    backgroundColor: COLORS.primary,
    paddingHorizontal: 18,
    paddingVertical: 10,
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    alignSelf: "flex-start",
  },
  webPrimaryBtnText: { color: COLORS.surface, fontWeight: "800" },

  tableCard: {
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
    overflow: "hidden",
  },
  tableHeader: {
    flexDirection: "row",
    backgroundColor: COLORS.backgroundSoft,
    paddingHorizontal: 10,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#E2EAF6",
  },
  tableHeadText: { color: "#6C809C", fontSize: 12, fontWeight: "800", textTransform: "uppercase" },
  tableRow: {
    flexDirection: "row",
    paddingHorizontal: 10,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.background,
  },
  tableCell: { color: "#2F435D", fontWeight: "600" },
  colAlumno: { width: 210 },
  colControl: { width: 120 },
  colCarrera: { width: 150 },
  colGrupo: { width: 90 },
  colEscuela: { flex: 1 },
  colAcciones: { width: 190 },
  tableActions: { flexDirection: "row", gap: 8 },
  tableActionBtn: {
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#D4E0EF",
    backgroundColor: COLORS.backgroundSoft,
    paddingHorizontal: 8,
    paddingVertical: 5,
  },
  tableActionText: { color: "#1E6DB2", fontWeight: "700", fontSize: 12 },
  tableActionDanger: { color: COLORS.error, fontWeight: "700", fontSize: 12 },

  webSkeletonWrap: { marginTop: 16, gap: 12 },
  webSkeletonLine: {
    height: 48,
    borderRadius: 10,
    backgroundColor: "#EDF3FA",
  },

  webEmptyWrap: { flexDirection: "row", gap: 18, marginTop: 18 },
  webEmptyCard: {
    width: 340,
    height: 280,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: COLORS.backgroundSoft,
    alignItems: "center",
    justifyContent: "center",
  },
  webEmptyIcon: {
    width: 108,
    height: 108,
    borderRadius: 54,
    backgroundColor: "#EAF2FC",
    alignItems: "center",
    justifyContent: "center",
  },
  webEmptyInfo: { flex: 1, paddingTop: 8 },
  webEmptyTitle: { color: "#2D3F58", fontSize: 38, fontWeight: "800" },
  webEmptyText: { color: "#6A7D97", lineHeight: 22, marginTop: 10, maxWidth: 420, fontSize: 16 },
  webEmptyActions: { marginTop: 16, flexDirection: "row", gap: 10 },
});

export default ListaAlumnosScreen;
