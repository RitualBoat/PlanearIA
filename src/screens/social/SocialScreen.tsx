import { useTheme } from "../../context/ThemeContext";
import React, { useState } from "react";
import {
  Pressable,
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  RefreshControl,
  Modal,
  Platform,
  StatusBar,
  useWindowDimensions,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { LinearGradient } from "expo-linear-gradient";
import { useNavigation } from "@react-navigation/native";
import AnimatedTopPill from "../../components/AnimatedTopPill";
import { Contacto, SolicitudConexion } from "../../../types";
import { useSocialViewModel, SocialTab } from "../../hooks/useSocialViewModel";

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

const getInitials = (nombre: string, apellidos?: string): string => {
  const first = nombre?.[0] || "";
  const last = apellidos?.[0] || "";
  return (first + last).toUpperCase() || "?";
};

// ─── Avatar Component ───

const ContactAvatar: React.FC<{
  nombre: string;
  apellidos?: string;
  size?: number;
  enLinea?: boolean;
  bgColor?: string;
}> = ({ nombre, apellidos, size = 44, enLinea, bgColor }) => {
  const { colors, isDark } = useTheme();
  const DT = getThemeTokens(colors);
  const styles = getStyles(DT, isDark);
  return (
    <View style={{ position: "relative" }}>
      <View
        style={[
          styles.avatar,
          {
            width: size,
            height: size,
            borderRadius: size / 2,
            backgroundColor: bgColor || DT.primaryContainer,
          },
        ]}
      >
        <Text style={[styles.avatarText, { fontSize: size * 0.36 }]}>
          {getInitials(nombre, apellidos)}
        </Text>
      </View>
      {enLinea !== undefined && (
        <View
          style={[
            styles.onlineDot,
            {
              backgroundColor: enLinea ? DT.success : DT.outlineVariant,
              bottom: 0,
              right: 0,
            },
          ]}
        />
      )}
    </View>
  );
};

// ─── Stats Row ───

const StatsRow: React.FC<{
  totalContactos: number;
  totalGrupos: number;
  pendientes: number;
}> = ({ totalContactos, totalGrupos, pendientes }) => {
  const { colors, isDark } = useTheme();
  const DT = getThemeTokens(colors);
  const styles = getStyles(DT, isDark);
  return (
    <View style={styles.statsRow}>
      <View style={[styles.statBadge, { backgroundColor: DT.primaryFixed }]}>
        <MaterialIcons name="people-outline" size={14} color={DT.primaryContainer} />
        <Text style={[styles.statBadgeText, { color: DT.primaryContainer }]}>
          {totalContactos} Contactos
        </Text>
      </View>
      <View style={[styles.statBadge, { backgroundColor: DT.warningTint }]}>
        <MaterialIcons name="schedule" size={14} color={DT.warning} />
        <Text style={[styles.statBadgeText, { color: DT.warning }]}>{pendientes} Pendientes</Text>
      </View>
      <View style={[styles.statBadge, { backgroundColor: DT.successTint }]}>
        <MaterialIcons name="chat" size={14} color={DT.success} />
        <Text style={[styles.statBadgeText, { color: DT.success }]}>{totalGrupos} Mensajes</Text>
      </View>
    </View>
  );
};

// ─── Tab Bar ───

const TabBar: React.FC<{
  activeTab: SocialTab;
  onTabChange: (tab: SocialTab) => void;
  pendientes: number;
}> = ({ activeTab, onTabChange, pendientes }) => {
  const { colors, isDark } = useTheme();
  const DT = getThemeTokens(colors);
  const styles = getStyles(DT, isDark);
  const tabs: { key: SocialTab; label: string; icon: keyof typeof MaterialIcons.glyphMap }[] = [
    { key: "contactos", label: "Contactos", icon: "people" },
    { key: "solicitudes", label: "Solicitudes", icon: "person-add" },
    { key: "buscar", label: "Buscar", icon: "search" },
  ];

  return (
    <View style={styles.tabBar}>
      {tabs.map((tab) => (
        <Pressable
          key={tab.key}
          style={({ pressed }) => [
            styles.tab,
            activeTab === tab.key && styles.tabActive,
            pressed && { opacity: 0.7 },
          ]}
          onPress={() => onTabChange(tab.key)}
        >
          <MaterialIcons
            name={tab.icon}
            size={16}
            color={activeTab === tab.key ? DT.onSurface : DT.textMuted}
          />
          <Text style={[styles.tabText, activeTab === tab.key && styles.tabTextActive]}>
            {tab.label}
          </Text>
          {tab.key === "solicitudes" && pendientes > 0 && <View style={styles.tabBadge} />}
        </Pressable>
      ))}
    </View>
  );
};

// ─── Contact Card ───

const ContactCard: React.FC<{
  contacto: Contacto;
  onPress: (c: Contacto) => void;
  onChat: () => void;
  onMore: (c: Contacto) => void;
}> = ({ contacto, onPress, onChat, onMore }) => {
  const { colors, isDark } = useTheme();
  const DT = getThemeTokens(colors);
  const styles = getStyles(DT, isDark);
  return (
    <Pressable
      style={({ pressed }) => [styles.contactCard, styles.cardShadow, pressed && { opacity: 0.85 }]}
      onPress={() => onPress(contacto)}
    >
      <View style={styles.contactCardInner}>
        <ContactAvatar
          nombre={contacto.nombre}
          apellidos={contacto.apellidos}
          size={44}
          enLinea={contacto.enLinea}
        />
        <View style={styles.contactInfo}>
          <Text style={styles.contactName}>
            {contacto.nombre} {contacto.apellidos}
          </Text>
          {contacto.institucion ? (
            <Text style={styles.contactSchool} numberOfLines={1}>
              {contacto.institucion}
            </Text>
          ) : null}
          <Text style={styles.contactMateria} numberOfLines={1}>
            {contacto.materia || "Docente"}
          </Text>
        </View>
      </View>
      <Pressable
        style={({ pressed }) => [styles.contactChatBtn, pressed && { opacity: 0.7 }]}
        onPress={onChat}
      >
        <MaterialIcons name="chat" size={18} color={DT.primaryContainer} />
      </Pressable>
    </Pressable>
  );
};

// ─── Solicitud Card ───

const SolicitudCard: React.FC<{
  solicitud: SolicitudConexion;
  onAceptar: (id: number) => void;
  onRechazar: (id: number) => void;
}> = ({ solicitud, onAceptar, onRechazar }) => {
  const { colors, isDark } = useTheme();
  const DT = getThemeTokens(colors);
  const styles = getStyles(DT, isDark);
  return (
    <View style={[styles.solicitudCard, styles.cardShadow]}>
      <View style={styles.solicitudHeader}>
        <ContactAvatar
          nombre={solicitud.deUsuarioNombre.split(" ")[0] || ""}
          apellidos={solicitud.deUsuarioNombre.split(" ").slice(1).join(" ")}
          size={44}
        />
        <View style={styles.solicitudInfo}>
          <Text style={styles.contactName}>{solicitud.deUsuarioNombre}</Text>
          <Text style={styles.contactMateria}>
            {solicitud.deUsuarioMateria || solicitud.deUsuarioInstitucion || "Docente"}
          </Text>
        </View>
      </View>
      {solicitud.mensaje ? (
        <View style={styles.solicitudMsgBubble}>
          <MaterialIcons name="format-quote" size={16} color={DT.outlineVariant} />
          <Text style={styles.solicitudMsgText}>{solicitud.mensaje}</Text>
        </View>
      ) : null}
      <View style={styles.solicitudBtns}>
        <Pressable
          style={({ pressed }) => [styles.btnAceptar, pressed && { opacity: 0.85 }]}
          onPress={() => onAceptar(solicitud.id)}
        >
          <LinearGradient
            colors={[DT.primaryContainer, "#005da8"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.btnGradient}
          >
            <MaterialIcons name="check" size={16} color="#FFF" />
            <Text style={styles.btnAceptarText}>Aceptar</Text>
          </LinearGradient>
        </Pressable>
        <Pressable
          style={({ pressed }) => [styles.btnRechazar, pressed && { opacity: 0.7 }]}
          onPress={() => onRechazar(solicitud.id)}
        >
          <MaterialIcons name="close" size={16} color={DT.textMuted} />
          <Text style={styles.btnRechazarText}>Rechazar</Text>
        </Pressable>
      </View>
    </View>
  );
};

// ─── Profile Bottom Sheet ───

const ProfileBottomSheet: React.FC<{
  contacto: Contacto | null;
  visible: boolean;
  onClose: () => void;
  onMessage: () => void;
  onDelete: (id: number) => void;
}> = ({ contacto, visible, onClose, onMessage, onDelete }) => {
  const { colors, isDark } = useTheme();
  const DT = getThemeTokens(colors);
  const styles = getStyles(DT, isDark);
  if (!contacto) return null;
  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <Pressable style={styles.sheetBackdrop} onPress={onClose}>
        <View style={styles.sheetContainer}>
          <Pressable>
            <View style={styles.sheetHandle} />
            <View style={styles.sheetProfile}>
              <ContactAvatar nombre={contacto.nombre} apellidos={contacto.apellidos} size={72} />
              <Text style={styles.sheetName}>
                {contacto.nombre} {contacto.apellidos}
              </Text>
              <Text style={styles.sheetInstitution}>{contacto.institucion || ""}</Text>
              {contacto.materia ? (
                <View style={styles.sheetLevelBadge}>
                  <Text style={styles.sheetLevelBadgeText}>{contacto.materia}</Text>
                </View>
              ) : null}
            </View>

            <View style={styles.sheetStats}>
              <View style={styles.sheetStatItem}>
                <Text style={styles.sheetStatValue}>—</Text>
                <Text style={styles.sheetStatLabel}>Contactos</Text>
              </View>
              <View style={styles.sheetStatDivider} />
              <View style={styles.sheetStatItem}>
                <Text style={styles.sheetStatValue}>—</Text>
                <Text style={styles.sheetStatLabel}>Recursos</Text>
              </View>
              <View style={styles.sheetStatDivider} />
              <View style={styles.sheetStatItem}>
                <Text style={styles.sheetStatValue}>—</Text>
                <Text style={styles.sheetStatLabel}>Grupos</Text>
              </View>
            </View>

            {contacto.email ? (
              <View style={styles.sheetInfoCard}>
                <View style={styles.sheetInfoIcon}>
                  <MaterialIcons name="alternate-email" size={18} color={DT.textSecondary} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.sheetInfoValue} numberOfLines={1}>
                    {contacto.email}
                  </Text>
                </View>
              </View>
            ) : null}

            {contacto.materia ? (
              <View style={styles.sheetInfoCard}>
                <View style={styles.sheetInfoIcon}>
                  <MaterialIcons name="school" size={18} color={DT.textSecondary} />
                </View>
                <View>
                  <Text style={styles.sheetInfoValue}>{contacto.materia}</Text>
                </View>
              </View>
            ) : null}

            {contacto.institucion ? (
              <View style={styles.sheetInfoCard}>
                <View style={styles.sheetInfoIcon}>
                  <MaterialIcons name="location-on" size={18} color={DT.textSecondary} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.sheetInfoValue} numberOfLines={1}>
                    {contacto.institucion}
                  </Text>
                </View>
              </View>
            ) : null}

            <View style={styles.sheetActions}>
              <Pressable style={({ pressed }) => pressed && { opacity: 0.85 }} onPress={onMessage}>
                <LinearGradient
                  colors={[DT.primaryContainer, "#005da8"]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={styles.sheetPrimaryBtn}
                >
                  <MaterialIcons name="send" size={18} color="#FFF" />
                  <Text style={styles.sheetPrimaryBtnText}>Enviar mensaje</Text>
                </LinearGradient>
              </Pressable>
              <Pressable
                style={({ pressed }) => [styles.sheetDeleteBtn, pressed && { opacity: 0.7 }]}
                onPress={() => onDelete(contacto.id)}
              >
                <Text style={styles.sheetDeleteBtnText}>Bloquear</Text>
              </Pressable>
              <Pressable
                style={({ pressed }) => [styles.sheetCloseBtn, pressed && { opacity: 0.7 }]}
                onPress={onClose}
              >
                <Text style={styles.sheetCloseBtnText}>Cerrar</Text>
              </Pressable>
            </View>
          </Pressable>
        </View>
      </Pressable>
    </Modal>
  );
};

// ─── Empty State ───

const EmptyState: React.FC<{ tab: SocialTab; onBuscar?: () => void }> = ({ tab, onBuscar }) => {
  const { colors, isDark } = useTheme();
  const DT = getThemeTokens(colors);
  const styles = getStyles(DT, isDark);
  const configs = {
    contactos: {
      icon: "people-outline" as const,
      title: "Aún no tienes contactos",
      subtitle: "Busca y conecta con otros docentes para compartir materiales y colaborar.",
      primaryBtn: "Buscar docentes",
      primaryIcon: "search" as const,
      secondaryBtn: "Invitar por enlace",
      secondaryIcon: "link" as const,
    },
    solicitudes: {
      icon: "mail-outline" as const,
      title: "Sin solicitudes pendientes",
      subtitle: "Cuando otros docentes quieran conectar contigo, sus solicitudes aparecerán aquí.",
      primaryBtn: null,
      primaryIcon: null,
      secondaryBtn: null,
      secondaryIcon: null,
    },
    buscar: {
      icon: "person-search" as const,
      title: "Busca compañeros docentes",
      subtitle: "Usa el buscador para encontrar docentes por nombre, materia o institución.",
      primaryBtn: null,
      primaryIcon: null,
      secondaryBtn: null,
      secondaryIcon: null,
    },
  };
  const cfg = configs[tab];

  return (
    <View style={styles.emptyState}>
      <View style={styles.emptyIconWrap}>
        <MaterialIcons name={cfg.icon} size={64} color={DT.outlineVariant} />
      </View>
      <Text style={styles.emptyTitle}>{cfg.title}</Text>
      <Text style={styles.emptySubtitle}>{cfg.subtitle}</Text>
      {cfg.primaryBtn && (
        <Pressable
          style={({ pressed }) => [styles.emptyPrimaryBtn, pressed && { opacity: 0.85 }]}
          onPress={onBuscar}
        >
          <MaterialIcons name={cfg.primaryIcon!} size={18} color="#FFF" />
          <Text style={styles.emptyPrimaryBtnText}>{cfg.primaryBtn}</Text>
        </Pressable>
      )}
      {cfg.secondaryBtn && (
        <Pressable style={({ pressed }) => [styles.emptySecondaryBtn, pressed && { opacity: 0.7 }]}>
          <MaterialIcons name={cfg.secondaryIcon!} size={18} color={DT.onSurface} />
          <Text style={styles.emptySecondaryBtnText}>{cfg.secondaryBtn}</Text>
        </Pressable>
      )}
    </View>
  );
};

// ─── Main Screen ───

const SocialScreen: React.FC = () => {
  const { colors, isDark } = useTheme();
  const DT = getThemeTokens(colors);
  const styles = getStyles(DT, isDark);
  const { width } = useWindowDimensions();
  const isDesktop = width >= 768;
  const navigation = useNavigation<any>();
  const vm = useSocialViewModel();

  const handleChatPress = () => {
    navigation.navigate("Chat");
  };

  const handleMorePress = (contacto: Contacto) => {
    vm.handleSelectContacto(contacto);
  };

  // ─── Contactos Tab ───
  const renderContactosTab = () => (
    <>
      <StatsRow
        totalContactos={vm.stats.totalContactos}
        totalGrupos={vm.stats.totalGrupos}
        pendientes={vm.stats.pendientes}
      />

      {vm.contactos.length === 0 ? (
        <EmptyState tab="contactos" onBuscar={() => navigation.navigate("BuscadorPerfiles")} />
      ) : (
        <View style={styles.sectionBlock}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>MIS CONTACTOS</Text>
            <Pressable style={({ pressed }) => pressed && { opacity: 0.7 }}>
              <Text style={styles.sectionLink}>Ver todos →</Text>
            </Pressable>
          </View>
          <View style={styles.contactList}>
            {vm.contactos.map((contacto) => (
              <ContactCard
                key={contacto.id}
                contacto={contacto}
                onPress={(c) => vm.handleSelectContacto(c)}
                onChat={handleChatPress}
                onMore={handleMorePress}
              />
            ))}
          </View>
        </View>
      )}
    </>
  );

  // ─── Solicitudes Tab ───
  const renderSolicitudesTab = () => {
    const currentList =
      vm.solicitudesSubTab === "recibidas" ? vm.solicitudesRecibidas : vm.solicitudesEnviadas;

    return (
      <>
        <View style={styles.subTabRow}>
          <Pressable
            style={({ pressed }) => [
              styles.subTab,
              vm.solicitudesSubTab === "recibidas" && styles.subTabActive,
              pressed && { opacity: 0.7 },
            ]}
            onPress={() => vm.setSolicitudesSubTab("recibidas")}
          >
            <Text
              style={[
                styles.subTabText,
                vm.solicitudesSubTab === "recibidas" && styles.subTabTextActive,
              ]}
            >
              Recibidas
            </Text>
            {vm.solicitudesRecibidas.length > 0 && (
              <View style={styles.subTabBadge}>
                <Text style={styles.subTabBadgeText}>{vm.solicitudesRecibidas.length}</Text>
              </View>
            )}
          </Pressable>
          <Pressable
            style={({ pressed }) => [
              styles.subTab,
              vm.solicitudesSubTab === "enviadas" && styles.subTabActive,
              pressed && { opacity: 0.7 },
            ]}
            onPress={() => vm.setSolicitudesSubTab("enviadas")}
          >
            <Text
              style={[
                styles.subTabText,
                vm.solicitudesSubTab === "enviadas" && styles.subTabTextActive,
              ]}
            >
              Enviadas
            </Text>
            {vm.solicitudesEnviadas.length > 0 && (
              <View style={[styles.subTabBadge, { backgroundColor: DT.textMuted }]}>
                <Text style={styles.subTabBadgeText}>{vm.solicitudesEnviadas.length}</Text>
              </View>
            )}
          </Pressable>
        </View>

        {currentList.length === 0 ? (
          <EmptyState tab="solicitudes" />
        ) : (
          <View style={styles.solicitudList}>
            {currentList.map((s) => (
              <SolicitudCard
                key={s.id}
                solicitud={s}
                onAceptar={vm.handleAceptarSolicitud}
                onRechazar={vm.handleRechazarSolicitud}
              />
            ))}
          </View>
        )}
      </>
    );
  };

  // ─── Buscar Tab ───
  const renderBuscarTab = () => (
    <>
      <View style={styles.searchBarWrap}>
        <MaterialIcons name="search" size={20} color={DT.textMuted} />
        <TextInput
          style={styles.searchInput}
          placeholder="Buscar por nombre, email o escuela..."
          placeholderTextColor={DT.textMuted}
          value={vm.searchQuery}
          onChangeText={vm.setSearchQuery}
        />
        {vm.searchQuery.length > 0 && (
          <Pressable
            style={({ pressed }) => pressed && { opacity: 0.6 }}
            onPress={() => vm.setSearchQuery("")}
          >
            <MaterialIcons name="close" size={20} color={DT.textMuted} />
          </Pressable>
        )}
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.filterChipsScroll}
      >
        <View style={styles.filterChips}>
          {["Todos", "Primaria", "Secundaria", "Preparatoria", "Universidad"].map((label, i) => (
            <View key={label} style={[styles.chip, i === 0 && styles.chipActive]}>
              <Text style={[styles.chipText, i === 0 && styles.chipTextActive]}>{label}</Text>
            </View>
          ))}
        </View>
      </ScrollView>

      {vm.searchQuery.trim() ? (
        vm.contactos.length === 0 ? (
          <View style={styles.emptyState}>
            <MaterialIcons name="search-off" size={48} color={DT.outlineVariant} />
            <Text style={styles.emptyTitle}>No se encontraron docentes</Text>
            <Text style={styles.emptySubtitle}>
              Intenta buscar con otro nombre, email o escuela
            </Text>
            <Pressable
              style={({ pressed }) => [styles.emptyInviteBtn, pressed && { opacity: 0.7 }]}
            >
              <MaterialIcons name="link" size={16} color={DT.primaryContainer} />
              <Text style={styles.emptyInviteBtnText}>Invitar por enlace</Text>
            </Pressable>
          </View>
        ) : (
          <View style={[styles.searchResults, isDesktop && styles.searchResultsDesktop]}>
            {vm.contactos.map((c) => (
              <View key={c.id} style={[styles.searchResultCard, styles.cardShadow]}>
                <View style={styles.searchResultHeader}>
                  <ContactAvatar nombre={c.nombre} apellidos={c.apellidos} size={48} />
                  <View style={{ flex: 1 }}>
                    <Text style={styles.contactName}>
                      {c.nombre} {c.apellidos}
                    </Text>
                    {c.institucion ? (
                      <Text style={styles.contactSchool} numberOfLines={1}>
                        {c.institucion}
                      </Text>
                    ) : null}
                    <Text style={styles.contactMateria}>{c.materia || "Docente"}</Text>
                  </View>
                  <Pressable
                    style={({ pressed }) => pressed && { opacity: 0.85 }}
                    onPress={() => vm.handleSelectContacto(c)}
                  >
                    <LinearGradient
                      colors={[DT.primaryContainer, "#005da8"]}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 1 }}
                      style={styles.connectBtn}
                    >
                      <Text style={styles.connectBtnText}>Conectar</Text>
                    </LinearGradient>
                  </Pressable>
                </View>
              </View>
            ))}
          </View>
        )
      ) : (
        <EmptyState tab="buscar" />
      )}
    </>
  );

  // ─── Loading State (Skeleton) ───
  if (vm.isLoading) {
    return (
      <SafeAreaView style={styles.safe} edges={["top"]}>
        <StatusBar backgroundColor={DT.surface} barStyle="dark-content" />
        <View style={styles.skeletonContent}>
          <View style={styles.skeletonPill} />
          <View style={styles.skeletonTabBar} />
          <View style={styles.skeletonStatsRow}>
            {[0, 1, 2].map((i) => (
              <View key={i} style={styles.skeletonStatBadge} />
            ))}
          </View>
          {[0, 1, 2, 3, 4].map((i) => (
            <View key={i} style={styles.skeletonContactCard} />
          ))}
          {[0, 1].map((i) => (
            <View key={i} style={styles.skeletonMessageCard} />
          ))}
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      <StatusBar backgroundColor={DT.surface} barStyle="dark-content" />

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[
          styles.scrollContent,
          isDesktop && { maxWidth: 720, alignSelf: "center", width: "100%" },
        ]}
        refreshControl={
          <RefreshControl
            refreshing={vm.isRefreshing}
            onRefresh={vm.handleRefresh}
            tintColor={DT.primaryContainer}
            colors={[DT.primaryContainer]}
          />
        }
        showsVerticalScrollIndicator={false}
      >
        <AnimatedTopPill
          icon="people"
          title="Social"
          subtitle="Conecta y colabora con otros docentes"
        />

        <TabBar
          activeTab={vm.activeTab}
          onTabChange={vm.handleTabChange}
          pendientes={vm.solicitudesRecibidas.length}
        />

        {vm.activeTab === "contactos" && renderContactosTab()}
        {vm.activeTab === "solicitudes" && renderSolicitudesTab()}
        {vm.activeTab === "buscar" && renderBuscarTab()}

        {/* Tip Card */}
        {vm.activeTab === "contactos" && vm.contactos.length > 0 && (
          <View style={styles.tipCard}>
            <MaterialIcons name="lightbulb" size={18} color={DT.primaryContainer} />
            <Text style={styles.tipCardText}>
              Conecta con docentes de tu misma materia para compartir planeaciones y recursos.
            </Text>
          </View>
        )}
      </ScrollView>

      <ProfileBottomSheet
        contacto={vm.selectedContacto}
        visible={vm.selectedContacto !== null}
        onClose={() => vm.handleSelectContacto(null)}
        onMessage={handleChatPress}
        onDelete={(id) => {
          vm.handleSelectContacto(null);
          vm.handleEliminarContacto(id);
        }}
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

    // ScrollView
    scrollView: { flex: 1 },
    scrollContent: { padding: 16, paddingTop: 54, paddingBottom: 110, gap: 14 },

    // Tab Bar
    tabBar: {
      flexDirection: "row",
      padding: 4,
      backgroundColor: DT.surfaceLow,
      borderRadius: 14,
      height: 44,
    },
    tab: {
      flex: 1,
      paddingVertical: 8,
      paddingHorizontal: 12,
      borderRadius: 10,
      alignItems: "center",
      justifyContent: "center",
      flexDirection: "row",
      gap: 6,
    },
    tabActive: {
      backgroundColor: DT.surfaceLowest,
      ...Platform.select({
        web: { boxShadow: "0px 2px 8px rgba(0,72,132,0.08)" } as any,
        default: {
          shadowColor: "#004884",
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.08,
          shadowRadius: 8,
          elevation: 2,
        },
      }),
    },
    tabText: { fontSize: 14, fontWeight: "500", color: DT.textMuted },
    tabTextActive: { color: DT.onSurface, fontWeight: "700" },
    tabBadge: {
      width: 8,
      height: 8,
      borderRadius: 4,
      backgroundColor: DT.error,
    },

    // Stats Row (mini-badges)
    statsRow: { flexDirection: "row", gap: 8 },
    statBadge: {
      flexDirection: "row",
      alignItems: "center",
      gap: 4,
      borderRadius: 999,
      paddingHorizontal: 12,
      paddingVertical: 5,
    },
    statBadgeText: {
      fontSize: 12,
      fontWeight: "700",
    },

    // Sections
    sectionBlock: { gap: 10 },
    sectionHeader: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
    },
    sectionTitle: {
      fontSize: 13,
      fontWeight: "800",
      color: DT.textMuted,
      letterSpacing: 1.1,
    },
    sectionLink: {
      fontSize: 14,
      fontWeight: "700",
      color: DT.primaryContainer,
    },

    // Contact Card
    contactList: { gap: 10 },
    contactCard: {
      backgroundColor: DT.surfaceLowest,
      padding: 14,
      borderRadius: 14,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
    },
    contactCardInner: { flexDirection: "row", alignItems: "center", gap: 12, flex: 1 },
    contactInfo: { flex: 1 },
    contactName: { fontSize: 15, fontWeight: "700", color: DT.onSurface },
    contactSchool: { fontSize: 13, color: DT.textSecondary, marginTop: 1 },
    contactMateria: { fontSize: 12, fontWeight: "500", color: DT.textMuted, marginTop: 1 },
    contactChatBtn: {
      width: 36,
      height: 36,
      borderRadius: 10,
      backgroundColor: DT.primaryFixed,
      alignItems: "center",
      justifyContent: "center",
    },

    // Avatar
    avatar: {
      alignItems: "center",
      justifyContent: "center",
    },
    avatarText: { color: "#FFF", fontWeight: "700" },
    onlineDot: {
      position: "absolute",
      width: 10,
      height: 10,
      borderRadius: 5,
      borderWidth: 2,
      borderColor: "#FFF",
    },

    // Solicitud Card
    solicitudList: { gap: 10 },
    solicitudCard: {
      backgroundColor: DT.surfaceLowest,
      padding: 14,
      borderRadius: 14,
    },
    solicitudHeader: { flexDirection: "row", alignItems: "center", gap: 12, marginBottom: 10 },
    solicitudInfo: { flex: 1 },
    solicitudMsgBubble: {
      backgroundColor: DT.surfaceLow,
      borderTopRightRadius: 10,
      borderBottomRightRadius: 10,
      borderBottomLeftRadius: 10,
      padding: 10,
      marginBottom: 10,
      flexDirection: "row",
      gap: 8,
      alignItems: "flex-start",
    },
    solicitudMsgText: {
      flex: 1,
      fontSize: 13,
      color: DT.textSecondary,
      fontStyle: "italic",
      lineHeight: 18,
    },
    solicitudBtns: { flexDirection: "row", gap: 8 },
    btnAceptar: { flex: 1 },
    btnGradient: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      gap: 6,
      height: 38,
      borderRadius: 10,
    },
    btnAceptarText: { color: "#FFF", fontWeight: "700", fontSize: 13 },
    btnRechazar: {
      flex: 1,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      gap: 4,
      backgroundColor: DT.surfaceContainer,
      height: 38,
      borderRadius: 10,
    },
    btnRechazarText: { color: DT.textMuted, fontWeight: "700", fontSize: 13 },

    // Sub Tabs
    subTabRow: { flexDirection: "row", gap: 0 },
    subTab: {
      flex: 1,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      gap: 6,
      paddingVertical: 9,
      borderRadius: 10,
      backgroundColor: DT.surfaceContainer,
    },
    subTabActive: {
      backgroundColor: DT.surfaceLowest,
      ...Platform.select({
        web: { boxShadow: "0px 2px 8px rgba(0,72,132,0.08)" } as any,
        default: {
          shadowColor: "#004884",
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.08,
          shadowRadius: 8,
          elevation: 2,
        },
      }),
    },
    subTabText: { fontWeight: "500", fontSize: 13, color: DT.textMuted },
    subTabTextActive: { fontWeight: "700", color: DT.onSurface },
    subTabBadge: {
      minWidth: 18,
      height: 18,
      borderRadius: 9,
      backgroundColor: DT.primaryContainer,
      alignItems: "center",
      justifyContent: "center",
      paddingHorizontal: 4,
    },
    subTabBadgeText: { color: "#FFF", fontSize: 10, fontWeight: "700" },

    // Search Tab
    searchBarWrap: {
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: DT.surfaceContainer,
      borderRadius: 14,
      height: 48,
      paddingHorizontal: 14,
      gap: 8,
    },
    searchInput: { flex: 1, fontSize: 15, fontWeight: "500", color: DT.onSurface },
    filterChipsScroll: { maxHeight: 36 },
    filterChips: { flexDirection: "row", gap: 8 },
    chip: {
      paddingHorizontal: 14,
      paddingVertical: 6,
      borderRadius: 999,
      height: 32,
      backgroundColor: DT.surfaceContainer,
      justifyContent: "center",
    },
    chipActive: { backgroundColor: DT.primaryContainer },
    chipText: { fontSize: 13, fontWeight: "600", color: DT.textMuted },
    chipTextActive: { color: "#FFF", fontWeight: "700" },

    // Search Results
    searchResults: { gap: 10 },
    searchResultsDesktop: { flexDirection: "row", flexWrap: "wrap" },
    searchResultCard: {
      backgroundColor: DT.surfaceLowest,
      padding: 14,
      borderRadius: 14,
    },
    searchResultHeader: { flexDirection: "row", alignItems: "center", gap: 12 },
    connectBtn: {
      paddingHorizontal: 16,
      paddingVertical: 8,
      borderRadius: 10,
      height: 34,
      alignItems: "center",
      justifyContent: "center",
    },
    connectBtnText: { color: "#FFF", fontWeight: "700", fontSize: 13 },

    // Empty State
    emptyState: {
      alignItems: "center",
      justifyContent: "center",
      paddingVertical: 48,
      gap: 12,
    },
    emptyIconWrap: {
      width: 120,
      height: 120,
      borderRadius: 60,
      backgroundColor: DT.surfaceContainer,
      alignItems: "center",
      justifyContent: "center",
      marginBottom: 8,
    },
    emptyTitle: { fontSize: 22, fontWeight: "700", color: DT.onSurface, textAlign: "center" },
    emptySubtitle: {
      fontSize: 15,
      color: DT.textMuted,
      textAlign: "center",
      lineHeight: 22,
      maxWidth: 280,
    },
    emptyPrimaryBtn: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      gap: 8,
      backgroundColor: DT.primaryContainer,
      height: 50,
      borderRadius: 12,
      width: "100%",
      maxWidth: 320,
      marginTop: 8,
    },
    emptyPrimaryBtnText: { color: "#FFF", fontSize: 15, fontWeight: "800" },
    emptySecondaryBtn: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      gap: 8,
      backgroundColor: DT.surfaceContainer,
      height: 48,
      borderRadius: 12,
      width: "100%",
      maxWidth: 320,
    },
    emptySecondaryBtnText: { color: DT.onSurface, fontSize: 15, fontWeight: "700" },
    emptyInviteBtn: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      gap: 6,
      backgroundColor: DT.primaryFixed,
      height: 44,
      borderRadius: 10,
      paddingHorizontal: 20,
      marginTop: 8,
    },
    emptyInviteBtnText: { color: DT.primaryContainer, fontSize: 14, fontWeight: "700" },

    // Skeleton Loading
    skeletonContent: {
      paddingHorizontal: 16,
      paddingTop: 60,
      gap: 14,
    },
    skeletonPill: {
      width: 160,
      height: 32,
      borderRadius: 999,
      backgroundColor: DT.skeleton,
      opacity: 0.5,
    },
    skeletonTabBar: {
      width: "100%",
      height: 44,
      borderRadius: 14,
      backgroundColor: DT.skeleton,
      opacity: 0.5,
    },
    skeletonStatsRow: {
      flexDirection: "row",
      gap: 8,
    },
    skeletonStatBadge: {
      width: 100,
      height: 28,
      borderRadius: 999,
      backgroundColor: DT.skeleton,
      opacity: 0.4,
    },
    skeletonContactCard: {
      width: "100%",
      height: 72,
      borderRadius: 14,
      backgroundColor: DT.skeleton,
      opacity: 0.5,
    },
    skeletonMessageCard: {
      width: "100%",
      height: 60,
      borderRadius: 14,
      backgroundColor: DT.skeleton,
      opacity: 0.4,
    },

    // Tip Card
    tipCard: {
      flexDirection: "row",
      gap: 8,
      backgroundColor: DT.primaryFixed,
      borderRadius: 12,
      padding: 12,
      alignItems: "flex-start",
    },
    tipCardText: {
      flex: 1,
      fontSize: 13,
      color: DT.primaryContainer,
      lineHeight: 18,
    },

    // Profile Bottom Sheet
    sheetBackdrop: {
      flex: 1,
      backgroundColor: DT.overlay,
      justifyContent: "flex-end",
    },
    sheetContainer: {
      backgroundColor: DT.surfaceLowest,
      borderTopLeftRadius: 40,
      borderTopRightRadius: 40,
      ...Platform.select({
        web: { boxShadow: "0px -12px 48px rgba(0,69,128,0.12)" } as any,
        default: {
          shadowColor: "#004580",
          shadowOffset: { width: 0, height: -12 },
          shadowOpacity: 0.12,
          shadowRadius: 48,
          elevation: 10,
        },
      }),
    },
    sheetHandle: {
      width: 36,
      height: 4,
      borderRadius: 999,
      backgroundColor: DT.outlineVariant,
      alignSelf: "center",
      marginTop: 14,
      marginBottom: 16,
      opacity: 0.3,
    },
    sheetProfile: { alignItems: "center", paddingHorizontal: 24, paddingBottom: 16, gap: 4 },
    sheetName: { fontSize: 20, fontWeight: "700", color: DT.onSurface, marginTop: 12 },
    sheetInstitution: { fontSize: 15, fontWeight: "500", color: DT.textSecondary },
    sheetLevelBadge: {
      backgroundColor: DT.primaryFixed,
      borderRadius: 999,
      paddingHorizontal: 12,
      paddingVertical: 4,
      marginTop: 4,
    },
    sheetLevelBadgeText: {
      fontSize: 12,
      fontWeight: "700",
      color: DT.primaryContainer,
    },
    sheetStats: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-around",
      backgroundColor: DT.surfaceLow,
      borderRadius: 14,
      padding: 16,
      marginHorizontal: 24,
      marginBottom: 16,
    },
    sheetStatItem: { alignItems: "center" },
    sheetStatValue: { fontSize: 18, fontWeight: "700", color: DT.onSurface },
    sheetStatLabel: {
      fontSize: 11,
      fontWeight: "600",
      color: DT.textMuted,
      marginTop: 2,
    },
    sheetStatDivider: {
      width: 1,
      height: 28,
      backgroundColor: DT.outlineVariant,
      opacity: 0.3,
    },
    sheetInfoCard: {
      flexDirection: "row",
      alignItems: "center",
      gap: 10,
      padding: 14,
      backgroundColor: DT.surfaceLow,
      borderRadius: 14,
      marginHorizontal: 24,
      marginBottom: 8,
    },
    sheetInfoIcon: {
      width: 36,
      height: 36,
      borderRadius: 18,
      backgroundColor: DT.surfaceLowest,
      alignItems: "center",
      justifyContent: "center",
    },
    sheetInfoValue: { fontSize: 14, fontWeight: "500", color: DT.onSurface },
    sheetActions: { padding: 24, gap: 8 },
    sheetPrimaryBtn: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      gap: 8,
      height: 48,
      borderRadius: 12,
    },
    sheetPrimaryBtnText: { color: "#FFF", fontWeight: "700", fontSize: 15 },
    sheetDeleteBtn: {
      alignItems: "center",
      justifyContent: "center",
      paddingVertical: 8,
      marginTop: 4,
    },
    sheetDeleteBtnText: { color: DT.error, fontWeight: "600", fontSize: 13 },
    sheetCloseBtn: {
      backgroundColor: DT.surfaceContainer,
      height: 48,
      borderRadius: 12,
      alignItems: "center",
      justifyContent: "center",
    },
    sheetCloseBtnText: { color: DT.onSurface, fontWeight: "700", fontSize: 15 },
  });

export default SocialScreen;
