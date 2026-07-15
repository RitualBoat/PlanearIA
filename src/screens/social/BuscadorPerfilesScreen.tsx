import { useTheme } from "../../hooks/useTheme";
import React, { useState } from "react";
import {
  Pressable,
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  Modal,
  Platform,
  StatusBar,
  useWindowDimensions,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { LinearGradient } from "expo-linear-gradient";
import { useNavigation } from "@react-navigation/native";
import {
  useBuscadorPerfilesViewModel,
  DocentePerfil,
} from "../../hooks/useBuscadorPerfilesViewModel";

const NIVELES = ["Todos", "Preescolar", "Primaria", "Secundaria", "Preparatoria", "Universidad"];

// ─── Design Tokens (Scholarly Atelier) ───

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

// ─── Helpers ───

const getInitials = (n: string, a: string) => `${n.charAt(0)}${a.charAt(0)}`.toUpperCase();

// ─── Avatar ───

const Avatar: React.FC<{
  nombre: string;
  apellidos: string;
  color: string;
  size?: number;
}> = ({ nombre, apellidos, color, size = 48 }) => {
  const { colors, isDark } = useTheme();
  const DT = getThemeTokens(colors);
  const styles = getStyles(DT, isDark);
  return (
    <View
      style={[
        styles.avatar,
        {
          width: size,
          height: size,
          borderRadius: size * 0.3,
          backgroundColor: color,
        },
      ]}
    >
      <Text style={[styles.avatarText, { fontSize: size * 0.36 }]}>
        {getInitials(nombre, apellidos)}
      </Text>
    </View>
  );
};

// ─── Suggested Card ───

const SuggestedCard: React.FC<{
  docente: DocentePerfil;
  onConectar: (d: DocentePerfil) => void;
}> = ({ docente, onConectar }) => {
  const { colors, isDark } = useTheme();
  const DT = getThemeTokens(colors);
  const styles = getStyles(DT, isDark);
  return (
    <View style={[styles.card, styles.cardShadow]}>
      <View style={styles.cardRow}>
        <Avatar
          nombre={docente.nombre}
          apellidos={docente.apellidos}
          color={docente.avatarColor}
          size={48}
        />
        <View style={styles.cardInfo}>
          <Text style={styles.cardName}>
            {docente.nombre} {docente.apellidos}
          </Text>
          <Text style={styles.cardSchool}>{docente.escuela}</Text>
          {docente.enComun > 0 && (
            <View style={styles.commonRow}>
              <MaterialIcons name="people" size={12} color={DT.primaryContainer} />
              <Text style={styles.commonText}>{docente.enComun} en común</Text>
            </View>
          )}
        </View>
        <Pressable
          style={({ pressed }) => [styles.connectBtnSmall, pressed && { opacity: 0.8 }]}
          onPress={() => onConectar(docente)}
        >
          <Text style={styles.connectBtnSmallText}>Conectar</Text>
        </Pressable>
      </View>
    </View>
  );
};

// ─── Result Card ───

const ResultCard: React.FC<{
  docente: DocentePerfil;
  onConectar: (d: DocentePerfil) => void;
}> = ({ docente, onConectar }) => {
  const { colors, isDark } = useTheme();
  const DT = getThemeTokens(colors);
  const styles = getStyles(DT, isDark);
  const renderButton = () => {
    switch (docente.estado) {
      case "solicitud_enviada":
        return (
          <View style={[styles.statusBtn, { backgroundColor: DT.warningTint }]}>
            <MaterialIcons name="schedule" size={16} color={DT.warning} />
            <Text style={[styles.statusBtnText, { color: DT.warning }]}>Solicitud enviada</Text>
          </View>
        );
      case "conectado":
        return (
          <View style={styles.connectedRow}>
            <View style={[styles.statusBtn, { backgroundColor: DT.successTint }]}>
              <MaterialIcons name="check-circle" size={16} color={DT.success} />
              <Text style={[styles.statusBtnText, { color: DT.success }]}>Conectado</Text>
            </View>
            <Pressable style={({ pressed }) => [styles.msgLink, pressed && { opacity: 0.7 }]}>
              <Text style={styles.msgLinkText}>Enviar mensaje</Text>
            </Pressable>
          </View>
        );
      default:
        return (
          <Pressable
            style={({ pressed }) => [styles.connectBtnFull, pressed && { opacity: 0.85 }]}
            onPress={() => onConectar(docente)}
          >
            <LinearGradient
              colors={[DT.primaryContainer, "#005da8"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.connectGradient}
            >
              <MaterialIcons name="person-add" size={16} color="#FFF" />
              <Text style={styles.connectBtnFullText}>Conectar</Text>
            </LinearGradient>
          </Pressable>
        );
    }
  };

  return (
    <View style={[styles.resultCard, styles.cardShadow]}>
      <View style={styles.resultHeader}>
        <Avatar
          nombre={docente.nombre}
          apellidos={docente.apellidos}
          color={docente.avatarColor}
          size={52}
        />
        <View style={styles.cardInfo}>
          <Text style={styles.resultName}>
            {docente.nombre} {docente.apellidos}
          </Text>
          <Text style={styles.cardSchool}>{docente.escuela}</Text>
          <Text style={styles.resultMeta}>
            {docente.materia} · {docente.nivel}
          </Text>
        </View>
      </View>
      {docente.enComun > 0 && (
        <View style={styles.commonRow}>
          <MaterialIcons name="people" size={14} color={DT.primaryContainer} />
          <Text style={styles.commonText}>{docente.enComun} contactos en común</Text>
        </View>
      )}
      {renderButton()}
    </View>
  );
};

// ─── Send Request Modal ───

const SolicitudModal: React.FC<{
  visible: boolean;
  docente: DocentePerfil | null;
  onEnviar: (msg: string) => void;
  onCerrar: () => void;
}> = ({ visible, docente, onEnviar, onCerrar }) => {
  const { colors, isDark } = useTheme();
  const DT = getThemeTokens(colors);
  const styles = getStyles(DT, isDark);
  const [mensaje, setMensaje] = useState("");

  if (!docente) return null;

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onCerrar}>
      <Pressable style={styles.modalBackdrop} onPress={onCerrar}>
        <Pressable style={styles.modalSheet} onPress={() => {}}>
          <View style={styles.modalHandle} />
          <View style={styles.modalHeader}>
            <Avatar
              nombre={docente.nombre}
              apellidos={docente.apellidos}
              color={docente.avatarColor}
              size={48}
            />
            <View style={styles.cardInfo}>
              <Text style={styles.modalName}>
                {docente.nombre} {docente.apellidos}
              </Text>
              <Text style={styles.cardSchool}>
                {docente.escuela} · {docente.materia}
              </Text>
            </View>
          </View>
          <Text style={styles.modalLabel}>Mensaje Personal (Opcional)</Text>
          <View style={styles.modalInputWrap}>
            <TextInput
              style={styles.modalInput}
              multiline
              maxLength={200}
              value={mensaje}
              onChangeText={setMensaje}
              placeholder="¡Hola! Me gustaría conectar contigo para..."
              placeholderTextColor={DT.textMuted}
            />
            <Text style={styles.modalCounter}>{mensaje.length}/200</Text>
          </View>
          <Pressable
            style={({ pressed }) => [styles.modalSendBtn, pressed && { opacity: 0.85 }]}
            onPress={() => {
              onEnviar(mensaje);
              setMensaje("");
            }}
          >
            <LinearGradient
              colors={[DT.primaryContainer, "#005da8"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.modalSendGradient}
            >
              <MaterialIcons name="send" size={18} color="#FFF" />
              <Text style={styles.modalSendText}>Enviar solicitud</Text>
            </LinearGradient>
          </Pressable>
          <Pressable
            style={({ pressed }) => [styles.modalCancelBtn, pressed && { opacity: 0.7 }]}
            onPress={() => {
              onCerrar();
              setMensaje("");
            }}
          >
            <Text style={styles.modalCancelText}>Cancelar</Text>
          </Pressable>
        </Pressable>
      </Pressable>
    </Modal>
  );
};

// ─── Invite Link Modal ───

const InviteModal: React.FC<{
  visible: boolean;
  inviteUrl: string;
  onCopiar: () => void;
  onCompartir: () => void;
  onCerrar: () => void;
}> = ({ visible, inviteUrl, onCopiar, onCompartir, onCerrar }) => {
  const { colors, isDark } = useTheme();
  const DT = getThemeTokens(colors);
  const styles = getStyles(DT, isDark);
  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onCerrar}>
      <Pressable style={styles.modalBackdrop} onPress={onCerrar}>
        <Pressable style={styles.modalSheet} onPress={() => {}}>
          <View style={styles.modalHandle} />
          <View style={styles.inviteIconWrap}>
            <MaterialIcons name="link" size={40} color={DT.primaryContainer} />
          </View>
          <Text style={styles.inviteTitle}>Invita a un colega</Text>
          <Text style={styles.inviteSubtitle}>
            Comparte este enlace para que tu colega se una a PlanearIA y se conecte contigo
            automáticamente.
          </Text>
          <View style={styles.inviteLinkRow}>
            <View style={styles.inviteLinkInput}>
              <Text style={styles.inviteLinkText} numberOfLines={1}>
                {inviteUrl || "planear.ia/invite/..."}
              </Text>
            </View>
            <Pressable
              style={({ pressed }) => [styles.inviteCopyBtn, pressed && { opacity: 0.85 }]}
              onPress={onCopiar}
            >
              <MaterialIcons name="content-copy" size={16} color="#FFF" />
              <Text style={styles.inviteCopyText}>Copiar</Text>
            </Pressable>
          </View>
          <View style={styles.shareRow}>
            <Pressable
              style={({ pressed }) => [styles.shareCircle, pressed && { opacity: 0.7 }]}
              onPress={onCompartir}
            >
              <MaterialIcons name="chat" size={22} color="#25D366" />
            </Pressable>
            <Pressable
              style={({ pressed }) => [styles.shareCircle, pressed && { opacity: 0.7 }]}
              onPress={onCompartir}
            >
              <MaterialIcons name="email" size={22} color={DT.primaryContainer} />
            </Pressable>
            <Pressable
              style={({ pressed }) => [styles.shareCircle, pressed && { opacity: 0.7 }]}
              onPress={onCompartir}
            >
              <MaterialIcons name="share" size={22} color={DT.textSecondary} />
            </Pressable>
          </View>
          <Text style={styles.inviteLegal}>El enlace expira en 7 días</Text>
        </Pressable>
      </Pressable>
    </Modal>
  );
};

// ─── Toast ───

const Toast: React.FC<{
  visible: boolean;
  type: "solicitud" | "enlace" | null;
  nombre: string;
}> = ({ visible, type, nombre }) => {
  const { colors, isDark } = useTheme();
  const DT = getThemeTokens(colors);
  const styles = getStyles(DT, isDark);
  if (!visible || !type) return null;

  const isSolicitud = type === "solicitud";
  const bg = isSolicitud ? DT.successTint : DT.primaryFixed;
  const color = isSolicitud ? DT.success : DT.primaryContainer;
  const icon = isSolicitud ? "check-circle" : "content-copy";
  const text = isSolicitud ? `Solicitud enviada a ${nombre}` : "Enlace de invitación copiado";

  return (
    <View style={[styles.toast, { backgroundColor: bg }]}>
      <MaterialIcons name={icon as keyof typeof MaterialIcons.glyphMap} size={20} color={color} />
      <Text style={[styles.toastText, { color }]}>{text}</Text>
    </View>
  );
};

// ─── Skeleton Loading ───

const SkeletonLoading: React.FC = () => {
  const { colors, isDark } = useTheme();
  const DT = getThemeTokens(colors);
  const styles = getStyles(DT, isDark);
  return (
    <View style={styles.skeletonWrap}>
      <View style={styles.skeletonSearchBar} />
      <View style={styles.skeletonChipsRow}>
        {[80, 70, 90, 95, 75].map((w, i) => (
          <View key={i} style={[styles.skeletonChip, { width: w }]} />
        ))}
      </View>
      <View style={styles.skeletonIndicator} />
      {[0, 1, 2, 3].map((i) => (
        <View key={i} style={styles.skeletonCard}>
          <View style={styles.skeletonCardInner}>
            <View style={styles.skeletonAvatar} />
            <View style={styles.skeletonLines}>
              <View style={[styles.skeletonLine, { width: "60%" }]} />
              <View style={[styles.skeletonLine, { width: "40%" }]} />
            </View>
          </View>
          <View style={styles.skeletonBtn} />
        </View>
      ))}
    </View>
  );
};

// ─── Error State ───

const ErrorState: React.FC<{ onRetry: () => void }> = ({ onRetry }) => {
  const { colors, isDark } = useTheme();
  const DT = getThemeTokens(colors);
  const styles = getStyles(DT, isDark);
  return (
    <View style={styles.emptyCenter}>
      <View style={[styles.emptyIconCircle, { backgroundColor: DT.errorTint }]}>
        <MaterialIcons name="wifi-off" size={40} color="#C62828" />
      </View>
      <Text style={styles.emptyTitle}>Sin conexión a internet</Text>
      <Text style={styles.emptySubtitle}>Verifica tu conexión e intenta de nuevo</Text>
      <Pressable
        style={({ pressed }) => [styles.retryBtn, pressed && { opacity: 0.85 }]}
        onPress={onRetry}
      >
        <MaterialIcons name="refresh" size={16} color="#FFF" />
        <Text style={styles.retryBtnText}>Reintentar</Text>
      </Pressable>
    </View>
  );
};

// ─── No Results State ───

const NoResults: React.FC<{
  query: string;
  onInvite: () => void;
}> = ({ query, onInvite }) => {
  const { colors, isDark } = useTheme();
  const DT = getThemeTokens(colors);
  const styles = getStyles(DT, isDark);
  return (
    <View style={styles.emptyCenter}>
      <View style={[styles.emptyIconCircle, { backgroundColor: DT.surfaceContainer }]}>
        <MaterialIcons name="search-off" size={48} color={DT.outlineVariant} />
      </View>
      <Text style={styles.emptyTitle}>Sin resultados para &ldquo;{query}&rdquo;</Text>
      <Text style={styles.emptySubtitle}>Intenta con otro nombre, email o escuela</Text>
      <Pressable
        style={({ pressed }) => [styles.inviteLinkBtn, pressed && { opacity: 0.8 }]}
        onPress={onInvite}
      >
        <MaterialIcons name="link" size={16} color={DT.primaryContainer} />
        <Text style={styles.inviteLinkBtnText}>Invitar por enlace</Text>
      </Pressable>
    </View>
  );
};

// ─── Offline Banner ───

const OfflineBanner: React.FC = () => {
  const { colors, isDark } = useTheme();
  const DT = getThemeTokens(colors);
  const styles = getStyles(DT, isDark);
  return (
    <View style={styles.offlineBanner}>
      <MaterialIcons name="cloud-off" size={14} color={DT.warning} />
      <Text style={styles.offlineBannerText}>
        Modo sin conexión — búsqueda limitada a contactos guardados
      </Text>
    </View>
  );
};

// ─── Main Screen ───

const BuscadorPerfilesScreen: React.FC = () => {
  const { colors, isDark } = useTheme();
  const DT = getThemeTokens(colors);
  const styles = getStyles(DT, isDark);
  const { width } = useWindowDimensions();
  const isDesktop = width >= 768;
  const navigation = useNavigation();
  const vm = useBuscadorPerfilesViewModel();

  // ─── Search Bar ───
  const renderSearchBar = () => (
    <View style={styles.searchBarWrap}>
      <MaterialIcons name="search" size={22} color={DT.outline} />
      <TextInput
        style={styles.searchInput}
        value={vm.searchQuery}
        onChangeText={vm.setSearchQuery}
        placeholder="Nombre, email o escuela..."
        placeholderTextColor={DT.outline}
        onSubmitEditing={vm.handleSearch}
        returnKeyType="search"
      />
      {vm.searchQuery.length > 0 && (
        <Pressable
          onPress={vm.handleClearSearch}
          style={({ pressed }) => [styles.clearBtn, pressed && { opacity: 0.7 }]}
        >
          <MaterialIcons name="close" size={18} color={DT.textMuted} />
        </Pressable>
      )}
    </View>
  );

  // ─── Filter Chips ───
  const renderChips = () => (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      style={styles.chipsScroll}
      contentContainerStyle={styles.chipsRow}
    >
      {NIVELES.map((nivel) => {
        const active = vm.filtroNivel === nivel;
        return (
          <Pressable
            key={nivel}
            style={({ pressed }) => [
              styles.chip,
              active && styles.chipActive,
              pressed && { opacity: 0.8 },
            ]}
            onPress={() => vm.setFiltroNivel(nivel)}
          >
            <Text style={[styles.chipText, active && styles.chipTextActive]}>{nivel}</Text>
          </Pressable>
        );
      })}
    </ScrollView>
  );

  // ─── Advanced Filters ───
  const renderAdvancedFilters = () => (
    <>
      <Pressable
        style={({ pressed }) => [styles.filterToggle, pressed && { opacity: 0.7 }]}
        onPress={vm.toggleFiltros}
      >
        <MaterialIcons name="tune" size={16} color={DT.primaryContainer} />
        <Text style={styles.filterToggleText}>
          {vm.filtrosExpandidos ? "Menos filtros" : "Más filtros"}
        </Text>
      </Pressable>
      {vm.filtrosExpandidos && (
        <View style={styles.advancedFilters}>
          <View style={styles.dropdownRow}>
            <MaterialIcons name="location-on" size={16} color={DT.outline} />
            <Text style={styles.dropdownText}>{vm.filtroEstado || "Todos los estados"}</Text>
          </View>
          <View style={styles.dropdownRow}>
            <MaterialIcons name="menu-book" size={16} color={DT.outline} />
            <Text style={styles.dropdownText}>{vm.filtroMateria || "Todas las materias"}</Text>
          </View>
        </View>
      )}
    </>
  );

  // ─── Suggested Section ───
  const renderSugeridos = () => (
    <View style={styles.section}>
      <Text style={styles.sectionLabel}>SUGERIDOS PARA TI</Text>
      <View style={styles.sectionCards}>
        {vm.sugeridos.map((d) => (
          <SuggestedCard key={d.id} docente={d} onConectar={vm.handleConectar} />
        ))}
      </View>
    </View>
  );

  // ─── Invite CTA ───
  const renderInviteCTA = () => (
    <View style={styles.inviteCTA}>
      <View style={styles.inviteCTARow}>
        <MaterialIcons name="link" size={24} color={DT.primaryContainer} />
        <View style={styles.inviteCTAInfo}>
          <Text style={styles.inviteCTATitle}>¿No encuentras a tu colega?</Text>
          <Text style={styles.inviteCTASubtitle}>Envíale un enlace de invitación directo</Text>
        </View>
      </View>
      <Pressable
        style={({ pressed }) => [styles.inviteCTABtn, pressed && { opacity: 0.85 }]}
        onPress={vm.handleAbrirInviteModal}
      >
        <MaterialIcons name="content-copy" size={16} color="#FFF" />
        <Text style={styles.inviteCTABtnText}>Copiar enlace de invitación</Text>
      </Pressable>
    </View>
  );

  // ─── Results ───
  const renderContent = () => {
    if (vm.hasError) {
      return <ErrorState onRetry={vm.handleReintentar} />;
    }

    if (vm.isSearching) {
      return <SkeletonLoading />;
    }

    if (vm.hasSearched && vm.resultados.length === 0) {
      return <NoResults query={vm.searchQuery} onInvite={vm.handleAbrirInviteModal} />;
    }

    if (vm.hasSearched && vm.resultados.length > 0) {
      return (
        <>
          <Text style={styles.resultsCount}>{vm.totalResultados} docentes encontrados</Text>
          <View style={[styles.resultsGrid, isDesktop && styles.resultsGridDesktop]}>
            {vm.resultados.map((d) => (
              <ResultCard key={d.id} docente={d} onConectar={vm.handleConectar} />
            ))}
          </View>
        </>
      );
    }

    // Default: show suggestions + invite CTA
    return (
      <>
        {renderSugeridos()}
        {renderInviteCTA()}
      </>
    );
  };

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="dark-content" />

      {/* Toast */}
      <Toast visible={vm.toast.visible} type={vm.toast.type} nombre={vm.toast.nombre} />

      {/* Offline Banner */}
      {vm.isOffline && <OfflineBanner />}

      {/* Header */}
      <View style={styles.header}>
        <Pressable
          onPress={() => navigation.goBack()}
          style={({ pressed }) => [styles.headerBack, pressed && { opacity: 0.7 }]}
        >
          <MaterialIcons name="arrow-back" size={22} color={DT.primaryContainer} />
        </Pressable>
        <View style={styles.headerIconWrap}>
          <MaterialIcons name="search" size={22} color={DT.primaryContainer} />
        </View>
        <Text style={styles.headerTitle}>Buscar Docentes</Text>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[styles.scrollContent, isDesktop && styles.scrollContentDesktop]}
        keyboardShouldPersistTaps="handled"
      >
        {renderSearchBar()}
        {renderChips()}
        {renderAdvancedFilters()}
        {renderContent()}
      </ScrollView>

      {/* Modals */}
      <SolicitudModal
        visible={vm.solicitudModal.visible}
        docente={vm.solicitudModal.docente}
        onEnviar={vm.handleEnviarSolicitud}
        onCerrar={vm.handleCerrarSolicitudModal}
      />
      <InviteModal
        visible={vm.inviteModal}
        inviteUrl={vm.inviteUrl}
        onCopiar={vm.handleCopiarEnlace}
        onCompartir={vm.handleCompartirEnlace}
        onCerrar={vm.handleCerrarInviteModal}
      />
    </SafeAreaView>
  );
};

// ─── Styles ───

const getStyles = (DT: any, isDark: boolean) =>
  StyleSheet.create({
    cardShadow: Platform.select({
      web: {
        boxShadow: isDark ? "0px 2px 8px rgba(0,0,0,0.2)" : "0px 2px 8px rgba(0,69,128,0.06)",
      } as any,
      default: {
        shadowColor: isDark ? "#000000" : "#004580",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: isDark ? 0.2 : 0.06,
        shadowRadius: 8,
        elevation: 2,
      },
    }),
    liftShadow: Platform.select({
      web: {
        boxShadow: isDark ? "0px 12px 48px rgba(0,0,0,0.35)" : "0px 12px 48px rgba(0,69,128,0.08)",
      } as any,
      default: {
        shadowColor: isDark ? "#000000" : "#004580",
        shadowOffset: { width: 0, height: 12 },
        shadowOpacity: isDark ? 0.35 : 0.08,
        shadowRadius: 48,
        elevation: 4,
      },
    }),
    safe: { flex: 1, backgroundColor: DT.surface },

    // Header
    header: {
      flexDirection: "row",
      alignItems: "center",
      paddingHorizontal: 16,
      paddingVertical: 12,
      gap: 10,
    },
    headerBack: {
      width: 36,
      height: 36,
      borderRadius: 10,
      alignItems: "center",
      justifyContent: "center",
    },
    headerIconWrap: {
      width: 36,
      height: 36,
      borderRadius: 18,
      backgroundColor: DT.primaryFixed,
      alignItems: "center",
      justifyContent: "center",
    },
    headerTitle: {
      fontSize: 18,
      fontWeight: "800",
      color: DT.primaryContainer,
      letterSpacing: -0.3,
    },

    // Scroll
    scrollView: { flex: 1 },
    scrollContent: { padding: 16, paddingBottom: 110, gap: 16 },
    scrollContentDesktop: { maxWidth: 1120, alignSelf: "center", width: "100%" },

    // Search Bar
    searchBarWrap: {
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: DT.surfaceContainer,
      borderRadius: 14,
      height: 52,
      paddingHorizontal: 14,
      gap: 8,
    },
    searchInput: {
      flex: 1,
      fontSize: 15,
      fontWeight: "500",
      color: DT.onSurface,
    },
    clearBtn: {
      width: 28,
      height: 28,
      borderRadius: 14,
      backgroundColor: DT.surfaceContainer,
      alignItems: "center",
      justifyContent: "center",
    },

    // Chips
    chipsScroll: { maxHeight: 40 },
    chipsRow: { flexDirection: "row", gap: 8 },
    chip: {
      paddingHorizontal: 16,
      paddingVertical: 8,
      borderRadius: 999,
      height: 36,
      backgroundColor: DT.surfaceContainer,
      justifyContent: "center",
    },
    chipActive: { backgroundColor: DT.primaryContainer },
    chipText: { fontSize: 13, fontWeight: "600", color: DT.textSecondary },
    chipTextActive: { color: "#FFF", fontWeight: "700" },

    // Advanced Filters
    filterToggle: {
      flexDirection: "row",
      alignItems: "center",
      gap: 6,
    },
    filterToggleText: {
      fontSize: 13,
      fontWeight: "700",
      color: DT.primaryContainer,
    },
    advancedFilters: { gap: 10 },
    dropdownRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: 8,
      backgroundColor: DT.surfaceContainer,
      borderRadius: 10,
      height: 40,
      paddingHorizontal: 12,
    },
    dropdownText: { fontSize: 14, color: DT.textMuted },

    // Section
    section: { gap: 10 },
    sectionLabel: {
      fontSize: 13,
      fontWeight: "800",
      color: DT.textMuted,
      letterSpacing: 1.1,
    },
    sectionCards: { gap: 10 },

    // Cards
    card: {
      backgroundColor: DT.surfaceLowest,
      borderRadius: 14,
      padding: 14,
    },
    cardRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: 12,
    },
    cardInfo: { flex: 1 },
    cardName: { fontSize: 15, fontWeight: "700", color: DT.onSurface },
    cardSchool: { fontSize: 13, color: DT.textSecondary, marginTop: 1 },
    commonRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: 4,
      marginTop: 3,
    },
    commonText: {
      fontSize: 12,
      fontWeight: "600",
      color: DT.primaryContainer,
    },
    connectBtnSmall: {
      backgroundColor: DT.primaryContainer,
      borderRadius: 10,
      height: 34,
      paddingHorizontal: 16,
      alignItems: "center",
      justifyContent: "center",
    },
    connectBtnSmallText: {
      color: "#FFF",
      fontSize: 13,
      fontWeight: "700",
    },

    // Avatar
    avatar: { alignItems: "center", justifyContent: "center" },
    avatarText: { color: "#FFF", fontWeight: "700" },

    // Result Card
    resultCard: {
      backgroundColor: DT.surfaceLowest,
      borderRadius: 16,
      padding: 16,
      gap: 10,
    },
    resultHeader: {
      flexDirection: "row",
      alignItems: "center",
      gap: 12,
    },
    resultName: { fontSize: 16, fontWeight: "700", color: DT.onSurface },
    resultMeta: { fontSize: 13, color: DT.textMuted, marginTop: 1 },

    // Connect Buttons
    connectBtnFull: { borderRadius: 12, overflow: "hidden" },
    connectGradient: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      gap: 6,
      height: 42,
      borderRadius: 12,
    },
    connectBtnFullText: { color: "#FFF", fontSize: 14, fontWeight: "700" },
    statusBtn: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      gap: 6,
      height: 42,
      borderRadius: 12,
    },
    statusBtnText: { fontSize: 14, fontWeight: "600" },
    connectedRow: { gap: 6 },
    msgLink: { alignItems: "center", paddingVertical: 4 },
    msgLinkText: {
      fontSize: 13,
      fontWeight: "700",
      color: DT.primaryContainer,
    },

    // Results
    resultsCount: {
      fontSize: 14,
      fontWeight: "600",
      color: DT.textSecondary,
    },
    resultsGrid: { gap: 10 },
    resultsGridDesktop: {
      flexDirection: "row",
      flexWrap: "wrap",
    },

    // Empty / Error States
    emptyCenter: {
      alignItems: "center",
      justifyContent: "center",
      paddingVertical: 48,
      gap: 12,
    },
    emptyIconCircle: {
      width: 96,
      height: 96,
      borderRadius: 48,
      alignItems: "center",
      justifyContent: "center",
      marginBottom: 8,
    },
    emptyTitle: {
      fontSize: 18,
      fontWeight: "700",
      color: DT.onSurface,
      textAlign: "center",
    },
    emptySubtitle: {
      fontSize: 15,
      color: DT.textSecondary,
      textAlign: "center",
      maxWidth: 280,
    },
    retryBtn: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      gap: 6,
      backgroundColor: DT.primaryContainer,
      height: 44,
      borderRadius: 12,
      paddingHorizontal: 24,
      marginTop: 8,
    },
    retryBtnText: { color: "#FFF", fontWeight: "700", fontSize: 14 },
    inviteLinkBtn: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      gap: 6,
      backgroundColor: DT.primaryFixed,
      height: 44,
      borderRadius: 12,
      paddingHorizontal: 20,
      marginTop: 8,
    },
    inviteLinkBtnText: {
      color: DT.primaryContainer,
      fontWeight: "700",
      fontSize: 14,
    },

    // Invite CTA Card
    inviteCTA: {
      backgroundColor: DT.primaryFixed,
      borderRadius: 14,
      padding: 16,
      gap: 10,
    },
    inviteCTARow: {
      flexDirection: "row",
      alignItems: "flex-start",
      gap: 12,
    },
    inviteCTAInfo: { flex: 1 },
    inviteCTATitle: {
      fontSize: 15,
      fontWeight: "700",
      color: DT.onSurface,
    },
    inviteCTASubtitle: {
      fontSize: 13,
      color: DT.textSecondary,
      marginTop: 2,
    },
    inviteCTABtn: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      gap: 6,
      backgroundColor: DT.primaryContainer,
      height: 40,
      borderRadius: 10,
    },
    inviteCTABtnText: { color: "#FFF", fontSize: 13, fontWeight: "700" },

    // Skeleton
    skeletonWrap: { gap: 10 },
    skeletonSearchBar: {
      width: "100%",
      height: 52,
      borderRadius: 14,
      backgroundColor: DT.skeleton,
      opacity: 0.5,
    },
    skeletonChipsRow: {
      flexDirection: "row",
      gap: 8,
    },
    skeletonChip: {
      height: 36,
      borderRadius: 999,
      backgroundColor: DT.skeleton,
      opacity: 0.4,
    },
    skeletonIndicator: {
      width: 120,
      height: 16,
      borderRadius: 8,
      backgroundColor: DT.skeleton,
      opacity: 0.4,
    },
    skeletonCard: {
      width: "100%",
      height: 140,
      borderRadius: 16,
      backgroundColor: DT.skeleton,
      opacity: 0.5,
      padding: 16,
      justifyContent: "space-between",
    },
    skeletonCardInner: {
      flexDirection: "row",
      alignItems: "center",
      gap: 12,
    },
    skeletonAvatar: {
      width: 52,
      height: 52,
      borderRadius: 26,
      backgroundColor: DT.surfaceContainer,
    },
    skeletonLines: { flex: 1, gap: 8 },
    skeletonLine: {
      height: 14,
      borderRadius: 7,
      backgroundColor: DT.surfaceContainer,
    },
    skeletonBtn: {
      width: "100%",
      height: 42,
      borderRadius: 12,
      backgroundColor: DT.surfaceContainer,
    },

    // Modal
    modalBackdrop: {
      flex: 1,
      backgroundColor: DT.overlay,
      justifyContent: "flex-end",
    },
    modalSheet: {
      backgroundColor: DT.surfaceLowest,
      borderTopLeftRadius: 32,
      borderTopRightRadius: 32,
      padding: 24,
      ...Platform.select({
        web: {
          boxShadow: "0px 24px 48px rgba(0,72,132,0.12)",
        } as any,
        default: {
          shadowColor: "#004580",
          shadowOffset: { width: 0, height: -24 },
          shadowOpacity: 0.12,
          shadowRadius: 48,
          elevation: 10,
        },
      }),
    },
    modalHandle: {
      width: 36,
      height: 4,
      borderRadius: 999,
      backgroundColor: DT.outlineVariant,
      alignSelf: "center",
      marginBottom: 20,
    },
    modalHeader: {
      flexDirection: "row",
      alignItems: "center",
      gap: 12,
      marginBottom: 20,
    },
    modalName: { fontSize: 17, fontWeight: "700", color: DT.onSurface },
    modalLabel: {
      fontSize: 13,
      fontWeight: "600",
      color: DT.textSecondary,
      marginBottom: 8,
    },
    modalInputWrap: { marginBottom: 16 },
    modalInput: {
      backgroundColor: DT.surfaceLow,
      borderRadius: 12,
      height: 100,
      padding: 14,
      fontSize: 15,
      color: DT.onSurface,
      textAlignVertical: "top",
    },
    modalCounter: {
      fontSize: 12,
      color: DT.textMuted,
      textAlign: "right",
      marginTop: 4,
    },
    modalSendBtn: { borderRadius: 12, overflow: "hidden", marginBottom: 8 },
    modalSendGradient: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      gap: 8,
      height: 48,
      borderRadius: 12,
    },
    modalSendText: { color: "#FFF", fontWeight: "800", fontSize: 15 },
    modalCancelBtn: {
      alignItems: "center",
      justifyContent: "center",
      height: 44,
    },
    modalCancelText: {
      fontSize: 15,
      fontWeight: "600",
      color: DT.textSecondary,
    },

    // Invite Modal
    inviteIconWrap: {
      width: 80,
      height: 80,
      borderRadius: 40,
      backgroundColor: DT.primaryFixed,
      alignItems: "center",
      justifyContent: "center",
      alignSelf: "center",
      marginBottom: 16,
    },
    inviteTitle: {
      fontSize: 20,
      fontWeight: "700",
      color: DT.onSurface,
      textAlign: "center",
      marginBottom: 8,
    },
    inviteSubtitle: {
      fontSize: 15,
      color: DT.textSecondary,
      textAlign: "center",
      maxWidth: 300,
      alignSelf: "center",
      marginBottom: 20,
      lineHeight: 22,
    },
    inviteLinkRow: {
      flexDirection: "row",
      gap: 8,
      marginBottom: 20,
    },
    inviteLinkInput: {
      flex: 1,
      backgroundColor: DT.surfaceLow,
      borderRadius: 10,
      height: 44,
      justifyContent: "center",
      paddingHorizontal: 12,
    },
    inviteLinkText: {
      fontSize: 14,
      color: DT.onSurface,
    },
    inviteCopyBtn: {
      flexDirection: "row",
      alignItems: "center",
      gap: 6,
      backgroundColor: DT.primaryContainer,
      borderRadius: 10,
      height: 44,
      paddingHorizontal: 16,
    },
    inviteCopyText: { color: "#FFF", fontSize: 13, fontWeight: "700" },
    shareRow: {
      flexDirection: "row",
      justifyContent: "center",
      gap: 12,
      marginBottom: 16,
    },
    shareCircle: {
      width: 48,
      height: 48,
      borderRadius: 14,
      backgroundColor: DT.surfaceContainer,
      alignItems: "center",
      justifyContent: "center",
    },
    inviteLegal: {
      fontSize: 12,
      color: DT.textMuted,
      textAlign: "center",
    },

    // Toast
    toast: {
      position: "absolute",
      top: 50,
      left: 16,
      right: 16,
      flexDirection: "row",
      alignItems: "center",
      gap: 8,
      borderRadius: 12,
      padding: 12,
      paddingHorizontal: 16,
      zIndex: 100,
      ...Platform.select({
        web: { boxShadow: "0px 4px 12px rgba(0,69,128,0.08)" } as any,
        default: {
          shadowColor: "#004584",
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.08,
          shadowRadius: 12,
          elevation: 4,
        },
      }),
    },
    toastText: { fontSize: 14, fontWeight: "700" },

    // Offline Banner
    offlineBanner: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      gap: 6,
      backgroundColor: DT.warningTint,
      height: 36,
      borderBottomWidth: 1,
      borderBottomColor: "#F5D7B0",
    },
    offlineBannerText: {
      fontSize: 12,
      fontWeight: "600",
      color: DT.warning,
    },
  });

export default BuscadorPerfilesScreen;
