import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  TextInput,
  RefreshControl,
  Modal,
  Platform,
  ActivityIndicator,
  useWindowDimensions,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { LinearGradient } from "expo-linear-gradient";
import AnimatedTopPill from "../../components/AnimatedTopPill";
import { COLORS, Contacto, SolicitudConexion } from "../../../types";
import { useSocialViewModel, SocialTab } from "../../hooks/useSocialViewModel";

// ─── Helpers ───

const getInitials = (nombre: string, apellidos?: string): string => {
  const first = nombre?.[0] || "";
  const last = apellidos?.[0] || "";
  return (first + last).toUpperCase() || "?";
};

const cardShadow = Platform.select({
  web: { boxShadow: "0px 12px 24px rgba(0,72,132,0.06)" } as any,
  default: {
    shadowColor: "#004884",
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.06,
    shadowRadius: 24,
    elevation: 3,
  },
});

const liftShadow = Platform.select({
  web: { boxShadow: "0px 24px 48px rgba(0,72,132,0.08)" } as any,
  default: {
    shadowColor: "#004884",
    shadowOffset: { width: 0, height: 24 },
    shadowOpacity: 0.08,
    shadowRadius: 48,
    elevation: 5,
  },
});

// ─── Avatar Component ───

const ContactAvatar: React.FC<{
  nombre: string;
  apellidos?: string;
  size?: number;
  enLinea?: boolean;
}> = ({ nombre, apellidos, size = 56, enLinea }) => (
  <View style={{ position: "relative" }}>
    <View style={[styles.avatar, { width: size, height: size, borderRadius: size / 2 }]}>
      <Text style={[styles.avatarText, { fontSize: size * 0.36 }]}>
        {getInitials(nombre, apellidos)}
      </Text>
    </View>
    {enLinea !== undefined && (
      <View
        style={[
          styles.onlineDot,
          {
            backgroundColor: enLinea ? COLORS.success : COLORS.outlineVariant,
            bottom: 0,
            right: 0,
          },
        ]}
      />
    )}
  </View>
);

// ─── Stats Row ───

const StatsRow: React.FC<{
  totalContactos: number;
  totalGrupos: number;
  pendientes: number;
}> = ({ totalContactos, totalGrupos, pendientes }) => (
  <View style={styles.statsRow}>
    <View style={[styles.statCard, styles.statCardDefault, liftShadow]}>
      <Text style={[styles.statValue, { color: COLORS.primary }]}>{totalContactos}</Text>
      <Text style={styles.statLabel}>CONTACTOS</Text>
    </View>
    <View style={[styles.statCard, styles.statCardPrimary]}>
      <Text style={[styles.statValue, { color: "#FFF" }]}>{totalGrupos}</Text>
      <Text style={[styles.statLabel, { color: "rgba(255,255,255,0.8)" }]}>GRUPOS</Text>
    </View>
    <View style={[styles.statCard, styles.statCardMuted]}>
      <Text style={[styles.statValue, { color: COLORS.success }]}>{pendientes}</Text>
      <Text style={styles.statLabel}>PENDIENTES</Text>
    </View>
  </View>
);

// ─── Tab Bar ───

const TabBar: React.FC<{
  activeTab: SocialTab;
  onTabChange: (tab: SocialTab) => void;
  pendientes: number;
}> = ({ activeTab, onTabChange, pendientes }) => {
  const tabs: { key: SocialTab; label: string }[] = [
    { key: "contactos", label: "Contactos" },
    { key: "solicitudes", label: "Solicitudes" },
    { key: "buscar", label: "Buscar" },
  ];

  return (
    <View style={styles.tabBar}>
      {tabs.map((tab) => (
        <TouchableOpacity
          key={tab.key}
          style={[styles.tab, activeTab === tab.key && styles.tabActive]}
          onPress={() => onTabChange(tab.key)}
          activeOpacity={0.7}
        >
          <Text style={[styles.tabText, activeTab === tab.key && styles.tabTextActive]}>
            {tab.label}
          </Text>
          {tab.key === "solicitudes" && pendientes > 0 && (
            <View style={styles.tabBadge}>
              <Text style={styles.tabBadgeText}>{pendientes}</Text>
            </View>
          )}
        </TouchableOpacity>
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
}> = ({ contacto, onPress, onChat, onMore }) => (
  <TouchableOpacity
    style={[styles.contactCard, cardShadow]}
    onPress={() => onPress(contacto)}
    activeOpacity={0.85}
  >
    <View style={styles.contactCardInner}>
      <ContactAvatar
        nombre={contacto.nombre}
        apellidos={contacto.apellidos}
        enLinea={contacto.enLinea}
      />
      <View style={styles.contactInfo}>
        <Text style={styles.contactName}>
          {contacto.nombre} {contacto.apellidos}
        </Text>
        <Text style={styles.contactMateria}>{contacto.materia || "Docente"}</Text>
      </View>
    </View>
    <View style={styles.contactActions}>
      <TouchableOpacity style={styles.contactActionBtn} onPress={onChat} activeOpacity={0.7}>
        <MaterialIcons name="chat-bubble" size={20} color={COLORS.primary} />
      </TouchableOpacity>
      <TouchableOpacity
        style={styles.contactActionBtn}
        onPress={() => onMore(contacto)}
        activeOpacity={0.7}
      >
        <MaterialIcons name="more-vert" size={20} color={COLORS.textMuted} />
      </TouchableOpacity>
    </View>
  </TouchableOpacity>
);

// ─── Solicitud Card ───

const SolicitudCard: React.FC<{
  solicitud: SolicitudConexion;
  onAceptar: (id: number) => void;
  onRechazar: (id: number) => void;
}> = ({ solicitud, onAceptar, onRechazar }) => (
  <View style={[styles.solicitudCard, cardShadow]}>
    <View style={styles.solicitudHeader}>
      <ContactAvatar
        nombre={solicitud.deUsuarioNombre.split(" ")[0] || ""}
        apellidos={solicitud.deUsuarioNombre.split(" ").slice(1).join(" ")}
        size={56}
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
        <MaterialIcons name="format-quote" size={16} color={COLORS.outlineVariant} />
        <Text style={styles.solicitudMsgText}>{solicitud.mensaje}</Text>
      </View>
    ) : null}
    <View style={styles.solicitudBtns}>
      <TouchableOpacity
        style={styles.btnAceptar}
        onPress={() => onAceptar(solicitud.id)}
        activeOpacity={0.85}
      >
        <LinearGradient
          colors={[COLORS.primary, COLORS.primaryContainer]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.btnGradient}
        >
          <MaterialIcons name="check-circle" size={16} color="#FFF" />
          <Text style={styles.btnAceptarText}>Aceptar</Text>
        </LinearGradient>
      </TouchableOpacity>
      <TouchableOpacity
        style={styles.btnRechazar}
        onPress={() => onRechazar(solicitud.id)}
        activeOpacity={0.7}
      >
        <Text style={styles.btnRechazarText}>Rechazar</Text>
      </TouchableOpacity>
    </View>
  </View>
);

// ─── Profile Bottom Sheet ───

const ProfileBottomSheet: React.FC<{
  contacto: Contacto | null;
  visible: boolean;
  onClose: () => void;
  onMessage: () => void;
  onDelete: (id: number) => void;
}> = ({ contacto, visible, onClose, onMessage, onDelete }) => {
  if (!contacto) return null;
  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <TouchableOpacity style={styles.sheetBackdrop} onPress={onClose} activeOpacity={1}>
        <View style={styles.sheetContainer}>
          <TouchableOpacity activeOpacity={1}>
            <View style={styles.sheetHandle} />
            <View style={styles.sheetProfile}>
              <ContactAvatar nombre={contacto.nombre} apellidos={contacto.apellidos} size={96} />
              <Text style={styles.sheetName}>
                {contacto.nombre} {contacto.apellidos}
              </Text>
              <Text style={styles.sheetInstitution}>{contacto.institucion || ""}</Text>
            </View>

            <View style={styles.sheetStats}>
              <View style={styles.sheetStatItem}>
                <Text style={styles.sheetStatValue}>—</Text>
                <Text style={styles.sheetStatLabel}>CONTACTOS</Text>
              </View>
              <View style={styles.sheetStatDivider} />
              <View style={styles.sheetStatItem}>
                <Text style={styles.sheetStatValue}>—</Text>
                <Text style={styles.sheetStatLabel}>RECURSOS</Text>
              </View>
              <View style={styles.sheetStatDivider} />
              <View style={styles.sheetStatItem}>
                <Text style={styles.sheetStatValue}>—</Text>
                <Text style={styles.sheetStatLabel}>GRUPOS</Text>
              </View>
            </View>

            {contacto.email ? (
              <View style={styles.sheetInfoCard}>
                <View style={styles.sheetInfoIcon}>
                  <MaterialIcons name="alternate-email" size={20} color={COLORS.primary} />
                </View>
                <View>
                  <Text style={styles.sheetInfoLabel}>CORREO ELECTRÓNICO</Text>
                  <Text style={styles.sheetInfoValue}>{contacto.email}</Text>
                </View>
              </View>
            ) : null}

            {contacto.materia ? (
              <View style={styles.sheetInfoCard}>
                <View style={styles.sheetInfoIcon}>
                  <MaterialIcons name="menu-book" size={20} color={COLORS.primary} />
                </View>
                <View>
                  <Text style={styles.sheetInfoLabel}>MATERIA PRINCIPAL</Text>
                  <Text style={styles.sheetInfoValue}>{contacto.materia}</Text>
                </View>
              </View>
            ) : null}

            <View style={styles.sheetActions}>
              <TouchableOpacity onPress={onMessage} activeOpacity={0.85}>
                <LinearGradient
                  colors={[COLORS.primary, COLORS.primaryContainer]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={styles.sheetPrimaryBtn}
                >
                  <MaterialIcons name="send" size={18} color="#FFF" />
                  <Text style={styles.sheetPrimaryBtnText}>Enviar mensaje</Text>
                </LinearGradient>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.sheetSecondaryBtn}
                onPress={() => onDelete(contacto.id)}
                activeOpacity={0.7}
              >
                <MaterialIcons name="person-remove" size={18} color={COLORS.error} />
                <Text style={styles.sheetSecondaryBtnText}>Eliminar contacto</Text>
              </TouchableOpacity>
            </View>
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    </Modal>
  );
};

// ─── Empty State ───

const EmptyState: React.FC<{ tab: SocialTab }> = ({ tab }) => {
  const configs = {
    contactos: {
      icon: "people" as const,
      title: "Aún no tienes contactos",
      subtitle: "Busca docentes para conectar y colaborar en proyectos académicos.",
    },
    solicitudes: {
      icon: "mail" as const,
      title: "Sin solicitudes pendientes",
      subtitle: "Cuando otros docentes quieran conectar contigo, sus solicitudes aparecerán aquí.",
    },
    buscar: {
      icon: "person-search" as const,
      title: "Busca compañeros docentes",
      subtitle: "Usa el buscador para encontrar docentes por nombre, materia o institución.",
    },
  };
  const cfg = configs[tab];

  return (
    <View style={styles.emptyState}>
      <View style={styles.emptyIconWrap}>
        <MaterialIcons name={cfg.icon} size={56} color={COLORS.outlineVariant} />
      </View>
      <Text style={styles.emptyTitle}>{cfg.title}</Text>
      <Text style={styles.emptySubtitle}>{cfg.subtitle}</Text>
    </View>
  );
};

// ─── Main Screen ───

const SocialScreen: React.FC = () => {
  const { width } = useWindowDimensions();
  const isDesktop = width >= 768;
  const vm = useSocialViewModel();

  const handleChatPress = () => {
    // Chat será implementado en Sprint 5.4
    import("react-native").then(({ Alert }) => {
      Alert.alert("Próximamente", "La mensajería se implementará en una próxima actualización.");
    });
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
        <EmptyState tab="contactos" />
      ) : (
        <View style={styles.sectionBlock}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Mis Contactos</Text>
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
          <TouchableOpacity
            style={[styles.subTab, vm.solicitudesSubTab === "recibidas" && styles.subTabActive]}
            onPress={() => vm.setSolicitudesSubTab("recibidas")}
            activeOpacity={0.7}
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
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.subTab, vm.solicitudesSubTab === "enviadas" && styles.subTabActive]}
            onPress={() => vm.setSolicitudesSubTab("enviadas")}
            activeOpacity={0.7}
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
              <View style={[styles.subTabBadge, { backgroundColor: COLORS.textMuted }]}>
                <Text style={styles.subTabBadgeText}>{vm.solicitudesEnviadas.length}</Text>
              </View>
            )}
          </TouchableOpacity>
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
      <Text style={styles.searchHero}>
        Encuentra a tu próximo{"\n"}
        <Text style={styles.searchHeroAccent}>compañero docente</Text>
      </Text>

      <View style={styles.searchBarWrap}>
        <MaterialIcons name="search" size={22} color={COLORS.textMuted} />
        <TextInput
          style={styles.searchInput}
          placeholder="¿A quién buscas?"
          placeholderTextColor={COLORS.textMuted}
          value={vm.searchQuery}
          onChangeText={vm.setSearchQuery}
        />
        {vm.searchQuery.length > 0 && (
          <TouchableOpacity onPress={() => vm.setSearchQuery("")}>
            <MaterialIcons name="close" size={20} color={COLORS.textMuted} />
          </TouchableOpacity>
        )}
      </View>

      <View style={styles.filterChips}>
        {["Todas las áreas", "Primaria", "Secundaria", "Universidad"].map((label, i) => (
          <View key={label} style={[styles.chip, i === 0 && styles.chipActive]}>
            <Text style={[styles.chipText, i === 0 && styles.chipTextActive]}>{label}</Text>
          </View>
        ))}
      </View>

      {vm.searchQuery.trim() ? (
        vm.contactos.length === 0 ? (
          <View style={styles.emptyState}>
            <MaterialIcons name="search-off" size={48} color={COLORS.outlineVariant} />
            <Text style={styles.emptyTitle}>Sin resultados</Text>
            <Text style={styles.emptySubtitle}>
              No se encontraron contactos con "{vm.searchQuery}"
            </Text>
          </View>
        ) : (
          <View style={[styles.searchResults, isDesktop && styles.searchResultsDesktop]}>
            {vm.contactos.map((c) => (
              <View key={c.id} style={[styles.searchResultCard, liftShadow]}>
                <View style={styles.searchResultHeader}>
                  <ContactAvatar nombre={c.nombre} apellidos={c.apellidos} size={56} />
                  <View style={{ flex: 1 }}>
                    <Text style={styles.contactName}>
                      {c.nombre} {c.apellidos}
                    </Text>
                    <Text style={styles.contactMateria}>{c.materia || "Docente"}</Text>
                  </View>
                </View>
                <TouchableOpacity onPress={() => vm.handleSelectContacto(c)} activeOpacity={0.85}>
                  <LinearGradient
                    colors={[COLORS.primary, COLORS.primaryContainer]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={styles.connectBtn}
                  >
                    <Text style={styles.connectBtnText}>Ver perfil</Text>
                    <MaterialIcons name="arrow-forward" size={14} color="#FFF" />
                  </LinearGradient>
                </TouchableOpacity>
              </View>
            ))}
          </View>
        )
      ) : (
        <EmptyState tab="buscar" />
      )}
    </>
  );

  // ─── Loading State ───
  if (vm.isLoading) {
    return (
      <SafeAreaView style={styles.safe} edges={["top"]}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.primary} />
          <Text style={styles.loadingText}>Cargando...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <View style={styles.headerIconWrap}>
            <MaterialIcons name="group" size={22} color={COLORS.primary} />
          </View>
          <Text style={styles.headerTitle}>Social</Text>
        </View>
      </View>

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
            tintColor={COLORS.primary}
            colors={[COLORS.primary]}
          />
        }
        showsVerticalScrollIndicator={false}
      >
        <TabBar
          activeTab={vm.activeTab}
          onTabChange={vm.handleTabChange}
          pendientes={vm.solicitudesRecibidas.length}
        />

        {vm.activeTab === "contactos" && renderContactosTab()}
        {vm.activeTab === "solicitudes" && renderSolicitudesTab()}
        {vm.activeTab === "buscar" && renderBuscarTab()}
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

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.background },

  // Header
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: COLORS.surfaceContainerLow,
  },
  headerLeft: { flexDirection: "row", alignItems: "center", gap: 10 },
  headerIconWrap: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: COLORS.primaryTint,
    alignItems: "center",
    justifyContent: "center",
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: COLORS.primary,
    letterSpacing: -0.3,
  },

  // ScrollView
  scrollView: { flex: 1 },
  scrollContent: { padding: 16, paddingBottom: 100, gap: 24 },

  // Tab Bar
  tabBar: {
    flexDirection: "row",
    gap: 6,
    padding: 4,
    backgroundColor: COLORS.surfaceContainer,
    borderRadius: 28,
  },
  tab: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: 6,
  },
  tabActive: { backgroundColor: COLORS.primary },
  tabText: { fontSize: 13, fontWeight: "600", color: COLORS.textSecondary },
  tabTextActive: { color: "#FFF", fontWeight: "700" },
  tabBadge: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: COLORS.error,
  },
  tabBadgeText: { display: "none" } as any,

  // Stats Row
  statsRow: { flexDirection: "row", gap: 10 },
  statCard: {
    flex: 1,
    paddingVertical: 16,
    paddingHorizontal: 8,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  statCardDefault: { backgroundColor: COLORS.surface },
  statCardPrimary: { backgroundColor: COLORS.primaryContainer },
  statCardMuted: { backgroundColor: COLORS.surfaceContainerLow },
  statValue: { fontSize: 24, fontWeight: "800" },
  statLabel: {
    fontSize: 10,
    fontWeight: "700",
    color: COLORS.textMuted,
    letterSpacing: 1.2,
    marginTop: 2,
  },

  // Sections
  sectionBlock: { gap: 12 },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  sectionTitle: { fontSize: 17, fontWeight: "700", color: COLORS.text },

  // Contact Card
  contactList: { gap: 10 },
  contactCard: {
    backgroundColor: COLORS.surface,
    padding: 14,
    borderRadius: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  contactCardInner: { flexDirection: "row", alignItems: "center", gap: 12, flex: 1 },
  contactInfo: { flex: 1 },
  contactName: { fontSize: 15, fontWeight: "700", color: COLORS.text },
  contactMateria: { fontSize: 12, fontWeight: "500", color: COLORS.textMuted, marginTop: 2 },
  contactActions: { flexDirection: "row", gap: 6 },
  contactActionBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: COLORS.surfaceContainerHigh,
    alignItems: "center",
    justifyContent: "center",
  },

  // Avatar
  avatar: {
    backgroundColor: COLORS.primary,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarText: { color: "#FFF", fontWeight: "700" },
  onlineDot: {
    position: "absolute",
    width: 12,
    height: 12,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: "#FFF",
  },

  // Solicitud Card
  solicitudList: { gap: 12 },
  solicitudCard: {
    backgroundColor: COLORS.surface,
    padding: 16,
    borderRadius: 16,
  },
  solicitudHeader: { flexDirection: "row", alignItems: "center", gap: 12, marginBottom: 12 },
  solicitudInfo: { flex: 1 },
  solicitudMsgBubble: {
    backgroundColor: COLORS.surfaceContainerLow,
    borderTopRightRadius: 16,
    borderBottomRightRadius: 16,
    borderBottomLeftRadius: 16,
    padding: 12,
    marginBottom: 14,
    flexDirection: "row",
    gap: 8,
    alignItems: "flex-start",
  },
  solicitudMsgText: {
    flex: 1,
    fontSize: 13,
    color: COLORS.textSecondary,
    fontStyle: "italic",
    lineHeight: 18,
  },
  solicitudBtns: { flexDirection: "row", gap: 10 },
  btnAceptar: { flex: 1 },
  btnGradient: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    paddingVertical: 12,
    borderRadius: 24,
  },
  btnAceptarText: { color: "#FFF", fontWeight: "700", fontSize: 14 },
  btnRechazar: {
    flex: 1,
    backgroundColor: COLORS.surfaceContainerHigh,
    paddingVertical: 12,
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
  },
  btnRechazarText: { color: COLORS.textSecondary, fontWeight: "700", fontSize: 14 },

  // Sub Tabs
  subTabRow: { flexDirection: "row", gap: 10 },
  subTab: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 24,
    backgroundColor: COLORS.surfaceContainerLow,
  },
  subTabActive: { backgroundColor: COLORS.surfaceContainerHighest },
  subTabText: { fontWeight: "600", fontSize: 14, color: COLORS.textSecondary },
  subTabTextActive: { fontWeight: "700", color: COLORS.primary },
  subTabBadge: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: COLORS.primary,
    alignItems: "center",
    justifyContent: "center",
  },
  subTabBadgeText: { color: "#FFF", fontSize: 10, fontWeight: "700" },

  // Search Tab
  searchHero: {
    fontSize: 28,
    fontWeight: "800",
    color: COLORS.text,
    letterSpacing: -0.5,
    lineHeight: 34,
  },
  searchHeroAccent: { color: COLORS.primary },
  searchBarWrap: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.surface,
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 14,
    gap: 10,
    ...Platform.select({
      web: { boxShadow: "0px 24px 48px rgba(0,72,132,0.04)" } as any,
      default: {
        shadowColor: "#004884",
        shadowOffset: { width: 0, height: 12 },
        shadowOpacity: 0.04,
        shadowRadius: 24,
        elevation: 2,
      },
    }),
  },
  searchInput: { flex: 1, fontSize: 16, fontWeight: "500", color: COLORS.text },
  filterChips: { flexDirection: "row", gap: 8, flexWrap: "wrap" },
  chip: {
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 24,
    backgroundColor: COLORS.surfaceContainerHigh,
  },
  chipActive: { backgroundColor: COLORS.primary },
  chipText: { fontSize: 13, fontWeight: "600", color: COLORS.textSecondary },
  chipTextActive: { color: "#FFF", fontWeight: "700" },

  // Search Results
  searchResults: { gap: 12 },
  searchResultsDesktop: { flexDirection: "row", flexWrap: "wrap" },
  searchResultCard: {
    backgroundColor: COLORS.surface,
    padding: 16,
    borderRadius: 16,
    gap: 14,
  },
  searchResultHeader: { flexDirection: "row", alignItems: "center", gap: 12 },
  connectBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    paddingVertical: 12,
    borderRadius: 24,
  },
  connectBtnText: { color: "#FFF", fontWeight: "700", fontSize: 14 },

  // Empty State
  emptyState: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 48,
    gap: 12,
  },
  emptyIconWrap: {
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: COLORS.surfaceContainerHigh,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 8,
  },
  emptyTitle: { fontSize: 18, fontWeight: "700", color: COLORS.text },
  emptySubtitle: {
    fontSize: 14,
    color: COLORS.textMuted,
    textAlign: "center",
    lineHeight: 20,
    maxWidth: 280,
  },

  // Loading
  loadingContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
  },
  loadingText: { fontSize: 14, color: COLORS.textMuted },

  // Profile Bottom Sheet
  sheetBackdrop: {
    flex: 1,
    backgroundColor: "rgba(23,28,33,0.2)",
    justifyContent: "flex-end",
  },
  sheetContainer: {
    backgroundColor: COLORS.surface,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    ...Platform.select({
      web: { boxShadow: "0px -4px 24px rgba(0,72,132,0.1)" } as any,
      default: {
        shadowColor: "#004884",
        shadowOffset: { width: 0, height: -4 },
        shadowOpacity: 0.1,
        shadowRadius: 24,
        elevation: 10,
      },
    }),
  },
  sheetHandle: {
    width: 48,
    height: 5,
    borderRadius: 3,
    backgroundColor: COLORS.outlineVariant,
    alignSelf: "center",
    marginTop: 12,
    marginBottom: 16,
    opacity: 0.3,
  },
  sheetProfile: { alignItems: "center", paddingHorizontal: 24, paddingBottom: 20, gap: 6 },
  sheetName: { fontSize: 22, fontWeight: "700", color: COLORS.text, marginTop: 12 },
  sheetInstitution: { fontSize: 14, fontWeight: "500", color: COLORS.textSecondary },
  sheetStats: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-around",
    backgroundColor: COLORS.surfaceContainerLow,
    borderRadius: 16,
    padding: 16,
    marginHorizontal: 24,
    marginBottom: 20,
  },
  sheetStatItem: { alignItems: "center" },
  sheetStatValue: { fontSize: 18, fontWeight: "800", color: COLORS.primary },
  sheetStatLabel: {
    fontSize: 10,
    fontWeight: "600",
    color: COLORS.textMuted,
    letterSpacing: 0.5,
    marginTop: 2,
  },
  sheetStatDivider: {
    width: 1,
    height: 24,
    backgroundColor: COLORS.outlineVariant,
    opacity: 0.2,
  },
  sheetInfoCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    padding: 14,
    backgroundColor: COLORS.surfaceContainerHigh,
    borderRadius: 12,
    marginHorizontal: 24,
    marginBottom: 10,
    opacity: 0.9,
  },
  sheetInfoIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.surface,
    alignItems: "center",
    justifyContent: "center",
  },
  sheetInfoLabel: {
    fontSize: 10,
    fontWeight: "600",
    color: COLORS.textMuted,
    letterSpacing: 0.5,
  },
  sheetInfoValue: { fontSize: 14, fontWeight: "500", color: COLORS.text, marginTop: 2 },
  sheetActions: { padding: 24, gap: 10 },
  sheetPrimaryBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 16,
    borderRadius: 28,
    ...Platform.select({
      web: { boxShadow: "0px 8px 16px rgba(0,69,128,0.2)" } as any,
      default: {
        shadowColor: COLORS.primary,
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.2,
        shadowRadius: 16,
        elevation: 4,
      },
    }),
  },
  sheetPrimaryBtnText: { color: "#FFF", fontWeight: "700", fontSize: 15 },
  sheetSecondaryBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 16,
    borderRadius: 28,
    backgroundColor: COLORS.errorTint,
  },
  sheetSecondaryBtnText: { color: COLORS.error, fontWeight: "700", fontSize: 15 },
});

export default SocialScreen;
