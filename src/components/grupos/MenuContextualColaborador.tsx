import React from "react";
import { View, Text, StyleSheet, Modal, TouchableOpacity, Platform } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { colors } from "../../themes/colors";

import { GrupoMiembro, RolGrupo } from "../../../types";

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
              <MaterialIcons name="close" size={20} color={colors.onSurfaceVariant} />
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
              <MaterialIcons name="person-remove" size={20} color={colors.error} />
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
    backgroundColor: "rgba(26, 26, 26, 0.4)",
  },
  sheet: {
    width: "100%",
    maxWidth: 400,
    backgroundColor: colors.surfaceContainerLowest,
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
    borderBottomColor: colors.outlineVariant + "40",
  },
  title: {
    fontSize: 18,
    fontWeight: "500",
    color: colors.onSurface,
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    fontWeight: "400",
    color: colors.onSurfaceVariant,
  },
  closeButton: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: colors.surfaceContainerLow,
  },
  content: {
    padding: 24,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: "500",
    color: colors.onSurfaceVariant,
    marginBottom: 16,
  },
  roleOption: {
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.outlineVariant + "40",
    marginBottom: 12,
  },
  roleOptionActive: {
    backgroundColor: colors.primaryFixed,
    borderColor: colors.primaryFixed,
  },
  roleTitle: {
    fontSize: 16,
    fontWeight: "400",
    fontWeight: "600",
    color: colors.onSurface,
    marginBottom: 4,
  },
  roleDesc: {
    fontSize: 14,
    fontWeight: "400",
    color: colors.onSurfaceVariant,
    fontSize: 13,
  },
  divider: {
    height: 1,
    backgroundColor: colors.outlineVariant + "40",
    marginVertical: 16,
  },
  removeButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: 16,
    borderRadius: 12,
    backgroundColor: colors.errorContainer,
  },
  removeText: {
    fontWeight: "500",
    fontSize: 15,
    color: colors.onErrorContainer,
    marginLeft: 8,
  },
});
