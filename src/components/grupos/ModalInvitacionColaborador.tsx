import React, { useState } from "react";
import {
  Pressable,
  View,
  Text,
  StyleSheet,
  Modal,
  TextInput,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from "react-native";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { COLORS } from "../../../types";
import type { RolGrupo } from "../../../types";

interface Props {
  visible: boolean;
  onClose: () => void;
  onInvite: (email: string, rol: RolGrupo) => Promise<void>;
  grupoNombre: string;
}

export const ModalInvitacionColaborador: React.FC<Props> = ({
  visible,
  onClose,
  onInvite,
  grupoNombre,
}) => {
  const [email, setEmail] = useState("");
  const [rol, setRol] = useState<RolGrupo>("co-docente");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleInvite = async () => {
    if (!email.trim() || !email.includes("@")) return;

    setLoading(true);
    try {
      await onInvite(email.trim(), rol);
      setSuccess(true);
      setTimeout(() => {
        setSuccess(false);
        setEmail("");
        setRol("co-docente");
        onClose();
      }, 2000);
    } catch (error) {
      console.error(error);
      // Aqui podrías manejar el error
    } finally {
      setLoading(false);
    }
  };

  const renderSuccess = () => (
    <View style={styles.successContainer}>
      <MaterialIcons name="check-circle" size={64} color={COLORS.success} />
      <Text style={styles.successTitle}>¡Invitación Enviada!</Text>
      <Text style={styles.successText}>
        Se ha enviado un correo a {email} para unirse a {grupoNombre}.
      </Text>
    </View>
  );

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <KeyboardAvoidingView
        style={styles.overlay}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <Pressable style={styles.backdrop} onPress={onClose} />

        <View style={styles.sheet}>
          <View style={styles.dragHandleContainer}>
            <View style={styles.dragHandle} />
          </View>

          <View style={styles.header}>
            <Text style={styles.title}>Invitar Colaborador</Text>
            <Pressable
              onPress={onClose}
              style={({ pressed }) => [styles.closeButton, pressed && { opacity: 0.6 }]}
            >
              <MaterialIcons name="close" size={20} color={COLORS.textSecondary} />
            </Pressable>
          </View>

          {success ? (
            renderSuccess()
          ) : (
            <ScrollView style={styles.content} keyboardShouldPersistTaps="handled">
              <View style={styles.inputGroup}>
                <Text style={styles.label}>CORREO ELECTRÓNICO</Text>
                <View style={styles.searchContainer}>
                  <MaterialIcons
                    name="search"
                    size={20}
                    color={COLORS.textSecondary}
                    style={styles.searchIcon}
                  />
                  <TextInput
                    style={styles.input}
                    placeholder="ejemplo@escuela.edu"
                    placeholderTextColor={COLORS.textMuted}
                    value={email}
                    onChangeText={setEmail}
                    keyboardType="email-address"
                    autoCapitalize="none"
                  />
                </View>
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>ROL DEL COLABORADOR</Text>
                <View style={styles.rolesContainer}>
                  <Pressable
                    style={({ pressed }) => [
                      styles.roleButton,
                      rol === "co-docente" && styles.roleButtonActive,
                      pressed && { opacity: 0.6 },
                    ]}
                    onPress={() => setRol("co-docente")}
                  >
                    <Text style={[styles.roleText, rol === "co-docente" && styles.roleTextActive]}>
                      Co-docente
                    </Text>
                  </Pressable>
                  <Pressable
                    style={({ pressed }) => [
                      styles.roleButton,
                      rol === "ponente_invitado" && styles.roleButtonActive,
                      pressed && { opacity: 0.6 },
                    ]}
                    onPress={() => setRol("ponente_invitado")}
                  >
                    <Text
                      style={[styles.roleText, rol === "ponente_invitado" && styles.roleTextActive]}
                    >
                      Ponente
                    </Text>
                  </Pressable>
                </View>
                <Text style={styles.roleDescription}>
                  {rol === "co-docente"
                    ? "Los co-docentes pueden editar planeaciones y gestionar recursos del grupo."
                    : "Los ponentes invitados solo pueden ver las planeaciones y subir sus propios recursos."}
                </Text>
              </View>

              <View style={styles.emptyState}>
                <View style={styles.emptyStateIcon}>
                  <MaterialIcons name="person-add" size={24} color={COLORS.primary} />
                </View>
                <Text style={styles.emptyStateText}>Ingresa el correo del docente</Text>
                <Text style={styles.emptyStateSubtext}>
                  Se le notificará para que acepte la invitación
                </Text>
              </View>

              <Pressable
                style={({ pressed }) => [
                  styles.inviteButton,
                  (!email.includes("@") || loading) && styles.inviteButtonDisabled,
                  pressed && { opacity: 0.6 },
                ]}
                onPress={handleInvite}
                disabled={!email.includes("@") || loading}
              >
                {loading ? (
                  <ActivityIndicator color={COLORS.textOnPrimary} />
                ) : (
                  <>
                    <MaterialIcons
                      name="person-add"
                      size={20}
                      color={COLORS.textOnPrimary}
                      style={{ marginRight: 8 }}
                    />
                    <Text style={styles.inviteButtonText}>Enviar Invitación</Text>
                  </>
                )}
              </Pressable>
            </ScrollView>
          )}
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: "flex-end",
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: COLORS.overlay,
  },
  sheet: {
    backgroundColor: COLORS.surface,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: "90%",
    paddingBottom: Platform.OS === "ios" ? 34 : 24,
  },
  dragHandleContainer: {
    alignItems: "center",
    paddingTop: 12,
    paddingBottom: 4,
  },
  dragHandle: {
    width: 48,
    height: 6,
    borderRadius: 3,
    backgroundColor: COLORS.border,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginBottom: 8,
  },
  title: {
    fontSize: 18,
    fontWeight: "500",
    color: COLORS.text,
  },
  closeButton: {
    padding: 8,
    borderRadius: 20,
  },
  content: {
    paddingHorizontal: 16,
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 12,
    fontWeight: "500",
    color: COLORS.textSecondary,
    marginBottom: 8,
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.borderLight,
    borderRadius: 8,
    paddingHorizontal: 12,
  },
  searchIcon: {
    marginRight: 8,
  },
  input: {
    flex: 1,
    fontSize: 16,
    fontWeight: "400",
    color: COLORS.text,
    paddingVertical: 12,
  },
  rolesContainer: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 8,
  },
  roleButton: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.border,
    alignItems: "center",
  },
  roleButtonActive: {
    backgroundColor: COLORS.primaryTint,
    borderColor: COLORS.primaryLight,
  },
  roleText: {
    fontSize: 14,
    fontWeight: "400",
    color: COLORS.textSecondary,
  },
  roleTextActive: {
    color: COLORS.primaryDark,
    fontWeight: "600",
  },
  roleDescription: {
    fontSize: 13,
    fontWeight: "400",
    color: COLORS.textSecondary,
  },
  emptyState: {
    alignItems: "center",
    padding: 24,
    backgroundColor: COLORS.backgroundSoft,
    borderWidth: 2,
    borderColor: COLORS.borderLight,
    borderStyle: "dashed",
    borderRadius: 12,
    marginBottom: 24,
  },
  emptyStateIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: COLORS.primaryTint,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 12,
  },
  emptyStateText: {
    fontSize: 14,
    fontWeight: "400",
    color: COLORS.textSecondary,
    marginBottom: 4,
  },
  emptyStateSubtext: {
    fontSize: 12,
    fontWeight: "500",
    color: COLORS.textMuted,
  },
  inviteButton: {
    backgroundColor: COLORS.primary,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 16,
    borderRadius: 12,
    marginTop: 8,
  },
  inviteButtonDisabled: {
    opacity: 0.5,
  },
  inviteButtonText: {
    fontWeight: "500",
    fontSize: 15,
    color: COLORS.textOnPrimary,
  },
  successContainer: {
    padding: 40,
    alignItems: "center",
    justifyContent: "center",
  },
  successTitle: {
    fontSize: 24,
    fontWeight: "400",
    color: COLORS.text,
    marginTop: 16,
    marginBottom: 8,
  },
  successText: {
    fontSize: 16,
    fontWeight: "400",
    color: COLORS.textSecondary,
    textAlign: "center",
  },
});
