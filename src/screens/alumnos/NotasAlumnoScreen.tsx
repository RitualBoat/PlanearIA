import React from "react";
import {
  Alert,
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
import WebScrollView from "../../components/WebScrollView";
import { COLORS } from "../../../types";
import {
  type CategoriaNotaAlumno,
  type FiltroNotasAlumno,
  useNotasAlumnoViewModel,
} from "../../hooks/useNotasAlumnoViewModel";

const filtros: Array<{ key: FiltroNotasAlumno; label: string }> = [
  { key: "todas", label: "Todas" },
  { key: "recientes", label: "Recientes" },
  { key: "importantes", label: "Importantes" },
];

const categorias: Array<{ key: CategoriaNotaAlumno; label: string }> = [
  { key: "academico", label: "Académico" },
  { key: "conductual", label: "Conductual" },
  { key: "logro", label: "Participación" },
];

const tipoBadge = {
  academico: { label: "MATEMÁTICAS", bg: "#FCE9D8", color: "#A45B2A" },
  conductual: { label: "ATENCIÓN", bg: "#FBE7EA", color: "#B94A60" },
  logro: { label: "PROGRESO", bg: "#DFF4F8", color: "#267B92" },
  area_mejora: { label: "MEJORA", bg: COLORS.progressTrack, color: "#496180" },
  general: { label: "GENERAL", bg: COLORS.progressTrack, color: "#496180" },
};

const formatDate = (date: Date): string => {
  return new Intl.DateTimeFormat("es-MX", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  })
    .format(date)
    .replace(".", "")
    .toUpperCase();
};

const NotasAlumnoScreen: React.FC = () => {
  const { width } = useWindowDimensions();
  const isDesktop = width >= 1100;

  const {
    alumnoNombre,
    grupoNombre,
    estado,
    errorCodigo,
    guardando,
    notaDraft,
    categoria,
    filtro,
    notas,
    totalNotas,
    notaEnEdicionId,
    contador,
    maxCaracteres,
    syncMensaje,
    setNotaDraft,
    setCategoria,
    setFiltro,
    guardarNota,
    iniciarEdicion,
    cancelarEdicion,
    eliminarNota,
    recargar,
    goBack,
  } = useNotasAlumnoViewModel();

  const handleEliminar = (id: number) => {
    Alert.alert("Eliminar nota", "¿Deseas eliminar esta observación?", [
      { text: "Cancelar", style: "cancel" },
      { text: "Eliminar", style: "destructive", onPress: () => void eliminarNota(id) },
    ]);
  };

  const renderMobileHeader = () => (
    <View style={styles.header}>
      <Pressable
        style={({ pressed }) => [styles.headerIconButton, pressed && { opacity: 0.6 }]}
        onPress={goBack}
      >
        <MaterialIcons name="arrow-back" size={24} color="#245EA9" />
      </Pressable>
      <Text style={styles.headerTitle}>Personal Notes</Text>
      <Pressable style={({ pressed }) => [styles.headerIconButton, pressed && { opacity: 0.6 }]}>
        <MaterialIcons name="more-vert" size={24} color="#536785" />
      </Pressable>
    </View>
  );

  const renderStudentBlock = () => (
    <View style={styles.studentRow}>
      <View>
        <Text style={styles.studentCaption}>ESTUDIANTE</Text>
        <Text style={styles.studentName}>{alumnoNombre}</Text>
        <Text style={styles.studentGroup}>{grupoNombre}</Text>
      </View>
      <View style={styles.avatarCircle}>
        <MaterialIcons name="person" size={28} color={COLORS.surface} />
      </View>
    </View>
  );

  const renderEditor = () => (
    <View style={styles.editorCard}>
      <View style={styles.editorTitleRow}>
        <MaterialIcons name="edit-note" size={20} color="#0D6BC1" />
        <Text style={styles.editorTitle}>
          {notaEnEdicionId ? "Editar observación" : "Nueva Observación"}
        </Text>
      </View>

      {isDesktop ? (
        <View style={styles.categoriesRowDesktop}>
          {categorias.map((item) => (
            <Pressable
              key={item.key}
              style={({ pressed }) => [
                styles.categoryChip,
                categoria === item.key && styles.categoryChipActive,
                pressed && { opacity: 0.6 },
              ]}
              onPress={() => setCategoria(item.key)}
            >
              <Text
                style={[
                  styles.categoryChipText,
                  categoria === item.key && styles.categoryChipTextActive,
                ]}
              >
                {item.label}
              </Text>
            </Pressable>
          ))}
        </View>
      ) : null}

      <TextInput
        value={notaDraft}
        onChangeText={setNotaDraft}
        multiline
        placeholder="Escribe fortalezas, áreas de mejora..."
        placeholderTextColor="#A6B0BF"
        style={styles.editorInput}
        textAlignVertical="top"
        maxLength={maxCaracteres}
      />

      <View style={styles.editorFooter}>
        <Text style={styles.counterText}>
          {contador} / {maxCaracteres}
        </Text>

        <View style={styles.editorActionsRow}>
          {notaEnEdicionId ? (
            <Pressable
              style={({ pressed }) => [styles.cancelButton, pressed && { opacity: 0.6 }]}
              onPress={cancelarEdicion}
            >
              <Text style={styles.cancelButtonText}>Cancelar</Text>
            </Pressable>
          ) : null}

          <Pressable
            style={({ pressed }) => [
              styles.saveButton,
              guardando && styles.saveButtonDisabled,
              pressed && { opacity: 0.6 },
            ]}
            onPress={() => void guardarNota()}
            disabled={guardando}
          >
            <Text style={styles.saveButtonText}>{guardando ? "Guardando..." : "Guardar Nota"}</Text>
            <MaterialIcons name="arrow-forward" size={18} color={COLORS.surface} />
          </Pressable>
        </View>
      </View>
    </View>
  );

  const renderHistory = () => (
    <>
      <View style={styles.filtersRow}>
        {filtros.map((item) => (
          <Pressable
            key={item.key}
            style={({ pressed }) => [
              styles.filterChip,
              filtro === item.key && styles.filterChipActive,
              pressed && { opacity: 0.6 },
            ]}
            onPress={() => setFiltro(item.key)}
          >
            <Text
              style={[styles.filterChipText, filtro === item.key && styles.filterChipTextActive]}
            >
              {item.label}
            </Text>
          </Pressable>
        ))}
      </View>

      <View style={styles.historyHeadRow}>
        <Text style={styles.historyTitle}>HISTORIAL DE NOTAS</Text>
        <Text style={styles.historyCount}>{totalNotas} Notas guardadas</Text>
      </View>

      {notas.map((nota) => {
        const badge = tipoBadge[nota.tipo] || tipoBadge.general;

        return (
          <View key={String(nota.id)} style={styles.noteCard}>
            <View style={styles.noteHeaderRow}>
              <View style={styles.noteDateRow}>
                <MaterialIcons name="calendar-today" size={16} color="#2B84CE" />
                <Text style={styles.noteDateText}>{formatDate(nota.fechaDate)}</Text>
              </View>

              <View style={styles.noteActionsRow}>
                <Pressable
                  style={({ pressed }) => pressed && { opacity: 0.6 }}
                  onPress={() => iniciarEdicion(Number(nota.id))}
                >
                  <MaterialIcons name="edit" size={18} color="#8F98A6" />
                </Pressable>
                <Pressable
                  style={({ pressed }) => pressed && { opacity: 0.6 }}
                  onPress={() => handleEliminar(Number(nota.id))}
                >
                  <MaterialIcons name="delete" size={18} color="#A7AFBC" />
                </Pressable>
              </View>
            </View>

            <Text style={styles.noteText}>{nota.comentario}</Text>

            <View style={[styles.noteBadge, { backgroundColor: badge.bg }]}>
              <Text style={[styles.noteBadgeText, { color: badge.color }]}>{badge.label}</Text>
            </View>
          </View>
        );
      })}
    </>
  );

  const renderBottomTabs = () => (
    <View style={styles.bottomTabs}>
      <BottomTab icon="menu-book" label="LIBRARY" />
      <BottomTab icon="chat" label="NOTES" active />
      <BottomTab icon="logout" label="PLANNER" />
      <BottomTab icon="person" label="PROFILE" />
    </View>
  );

  const renderLoading = () => (
    <View style={styles.loadingWrap}>
      <View style={styles.skeletonHeaderLine} />
      <View style={styles.skeletonCard} />
      <View style={styles.skeletonLine} />
      <View style={styles.skeletonListItem} />
      <View style={styles.skeletonListItem} />
      <View style={styles.skeletonListItem} />
      <View style={styles.fabSkeleton}>
        <MaterialIcons name="add" size={26} color={COLORS.surface} />
      </View>
    </View>
  );

  const renderEmpty = () => (
    <View style={styles.centerStateWrap}>
      <View style={styles.emptyIllustration}>
        <MaterialIcons name="description" size={68} color="#96B9DD" />
      </View>
      <Text style={styles.centerStateTitle}>Aún no tienes notas para este alumno</Text>
      <Text style={styles.centerStateText}>
        Captura observaciones importantes, progresos y reflexiones personalizadas.
      </Text>
      <Pressable
        style={({ pressed }) => [styles.startButton, pressed && { opacity: 0.6 }]}
        onPress={() => setNotaDraft(" ")}
      >
        <MaterialIcons name="add" size={18} color={COLORS.surface} />
        <Text style={styles.startButtonText}>Empezar a escribir</Text>
      </Pressable>
      <View style={styles.ideaCard}>
        <MaterialIcons name="lightbulb" size={18} color="#0C8BB0" />
        <View style={{ flex: 1 }}>
          <Text style={styles.ideaTitle}>Idea rápida</Text>
          <Text style={styles.ideaText}>
            Puedes usar IA para organizar tus pensamientos iniciales.
          </Text>
        </View>
      </View>
    </View>
  );

  const renderError = () => (
    <View style={styles.centerStateWrap}>
      <View style={styles.errorCard}>
        <View style={styles.errorIconCircle}>
          <MaterialIcons name="warning" size={42} color={COLORS.error} />
        </View>
        <Text style={styles.centerStateTitle}>No se pudieron cargar las notas</Text>
        <Text style={styles.centerStateText}>
          Hubo un problema de conexión con el servidor. Verifica tu red e inténtalo de nuevo.
        </Text>
        <Pressable
          style={({ pressed }) => [styles.retryButton, pressed && { opacity: 0.6 }]}
          onPress={() => void recargar()}
        >
          <MaterialIcons name="refresh" size={18} color={COLORS.surface} />
          <Text style={styles.retryButtonText}>Reintentar</Text>
        </Pressable>
      </View>

      <Text style={styles.errorCode}>CÓDIGO DE ERROR: {errorCodigo}</Text>

      <View style={styles.infoBox}>
        <MaterialIcons name="lightbulb" size={18} color="#0B8196" />
        <Text style={styles.infoBoxText}>
          Tus borradores locales están a salvo. Podrás sincronizarlos en cuanto vuelva la conexión.
        </Text>
      </View>
    </View>
  );

  const renderMobileBody = () => {
    if (estado === "loading") return renderLoading();
    if (estado === "error") return renderError();

    return (
      <>
        {renderStudentBlock()}
        {renderEditor()}
        {estado === "empty" ? renderEmpty() : renderHistory()}
      </>
    );
  };

  const renderDesktop = () => (
    <View style={styles.desktopLayout}>
      <View style={styles.desktopSidebar}>
        <Text style={styles.desktopBrand}>The Atelier</Text>
        <Pressable style={({ pressed }) => [styles.desktopNewButton, pressed && { opacity: 0.6 }]}>
          <MaterialIcons name="add" size={18} color={COLORS.surface} />
          <Text style={styles.desktopNewButtonText}>New Entry</Text>
        </Pressable>
        <DesktopMenu label="Dashboard" icon="dashboard" />
        <DesktopMenu label="Lesson Plans" icon="menu-book" />
        <DesktopMenu label="Resource Library" icon="folder" />
        <DesktopMenu label="Student Notes" icon="feed" active />
        <DesktopMenu label="Analytics" icon="analytics" />
      </View>

      <View style={styles.desktopContent}>
        <View style={styles.desktopTopBar}>
          <Text style={styles.desktopTitle}>Student Notes</Text>
          <Text style={styles.desktopSubTitle}>Class 10-A</Text>
          <Text style={styles.desktopSubTitle}>Semester 2</Text>
          <Pressable
            style={({ pressed }) => [styles.desktopExportButton, pressed && { opacity: 0.6 }]}
          >
            <Text style={styles.desktopExportButtonText}>Export PDF</Text>
          </Pressable>
        </View>

        <Text style={styles.desktopStudentName}>{alumnoNombre}</Text>
        <Text style={styles.desktopStudentSub}>
          Detailed observation log and academic performance notes.
        </Text>

        <View style={styles.desktopColumns}>
          <View style={styles.desktopLeftCol}>
            {renderEditor()}

            <View style={styles.focusCard}>
              <Text style={styles.focusTitle}>FOCUS AREAS</Text>
              <View style={styles.focusRow}>
                <Text style={styles.focusText}>Critical Thinking</Text>
                <Text style={styles.focusStrong}>High</Text>
              </View>
              <View style={styles.focusRow}>
                <Text style={styles.focusText}>Peer Collaboration</Text>
                <Text style={styles.focusWarning}>Needs Review</Text>
              </View>
            </View>
          </View>

          <View style={styles.desktopRightCol}>
            <View style={styles.desktopLogHeader}>
              <Text style={styles.desktopLogTitle}>Activity Log</Text>
              <Text style={styles.desktopLogMeta}>Newest first</Text>
            </View>

            {estado === "loading" ? renderLoading() : null}
            {estado === "error" ? renderError() : null}
            {estado === "empty" ? renderEmpty() : null}
            {estado === "success" ? renderHistory() : null}
          </View>
        </View>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <StatusBar backgroundColor={COLORS.background} barStyle="dark-content" />
      <SafeAreaView style={styles.safeArea}>
        {isDesktop ? (
          renderDesktop()
        ) : (
          <>
            {renderMobileHeader()}
            <WebScrollView style={styles.content}>{renderMobileBody()}</WebScrollView>
            {renderBottomTabs()}
          </>
        )}

        {syncMensaje.length > 0 && estado !== "error" ? (
          <View style={styles.syncToast}>
            <MaterialIcons name="cloud-off" size={16} color="#0B8196" />
            <Text style={styles.syncToastText}>{syncMensaje}</Text>
          </View>
        ) : null}
      </SafeAreaView>
    </View>
  );
};

const BottomTab: React.FC<{ icon: string; label: string; active?: boolean }> = ({
  icon,
  label,
  active,
}) => (
  <View style={styles.bottomTabItem}>
    <View style={[styles.bottomTabIconWrap, active && styles.bottomTabIconWrapActive]}>
      <MaterialIcons
        name={icon as never}
        size={19}
        color={active ? COLORS.primaryMuted : "#9AA8BC"}
      />
    </View>
    <Text style={[styles.bottomTabLabel, active && styles.bottomTabLabelActive]}>{label}</Text>
  </View>
);

const DesktopMenu: React.FC<{ label: string; icon: string; active?: boolean }> = ({
  label,
  icon,
  active,
}) => (
  <Pressable
    style={({ pressed }) => [
      styles.desktopMenuItem,
      active && styles.desktopMenuItemActive,
      pressed && { opacity: 0.6 },
    ]}
  >
    <MaterialIcons
      name={icon as never}
      size={18}
      color={active ? COLORS.primaryDark : COLORS.textSecondary}
    />
    <Text style={[styles.desktopMenuText, active && styles.desktopMenuTextActive]}>{label}</Text>
  </Pressable>
);

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  safeArea: { flex: 1 },
  content: { paddingHorizontal: 18 },
  header: {
    height: 56,
    backgroundColor: COLORS.surface,
    borderBottomWidth: 1,
    borderBottomColor: "#E3E9F3",
    paddingHorizontal: 8,
    flexDirection: "row",
    alignItems: "center",
  },
  headerIconButton: { width: 40, alignItems: "center", justifyContent: "center" },
  headerTitle: {
    flex: 1,
    textAlign: "left",
    fontSize: 24,
    fontWeight: "700",
    color: "#222F43",
  },
  studentRow: {
    marginTop: 14,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  studentCaption: {
    color: "#5F708A",
    fontSize: 22,
    letterSpacing: 1,
    fontWeight: "700",
  },
  studentName: { fontSize: 32, fontWeight: "800", color: "#172538", marginTop: 6 },
  studentGroup: { fontSize: 13, color: "#5A6B84", marginTop: 4 },
  avatarCircle: {
    width: 54,
    height: 54,
    borderRadius: 27,
    backgroundColor: COLORS.primary,
    alignItems: "center",
    justifyContent: "center",
  },
  editorCard: {
    marginTop: 18,
    backgroundColor: COLORS.surface,
    borderRadius: 24,
    padding: 16,
    borderWidth: 1,
    borderColor: "#DDE7F6",
  },
  editorTitleRow: { flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 12 },
  editorTitle: { fontSize: 22, fontWeight: "700", color: "#26374E" },
  categoriesRowDesktop: { flexDirection: "row", gap: 8, marginBottom: 12 },
  categoryChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 14,
    backgroundColor: COLORS.skeleton,
  },
  categoryChipActive: { backgroundColor: "#136FC4" },
  categoryChipText: { color: "#5B6B81", fontSize: 12, fontWeight: "700" },
  categoryChipTextActive: { color: COLORS.surface },
  editorInput: {
    minHeight: 130,
    borderRadius: 16,
    backgroundColor: COLORS.skeleton,
    paddingHorizontal: 14,
    paddingVertical: 12,
    color: "#2B3A52",
    fontSize: 20,
  },
  editorFooter: {
    marginTop: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  counterText: { color: "#6D7D93", fontSize: 22, fontWeight: "700" },
  editorActionsRow: { flexDirection: "row", alignItems: "center", gap: 8 },
  cancelButton: {
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 10,
    backgroundColor: "#EBEFF6",
  },
  cancelButtonText: { color: "#526078", fontWeight: "700" },
  saveButton: {
    backgroundColor: "#096FC7",
    borderRadius: 22,
    minHeight: 46,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 18,
    justifyContent: "center",
  },
  saveButtonDisabled: { opacity: 0.65 },
  saveButtonText: { color: COLORS.surface, fontWeight: "700", fontSize: 22 },
  filtersRow: {
    marginTop: 16,
    flexDirection: "row",
    gap: 8,
  },
  filterChip: {
    borderRadius: 999,
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: "#E3E8EF",
  },
  filterChipActive: { backgroundColor: COLORS.primaryDark },
  filterChipText: { color: "#5F6D80", fontSize: 16, fontWeight: "700" },
  filterChipTextActive: { color: COLORS.surface },
  historyHeadRow: {
    marginTop: 16,
    marginBottom: 10,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  historyTitle: { fontSize: 12, letterSpacing: 1.2, color: "#5E6D82", fontWeight: "700" },
  historyCount: { color: "#166BBF", fontWeight: "700", fontSize: 12 },
  noteCard: {
    borderRadius: 18,
    borderWidth: 1,
    borderColor: "#DEE7F4",
    backgroundColor: COLORS.surface,
    padding: 14,
    marginBottom: 12,
  },
  noteHeaderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  noteDateRow: { flexDirection: "row", alignItems: "center", gap: 6 },
  noteDateText: { fontSize: 12, color: "#56657B", fontWeight: "700" },
  noteActionsRow: { flexDirection: "row", alignItems: "center", gap: 10 },
  noteText: { marginTop: 10, color: "#303E54", fontSize: 16, lineHeight: 24 },
  noteBadge: {
    marginTop: 12,
    alignSelf: "flex-start",
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  noteBadgeText: { fontSize: 11, fontWeight: "700" },
  bottomTabs: {
    height: 80,
    backgroundColor: COLORS.surface,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-around",
  },
  bottomTabItem: { alignItems: "center", justifyContent: "center" },
  bottomTabIconWrap: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: "center",
    justifyContent: "center",
  },
  bottomTabIconWrapActive: { backgroundColor: "#E9F1FF" },
  bottomTabLabel: { marginTop: 4, fontSize: 10, color: "#9BA8BA", fontWeight: "700" },
  bottomTabLabelActive: { color: COLORS.primaryMuted },
  loadingWrap: { marginTop: 16 },
  skeletonHeaderLine: {
    height: 16,
    backgroundColor: "#E3EAF5",
    borderRadius: 8,
    width: "38%",
    marginBottom: 12,
  },
  skeletonCard: {
    height: 180,
    backgroundColor: "#E9EEF7",
    borderRadius: 18,
  },
  skeletonLine: {
    marginTop: 14,
    height: 14,
    borderRadius: 7,
    width: "45%",
    backgroundColor: "#E3EAF5",
  },
  skeletonListItem: {
    marginTop: 12,
    height: 72,
    borderRadius: 14,
    backgroundColor: "#E9EEF7",
  },
  fabSkeleton: {
    alignSelf: "flex-end",
    marginTop: 14,
    width: 54,
    height: 54,
    borderRadius: 27,
    backgroundColor: COLORS.primaryDark,
    alignItems: "center",
    justifyContent: "center",
    ...Platform.select({
      web: { boxShadow: "0px 10px 18px rgba(16, 86, 151, 0.35)" },
      default: { elevation: 6 },
    }),
  },
  centerStateWrap: { marginTop: 18, alignItems: "center", paddingBottom: 24 },
  emptyIllustration: {
    width: 150,
    height: 150,
    borderRadius: 75,
    backgroundColor: "#E7F0FC",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
  },
  centerStateTitle: {
    textAlign: "center",
    fontSize: 34,
    fontWeight: "800",
    color: "#27364D",
    lineHeight: 44,
    maxWidth: 320,
  },
  centerStateText: {
    marginTop: 10,
    textAlign: "center",
    fontSize: 16,
    color: "#6A7B93",
    lineHeight: 23,
    maxWidth: 320,
  },
  startButton: {
    marginTop: 16,
    height: 52,
    width: "100%",
    borderRadius: 12,
    backgroundColor: COLORS.primaryDark,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: 8,
  },
  startButtonText: { color: COLORS.surface, fontSize: 24, fontWeight: "700" },
  ideaCard: {
    marginTop: 16,
    width: "100%",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.borderLight,
    backgroundColor: COLORS.backgroundSoft,
    padding: 12,
    flexDirection: "row",
    gap: 8,
    alignItems: "flex-start",
  },
  ideaTitle: { color: COLORS.textDark, fontWeight: "700", fontSize: 14 },
  ideaText: { color: "#718199", marginTop: 2, fontSize: 13 },
  errorCard: {
    width: "100%",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#E7E1E2",
    backgroundColor: COLORS.surface,
    padding: 18,
    alignItems: "center",
  },
  errorIconCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: "#FDE5E5",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
  },
  retryButton: {
    marginTop: 14,
    width: "100%",
    height: 50,
    borderRadius: 12,
    backgroundColor: COLORS.primaryDark,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: 8,
  },
  retryButtonText: { color: COLORS.surface, fontWeight: "700", fontSize: 18 },
  errorCode: { marginTop: 18, fontSize: 12, letterSpacing: 1, color: "#7A8799", fontWeight: "700" },
  infoBox: {
    marginTop: 16,
    width: "100%",
    borderRadius: 10,
    backgroundColor: "#CEF1FA",
    padding: 12,
    flexDirection: "row",
    gap: 8,
  },
  infoBoxText: { flex: 1, color: "#1D6D7F", fontSize: 12, lineHeight: 18 },
  syncToast: {
    position: "absolute",
    left: 16,
    right: 16,
    bottom: 94,
    borderRadius: 12,
    backgroundColor: "#D2F0F7",
    borderWidth: 1,
    borderColor: "#ABDDE8",
    flexDirection: "row",
    gap: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    alignItems: "center",
  },
  syncToastText: { flex: 1, color: "#206F7E", fontSize: 12, fontWeight: "600" },

  desktopLayout: { flex: 1, flexDirection: "row", backgroundColor: "#F3F6FB" },
  desktopSidebar: {
    width: 220,
    backgroundColor: "#EFF3F9",
    borderRightWidth: 1,
    borderRightColor: COLORS.borderLight,
    padding: 16,
  },
  desktopBrand: { fontSize: 20, fontWeight: "800", color: "#25374E", marginBottom: 18 },
  desktopNewButton: {
    backgroundColor: COLORS.primaryDark,
    borderRadius: 10,
    paddingVertical: 10,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: 8,
    marginBottom: 18,
  },
  desktopNewButtonText: { color: COLORS.surface, fontWeight: "700" },
  desktopMenuItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    borderRadius: 8,
    paddingVertical: 9,
    paddingHorizontal: 10,
    marginBottom: 4,
  },
  desktopMenuItemActive: { backgroundColor: "#E5EFFC" },
  desktopMenuText: { color: COLORS.textSecondary, fontWeight: "600" },
  desktopMenuTextActive: { color: COLORS.primaryDark },
  desktopContent: { flex: 1, paddingHorizontal: 18, paddingTop: 12 },
  desktopTopBar: {
    height: 52,
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.borderLight,
    paddingHorizontal: 14,
    alignItems: "center",
    flexDirection: "row",
    gap: 14,
  },
  desktopTitle: { color: COLORS.primaryDark, fontSize: 16, fontWeight: "700" },
  desktopSubTitle: { color: "#677A93", fontSize: 13, fontWeight: "600" },
  desktopExportButton: {
    marginLeft: "auto",
    backgroundColor: COLORS.primaryDark,
    borderRadius: 999,
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  desktopExportButtonText: { color: COLORS.surface, fontWeight: "700", fontSize: 12 },
  desktopStudentName: { marginTop: 16, fontSize: 44, fontWeight: "800", color: "#172538" },
  desktopStudentSub: { marginTop: 6, color: "#647790", fontSize: 14 },
  desktopColumns: { flex: 1, marginTop: 14, flexDirection: "row", gap: 16 },
  desktopLeftCol: { width: 360 },
  desktopRightCol: { flex: 1 },
  focusCard: {
    marginTop: 12,
    backgroundColor: COLORS.surface,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#DCE6F2",
    padding: 14,
  },
  focusTitle: { color: "#5F708A", letterSpacing: 1, fontSize: 11, fontWeight: "700" },
  focusRow: {
    marginTop: 10,
    flexDirection: "row",
    justifyContent: "space-between",
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.skeleton,
  },
  focusText: { color: COLORS.textDark, fontSize: 13 },
  focusStrong: { color: "#0F7ABF", fontSize: 12, fontWeight: "700" },
  focusWarning: { color: "#A7652B", fontSize: 12, fontWeight: "700" },
  desktopLogHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  desktopLogTitle: { fontSize: 30, fontWeight: "700", color: "#2A3950" },
  desktopLogMeta: { color: "#7D8CA2", fontSize: 12, fontWeight: "700", textTransform: "uppercase" },
});

export default NotasAlumnoScreen;
