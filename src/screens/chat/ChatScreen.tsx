import { useTheme } from "../../context/ThemeContext";
import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  TextInput,
  RefreshControl,
  Modal,
  Platform,
  ScrollView,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { useChatViewModel, FiltroChat } from "../../hooks/useChatViewModel";
import { Conversacion } from "../../../types";

// ─── Design Tokens ───

// Helper to map dynamic theme colors to the legacy DT token schema
const getThemeTokens = (colors: any) => ({
  ...colors,
  primaryFixed: colors.primaryTint,
  primaryFixedDim: colors.primaryLight || colors.primaryTint,
  onPrimary: colors.textOnPrimary,
  onPrimaryContainer: colors.primary,
  secondary: colors.success,
  secondaryContainer: colors.successTint,
  onSecondaryContainer: colors.success,
  tertiary: colors.warning,
  tertiaryContainer: colors.warningTint,
  tertiaryFixed: colors.warningTint,
  onTertiaryContainer: colors.warning,
  surface: colors.background,
  surfaceLowest: colors.surfaceContainerLowest,
  surfaceLow: colors.surfaceContainerLow,
  surfaceContainer: colors.surfaceContainer,
  surfaceHigh: colors.surfaceContainerHigh,
  surfaceHighest: colors.surfaceContainerHighest,
  onSurface: colors.onSurface,
  onSurfaceVariant: colors.onSurfaceVariant,
  outline: colors.textMuted,
  outlineVariant: colors.outlineVariant,
  errorIcon: colors.error,
  text: colors.text,
  textSecondary: colors.textSecondary,
  textMuted: colors.textMuted,
});


const AVATAR_COLORS: Record<string, string> = {
  MH: "#4A90D9",
  JR: "#E67E22",
  LP: "#27AE60",
  CF: "#8E44AD",
  SR: "#2ECC71",
  AM: "#3498DB",
};

const getInitials = (nombre: string): string => {
  const parts = nombre.split(" ");
  if (parts.length >= 2) {
    return (parts[0][0] + parts[1][0]).toUpperCase();
  }
  return nombre.substring(0, 2).toUpperCase();
};

const getAvatarColor = (nombre: string, colorProp?: string): string => {
  if (colorProp) return colorProp;
  const initials = getInitials(nombre);
  return AVATAR_COLORS[initials] || "#4A90D9";
};

const FILTROS: { key: FiltroChat; label: string }[] = [
  { key: "todos", label: "Todos" },
  { key: "no_leidos", label: "No leídos" },
  { key: "con_archivos", label: "Con archivos" },
];



// ─── Conversation Item ───
const ConversacionItem: React.FC<{
  item: Conversacion;
  onPress: (c: Conversacion) => void;
  onLongPress: (c: Conversacion) => void;
  formatTimestamp: (fecha: string | undefined) => string;
}> = ({ item, onPress, onLongPress, formatTimestamp }) => {
  const { colors, isDark } = useTheme();
  const DT = getThemeTokens(colors);
  const styles = getStyles(DT, isDark);
  const initials = getInitials(item.contactoNombre);
  const color = getAvatarColor(item.contactoNombre, item.contactoColor);
  const hasUnread = item.mensajesNoLeidos > 0;
  const isFile = item.ultimoMensajeTipo === "archivo" || item.ultimoMensajeTipo === "planeacion";

  return (
    <TouchableOpacity
      style={[styles.convItem, hasUnread && styles.convItemUnread]}
      onPress={() => onPress(item)}
      onLongPress={() => onLongPress(item)}
      activeOpacity={0.7}
    >
      <View style={styles.convAvatarWrap}>
        <View style={[styles.convAvatar, { backgroundColor: color }]}>
          <Text style={styles.convAvatarText}>{initials}</Text>
        </View>
        {item.contactoEnLinea && <View style={styles.onlineDot} />}
      </View>

      <View style={styles.convInfo}>
        <View style={styles.convTopRow}>
          <Text style={[styles.convName, hasUnread && styles.convNameBold]} numberOfLines={1}>
            {item.contactoNombre}
          </Text>
          <Text style={styles.convTimestamp}>{formatTimestamp(item.fechaUltimoMensaje)}</Text>
        </View>
        <View style={styles.convBottomRow}>
          <View style={styles.convMsgRow}>
            {isFile && (
              <MaterialIcons
                name="attach-file"
                size={12}
                color={DT.textMuted}
                style={{ marginRight: 4 }}
              />
            )}
            <Text style={styles.convLastMsg} numberOfLines={1}>
              {item.ultimoMensaje || "Sin mensajes aún"}
            </Text>
          </View>
          {hasUnread && (
            <View style={styles.unreadBadge}>
              <Text style={styles.unreadBadgeText}>{item.mensajesNoLeidos}</Text>
            </View>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );
};

// ─── Empty State ───
const EmptyState: React.FC<{ searchActive: boolean }> = ({ searchActive }) => {
  const { colors, isDark } = useTheme();
  const DT = getThemeTokens(colors);
  const styles = getStyles(DT, isDark);
  return (
  <View style={styles.emptyContainer}>
    <View style={styles.emptyIconCircle}>
      <MaterialIcons
        name={searchActive ? "search-off" : "chat-bubble-outline"}
        size={48}
        color="#c0c7d4"
      />
    </View>
    <Text style={styles.emptyTitle}>
      {searchActive ? "Sin resultados" : "Aún no tienes conversaciones"}
    </Text>
    <Text style={styles.emptySubtitle}>
      {searchActive
        ? "Intenta con otro nombre"
        : "Envía un mensaje a uno de tus contactos para comenzar a colaborar"}
    </Text>
  </View>
  );
};

// ─── Delete Confirmation Modal ───
const DeleteModal: React.FC<{
  visible: boolean;
  nombre: string;
  onConfirm: () => void;
  onCancel: () => void;
}> = ({ visible, nombre, onConfirm, onCancel }) => {
  const { colors, isDark } = useTheme();
  const DT = getThemeTokens(colors);
  const styles = getStyles(DT, isDark);
  return (
  <Modal visible={visible} transparent animationType="fade">
    <View style={styles.overlay}>
      <View style={styles.deleteModal}>
        <View style={styles.deleteIconCircle}>
          <MaterialIcons name="delete-outline" size={28} color={DT.error} />
        </View>
        <Text style={styles.deleteTitle}>¿Eliminar conversación?</Text>
        <Text style={styles.deleteSubtitle}>
          Se eliminará el historial de mensajes con {nombre}. Esta acción no se puede deshacer.
        </Text>
        <TouchableOpacity style={styles.deleteBtnPrimary} onPress={onConfirm} activeOpacity={0.8}>
          <MaterialIcons name="delete" size={18} color="#FFFFFF" />
          <Text style={styles.deleteBtnPrimaryText}>Eliminar</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.deleteBtnSecondary} onPress={onCancel} activeOpacity={0.7}>
          <Text style={styles.deleteBtnSecondaryText}>Cancelar</Text>
        </TouchableOpacity>
      </View>
    </View>
  </Modal>
  );
};

// ─── Main Screen ───
const ChatScreen: React.FC = () => {
  const { colors, isDark } = useTheme();
  const DT = getThemeTokens(colors);
  const styles = getStyles(DT, isDark);
  const vm = useChatViewModel();

  const renderConversacion = ({ item }: { item: Conversacion }) => (
    <ConversacionItem
      item={item}
      onPress={vm.onConversacionPress}
      onLongPress={vm.onDeleteRequest}
      formatTimestamp={vm.formatTimestamp}
    />
  );

  return (
    <SafeAreaView style={styles.safeArea} edges={["top"]}>
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <View style={{ width: 40 }} />
          <Text style={styles.headerTitle}>Mensajes</Text>
          <TouchableOpacity style={styles.headerBtn} onPress={vm.onNuevoChat} activeOpacity={0.7}>
            <MaterialIcons name="edit" size={22} color={DT.primary} />
          </TouchableOpacity>
        </View>

        {/* Search */}
        <View style={styles.searchWrap}>
          <MaterialIcons name="search" size={20} color={DT.textMuted} style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Buscar conversación..."
            placeholderTextColor={DT.textMuted}
            value={vm.searchQuery}
            onChangeText={vm.setSearchQuery}
          />
        </View>

        {/* Filters */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filtersRow}
        >
          {FILTROS.map((f) => (
            <TouchableOpacity
              key={f.key}
              style={[styles.chip, vm.filtroActivo === f.key && styles.chipActive]}
              onPress={() => vm.setFiltroActivo(f.key)}
              activeOpacity={0.7}
            >
              <Text style={[styles.chipText, vm.filtroActivo === f.key && styles.chipTextActive]}>
                {f.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Conversations List */}
        <FlatList
          data={vm.filteredConversaciones}
          keyExtractor={(item) => String(item.id)}
          renderItem={renderConversacion}
          contentContainerStyle={styles.listContent}
          ListEmptyComponent={<EmptyState searchActive={vm.searchQuery.length > 0} />}
          refreshControl={
            <RefreshControl
              refreshing={vm.isLoading}
              onRefresh={vm.onRefresh}
              colors={[DT.primary]}
              tintColor={DT.primary}
            />
          }
        />

        {/* Delete Modal */}
        <DeleteModal
          visible={vm.showDeleteModal}
          nombre={vm.conversacionToDelete?.contactoNombre ?? ""}
          onConfirm={vm.onConfirmDelete}
          onCancel={vm.onCancelDelete}
        />
      </View>
    </SafeAreaView>
  );
};

export default ChatScreen;

// ─── Styles ───
const getStyles = (DT: any, isDark: boolean) => StyleSheet.create({
  cardShadow: Platform.select({
    web: { boxShadow: isDark ? "0px 2px 8px rgba(0,0,0,0.2)" : "0px 2px 8px rgba(0,72,132,0.04)" } as any,
    default: {
      shadowColor: isDark ? "#000000" : "#004884",
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: isDark ? 0.2 : 0.04,
      shadowRadius: 8,
      elevation: 1,
    },
  }),
  safeArea: {
    flex: 1,
    backgroundColor: DT.surface,
  },
  container: {
    flex: 1,
    backgroundColor: DT.background,
  },
  // Header
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: DT.surface,
    borderBottomWidth: 1,
    borderBottomColor: DT.border,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: DT.text,
    flex: 1,
    textAlign: "center",
  },
  headerBtn: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: DT.primaryTint,
    alignItems: "center",
    justifyContent: "center",
  },
  // Search
  searchWrap: {
    marginHorizontal: 16,
    marginTop: 12,
    marginBottom: 8,
    position: "relative",
  },
  searchIcon: {
    position: "absolute",
    left: 12,
    top: 12,
    zIndex: 1,
  },
  searchInput: {
    backgroundColor: DT.surfaceContainerLow,
    borderRadius: 14,
    height: 44,
    paddingLeft: 40,
    paddingRight: 16,
    fontSize: 15,
    color: DT.text,
  },
  // Filters
  filtersRow: {
    paddingHorizontal: 16,
    paddingBottom: 8,
    gap: 8,
    flexDirection: "row",
  },
  chip: {
    backgroundColor: DT.surfaceContainer,
    borderRadius: 999,
    paddingVertical: 6,
    paddingHorizontal: 14,
    height: 32,
    justifyContent: "center",
  },
  chipActive: {
    backgroundColor: DT.primary,
  },
  chipText: {
    fontSize: 13,
    fontWeight: "600",
    color: DT.textSecondary,
  },
  chipTextActive: {
    color: "#FFFFFF",
    fontWeight: "700",
  },
  // List
  listContent: {
    paddingBottom: 100,
  },
  // Conversation Item
  convItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 14,
    paddingHorizontal: 16,
    backgroundColor: DT.surface,
    borderBottomWidth: 1,
    borderBottomColor: DT.border,
  },
  convItemUnread: {
    backgroundColor: "rgba(234, 244, 255, 0.3)",
  },
  convAvatarWrap: {
    position: "relative",
    marginRight: 12,
  },
  convAvatar: {
    width: 48,
    height: 48,
    borderRadius: 999,
    alignItems: "center",
    justifyContent: "center",
  },
  convAvatarText: {
    fontSize: 16,
    fontWeight: "700",
    color: "#FFFFFF",
  },
  onlineDot: {
    width: 10,
    height: 10,
    borderRadius: 999,
    backgroundColor: DT.success,
    borderWidth: 2,
    borderColor: DT.surface,
    position: "absolute",
    bottom: 0,
    right: 0,
  },
  convInfo: {
    flex: 1,
  },
  convTopRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 4,
  },
  convName: {
    fontSize: 15,
    fontWeight: "600",
    color: DT.text,
    flex: 1,
    marginRight: 8,
  },
  convNameBold: {
    fontWeight: "700",
  },
  convTimestamp: {
    fontSize: 11,
    color: DT.textMuted,
  },
  convBottomRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  convMsgRow: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
    marginRight: 8,
  },
  convLastMsg: {
    fontSize: 13,
    color: DT.textSecondary,
    flex: 1,
  },
  unreadBadge: {
    width: 20,
    height: 20,
    borderRadius: 999,
    backgroundColor: DT.primary,
    alignItems: "center",
    justifyContent: "center",
  },
  unreadBadgeText: {
    fontSize: 11,
    fontWeight: "700",
    color: "#FFFFFF",
  },
  // Empty State
  emptyContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingTop: 80,
    paddingHorizontal: 40,
  },
  emptyIconCircle: {
    width: 96,
    height: 96,
    borderRadius: 999,
    backgroundColor: DT.surfaceContainer,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: DT.text,
    textAlign: "center",
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 15,
    color: DT.textSecondary,
    textAlign: "center",
    maxWidth: 280,
  },
  // Delete Modal
  overlay: {
    flex: 1,
    backgroundColor: "rgba(19, 30, 49, 0.42)",
    justifyContent: "center",
    alignItems: "center",
  },
  deleteModal: {
    backgroundColor: DT.surface,
    borderRadius: 20,
    maxWidth: 320,
    width: "85%",
    padding: 24,
    alignItems: "center",
  },
  deleteIconCircle: {
    width: 56,
    height: 56,
    borderRadius: 999,
    backgroundColor: DT.errorTint,
    alignItems: "center",
    justifyContent: "center",
  },
  deleteTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: DT.text,
    textAlign: "center",
    marginTop: 16,
  },
  deleteSubtitle: {
    fontSize: 14,
    color: DT.textSecondary,
    textAlign: "center",
    marginTop: 8,
  },
  deleteBtnPrimary: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: DT.error,
    height: 44,
    borderRadius: 12,
    width: "100%",
    marginTop: 20,
    gap: 8,
  },
  deleteBtnPrimaryText: {
    fontSize: 15,
    fontWeight: "700",
    color: "#FFFFFF",
  },
  deleteBtnSecondary: {
    height: 40,
    justifyContent: "center",
    alignItems: "center",
    width: "100%",
    marginTop: 10,
  },
  deleteBtnSecondaryText: {
    fontSize: 15,
    fontWeight: "600",
    color: DT.textSecondary,
  },
});
