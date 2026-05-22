import React from "react";
import { View, Text, StyleSheet, Modal, TouchableOpacity, Platform } from "react-native";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { COLORS } from "../../../types";
import type { GrupoMiembro, RolGrupo } from "../../../types";

interface Props {
  visible: boolean;
  colaborador: GrupoMiembro | null;
  onClose: () => void;
  onChangeRole: (newRole: RolGrupo) => void;
  onRemove: () => void;
}

export const MenuContextualColaborador: React.FC<Props> = ({ 
  visible, 
  colaborador, 
  onClose, 
  onChangeRole,
  onRemove 
}) => {
  if (!colaborador) return null;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <TouchableOpacity style={styles.backdrop} onPress={onClose} activeOpacity={1} />
        
        <View style={styles.sheet}>
          <View style={styles.header}>
            <View>
              <Text style={styles.title}>{colaborador.nombre}</Text>
              <Text style={styles.subtitle}>{colaborador.email}</Text>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <MaterialIcons name="close" size={20} color={COLORS.textSecondary} />
            </TouchableOpacity>
          </View>

          <View style={styles.content}>
            <Text style={styles.sectionTitle}>CAMBIAR ROL</Text>
            
            <TouchableOpacity 
              style={[styles.roleOption, colaborador.rol === "co-docente" && styles.roleOptionActive]}
              onPress={() => onChangeRole("co-docente")}
            >
              <View>
                <Text style={styles.roleTitle}>Co-docente</Text>
                <Text style={styles.roleDesc}>Puede editar planeaciones y gestionar recursos.</Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity 
              style={[styles.roleOption, colaborador.rol === "ponente_invitado" && styles.roleOptionActive]}
              onPress={() => onChangeRole("ponente_invitado")}
            >
              <View>
                <Text style={styles.roleTitle}>Ponente Invitado</Text>
                <Text style={styles.roleDesc}>Solo puede ver las planeaciones y subir sus propios recursos.</Text>
              </View>
            </TouchableOpacity>

            <View style={styles.divider} />

            <TouchableOpacity style={styles.removeButton} onPress={onRemove}>
              <MaterialIcons name="person-remove" size={20} color={COLORS.error} />
              <Text style={styles.removeText}>Eliminar Colaborador</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 16,
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: COLORS.overlay,
  },
  sheet: {
    width: "100%",
    maxWidth: 400,
    backgroundColor: COLORS.surface,
    borderRadius: 24,
    overflow: "hidden",
    elevation: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    padding: 24,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.borderLight,
  },
  title: {
    fontSize: 18,
    fontWeight: "500",
    color: COLORS.text,
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    fontWeight: "400",
    color: COLORS.textSecondary,
  },
  closeButton: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: COLORS.surfaceSecondary,
  },
  content: {
    padding: 24,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: "500",
    color: COLORS.textSecondary,
    marginBottom: 16,
  },
  roleOption: {
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.borderLight,
    marginBottom: 12,
  },
  roleOptionActive: {
    backgroundColor: COLORS.primaryTint,
    borderColor: COLORS.primaryLight,
  },
  roleTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: COLORS.text,
    marginBottom: 4,
  },
  roleDesc: {
    fontSize: 13,
    fontWeight: "400",
    color: COLORS.textSecondary,
  },
  divider: {
    height: 1,
    backgroundColor: COLORS.borderLight,
    marginVertical: 16,
  },
  removeButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: 16,
    borderRadius: 12,
    backgroundColor: COLORS.errorTint,
  },
  removeText: {
    fontWeight: "500",
    fontSize: 15,
    color: COLORS.error,
    marginLeft: 8,
  },
});
