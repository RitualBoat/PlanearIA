import React, { useState } from "react";
import { View, Text, StyleSheet, Modal, TouchableOpacity, TextInput, ScrollView, KeyboardAvoidingView, Platform, ActivityIndicator } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { colors } from "../../themes/colors";
import { typography } from "../../themes/typography";
import { RolGrupo } from "../../../types";

interface Props {
  visible: boolean;
  onClose: () => void;
  onInvite: (email: string, rol: RolGrupo) => Promise<void>;
  grupoNombre: string;
}

export const ModalInvitacionColaborador: React.FC<Props> = ({ visible, onClose, onInvite, grupoNombre }) => {
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
      <MaterialIcons name="check-circle" size={64} color={colors.primary} />
      <Text style={styles.successTitle}>¡Invitación Enviada!</Text>
      <Text style={styles.successText}>Se ha enviado un correo a {email} para unirse a {grupoNombre}.</Text>
    </View>
  );

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <KeyboardAvoidingView 
        style={styles.overlay} 
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <TouchableOpacity style={styles.backdrop} onPress={onClose} activeOpacity={1} />
        
        <View style={styles.sheet}>
          <View style={styles.dragHandleContainer}>
            <View style={styles.dragHandle} />
          </View>
          
          <View style={styles.header}>
            <Text style={styles.title}>Invitar Colaborador</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <MaterialIcons name="close" size={20} color={colors.onSurfaceVariant} />
            </TouchableOpacity>
          </View>

          {success ? renderSuccess() : (
            <ScrollView style={styles.content} keyboardShouldPersistTaps="handled">
              
              <View style={styles.inputGroup}>
                <Text style={styles.label}>CORREO ELECTRÓNICO</Text>
                <View style={styles.searchContainer}>
                  <MaterialIcons name="search" size={20} color={colors.onSurfaceVariant} style={styles.searchIcon} />
                  <TextInput
                    style={styles.input}
                    placeholder="ejemplo@escuela.edu"
                    placeholderTextColor={colors.outlineVariant}
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
                  <TouchableOpacity 
                    style={[styles.roleButton, rol === "co-docente" && styles.roleButtonActive]}
                    onPress={() => setRol("co-docente")}
                  >
                    <Text style={[styles.roleText, rol === "co-docente" && styles.roleTextActive]}>Co-docente</Text>
                  </TouchableOpacity>
                  <TouchableOpacity 
                    style={[styles.roleButton, rol === "ponente_invitado" && styles.roleButtonActive]}
                    onPress={() => setRol("ponente_invitado")}
                  >
                    <Text style={[styles.roleText, rol === "ponente_invitado" && styles.roleTextActive]}>Ponente</Text>
                  </TouchableOpacity>
                </View>
                <Text style={styles.roleDescription}>
                  {rol === "co-docente" 
                    ? "Los co-docentes pueden editar planeaciones y gestionar recursos del grupo."
                    : "Los ponentes invitados solo pueden ver las planeaciones y subir sus propios recursos."}
                </Text>
              </View>

              <View style={styles.emptyState}>
                <View style={styles.emptyStateIcon}>
                  <MaterialIcons name="person-add" size={24} color={colors.secondary} />
                </View>
                <Text style={styles.emptyStateText}>Ingresa el correo del docente</Text>
                <Text style={styles.emptyStateSubtext}>Se le notificará para que acepte la invitación</Text>
              </View>

              <TouchableOpacity 
                style={[styles.inviteButton, (!email.includes("@") || loading) && styles.inviteButtonDisabled]}
                onPress={handleInvite}
                disabled={!email.includes("@") || loading}
              >
                {loading ? (
                  <ActivityIndicator color={colors.onPrimaryContainer} />
                ) : (
                  <>
                    <MaterialIcons name="person-add" size={20} color={colors.onPrimaryContainer} style={{ marginRight: 8 }} />
                    <Text style={styles.inviteButtonText}>Enviar Invitación</Text>
                  </>
                )}
              </TouchableOpacity>
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
    backgroundColor: "rgba(26, 26, 26, 0.4)",
  },
  sheet: {
    backgroundColor: colors.surface,
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
    backgroundColor: colors.outlineVariant,
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
    ...typography.titleLg,
    color: colors.onSurface,
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
    ...typography.labelMd,
    color: colors.onSurfaceVariant,
    marginBottom: 8,
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.surfaceContainerLowest,
    borderWidth: 1,
    borderColor: "#D1E9FF",
    borderRadius: 8,
    paddingHorizontal: 12,
  },
  searchIcon: {
    marginRight: 8,
  },
  input: {
    flex: 1,
    ...typography.bodyLg,
    color: colors.onSurface,
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
    borderColor: colors.outlineVariant,
    alignItems: "center",
  },
  roleButtonActive: {
    backgroundColor: colors.primaryFixed,
    borderColor: colors.primaryFixed,
  },
  roleText: {
    ...typography.bodyMd,
    color: colors.onSurfaceVariant,
  },
  roleTextActive: {
    color: colors.onPrimaryFixed,
    fontWeight: "600",
  },
  roleDescription: {
    ...typography.bodyMd,
    color: colors.onSurfaceVariant,
    fontSize: 13,
  },
  emptyState: {
    alignItems: "center",
    padding: 24,
    backgroundColor: colors.surfaceBright,
    borderWidth: 2,
    borderColor: colors.surfaceVariant,
    borderStyle: "dashed",
    borderRadius: 12,
    marginBottom: 24,
  },
  emptyStateIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "rgba(186, 234, 255, 0.2)",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 12,
  },
  emptyStateText: {
    ...typography.bodyMd,
    color: colors.onSurfaceVariant,
    marginBottom: 4,
  },
  emptyStateSubtext: {
    ...typography.labelMd,
    color: colors.outline,
  },
  inviteButton: {
    backgroundColor: colors.primaryContainer,
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
    ...typography.titleLg,
    fontSize: 15,
    color: colors.onPrimaryContainer,
  },
  successContainer: {
    padding: 40,
    alignItems: "center",
    justifyContent: "center",
  },
  successTitle: {
    ...typography.headlineMd,
    color: colors.onSurface,
    marginTop: 16,
    marginBottom: 8,
  },
  successText: {
    ...typography.bodyLg,
    color: colors.onSurfaceVariant,
    textAlign: "center",
  },
});
