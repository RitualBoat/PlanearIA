import React from "react";
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import { StackNavigationProp } from "@react-navigation/stack";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { RootStackParamList } from "../../navigation/StackNavigator";
import { useAuth } from "../../context/AuthContext";
import { COLORS } from "../../../types";

type Nav = StackNavigationProp<RootStackParamList>;

const PerfilScreen: React.FC = () => {
  const navigation = useNavigation<Nav>();
  const { usuario, isGuest } = useAuth();

  const userName = usuario
    ? `${usuario.nombre}${usuario.apellidos ? ` ${usuario.apellidos}` : ""}`
    : "Usuario";
  const userRole = isGuest ? "Invitado" : usuario?.rol === "admin" ? "Administrador" : "Docente";

  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* Header con botón atrás */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
            <MaterialIcons name="arrow-back" size={24} color={COLORS.text} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Mi Perfil</Text>
          <View style={{ width: 40 }} />
        </View>

        {/* Portada + Avatar */}
        <View style={styles.coverArea}>
          <View style={styles.coverPlaceholder}>
            <MaterialIcons name="photo-camera" size={28} color={COLORS.textMuted} />
          </View>
          <View style={styles.avatarWrap}>
            <View style={styles.avatar}>
              <MaterialIcons name="person" size={40} color={COLORS.surface} />
            </View>
          </View>
        </View>

        {/* Info del usuario */}
        <View style={styles.infoSection}>
          <Text style={styles.userName}>{userName}</Text>
          <Text style={styles.userRole}>{userRole}</Text>
          {usuario?.email ? <Text style={styles.userEmail}>{usuario.email}</Text> : null}
        </View>

        {/* Estadísticas placeholder */}
        <View style={styles.statsRow}>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>—</Text>
            <Text style={styles.statLabel}>Planeaciones</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>—</Text>
            <Text style={styles.statLabel}>Grupos</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>—</Text>
            <Text style={styles.statLabel}>Recursos</Text>
          </View>
        </View>

        {/* Acciones */}
        {!isGuest && (
          <TouchableOpacity
            style={styles.actionBtn}
            onPress={() => navigation.navigate("EditarPerfil")}
          >
            <MaterialIcons name="edit" size={18} color={COLORS.primary} />
            <Text style={styles.actionBtnText}>Editar perfil</Text>
          </TouchableOpacity>
        )}

        <View style={styles.placeholderNote}>
          <Text style={styles.placeholderNoteText}>
            Las estadísticas reales se conectarán en el Sprint 1
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.background },
  scroll: { paddingBottom: 40 },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.surfaceTertiary,
    alignItems: "center",
    justifyContent: "center",
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: COLORS.text,
  },
  coverArea: {
    height: 160,
    position: "relative",
    marginBottom: 50,
  },
  coverPlaceholder: {
    flex: 1,
    backgroundColor: COLORS.primaryTint,
    alignItems: "center",
    justifyContent: "center",
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
  },
  avatarWrap: {
    position: "absolute",
    bottom: -40,
    alignSelf: "center",
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: COLORS.primaryMuted,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 4,
    borderColor: COLORS.surface,
  },
  infoSection: {
    alignItems: "center",
    paddingHorizontal: 16,
    gap: 4,
    marginBottom: 20,
  },
  userName: {
    fontSize: 22,
    fontWeight: "800",
    color: COLORS.text,
  },
  userRole: {
    fontSize: 14,
    fontWeight: "600",
    color: COLORS.primary,
  },
  userEmail: {
    fontSize: 13,
    color: COLORS.textMuted,
  },
  statsRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: COLORS.surface,
    marginHorizontal: 16,
    borderRadius: 16,
    paddingVertical: 16,
    paddingHorizontal: 20,
    gap: 0,
    borderWidth: 1,
    borderColor: "#E2EAF4",
  },
  statItem: {
    flex: 1,
    alignItems: "center",
    gap: 4,
  },
  statDivider: {
    width: 1,
    height: 30,
    backgroundColor: "#E2EAF4",
  },
  statNumber: {
    fontSize: 20,
    fontWeight: "800",
    color: COLORS.text,
  },
  statLabel: {
    fontSize: 12,
    fontWeight: "600",
    color: COLORS.textMuted,
  },
  actionBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: COLORS.primaryTint,
    marginHorizontal: 16,
    marginTop: 16,
    paddingVertical: 14,
    borderRadius: 14,
  },
  actionBtnText: {
    fontSize: 15,
    fontWeight: "700",
    color: COLORS.primary,
  },
  placeholderNote: {
    alignItems: "center",
    marginTop: 30,
    paddingHorizontal: 16,
  },
  placeholderNoteText: {
    fontSize: 13,
    color: COLORS.textMuted,
    fontStyle: "italic",
    textAlign: "center",
  },
});

export default PerfilScreen;
