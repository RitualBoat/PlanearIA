import React, { useState } from "react";
import { Pressable, View, Text, StyleSheet, Modal, FlatList, TextInput } from "react-native";
import { Image } from "expo-image";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { COLORS } from "../../../types";
import { useContactos } from "../../context/ContactosContext";
import type { Contacto } from "../../../types";

interface Props {
  visible: boolean;
  onClose: () => void;
  onSelect: (contacto: Contacto) => void;
}

export const ModalSelectorContactos: React.FC<Props> = ({ visible, onClose, onSelect }) => {
  const { contactos } = useContactos();
  const [search, setSearch] = useState("");

  const filteredContactos = contactos.filter(
    (c) => c.estado === "aceptada" && c.nombre.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <Pressable style={styles.backdrop} onPress={onClose} />

        <View style={styles.sheet}>
          <View style={styles.header}>
            <Text style={styles.title}>Seleccionar contacto</Text>
            <Pressable
              onPress={onClose}
              style={({ pressed }) => [styles.closeButton, pressed && { opacity: 0.6 }]}
            >
              <MaterialIcons name="close" size={24} color={COLORS.textSecondary} />
            </Pressable>
          </View>

          <View style={styles.searchContainer}>
            <MaterialIcons name="search" size={20} color={COLORS.textSecondary} />
            <TextInput
              style={styles.searchInput}
              placeholder="Buscar contactos..."
              value={search}
              onChangeText={setSearch}
            />
          </View>

          <FlatList
            data={filteredContactos}
            keyExtractor={(item) => item.id.toString()}
            style={styles.list}
            renderItem={({ item }) => (
              <Pressable
                style={({ pressed }) => [styles.contactItem, pressed && { opacity: 0.6 }]}
                onPress={() => {
                  onSelect(item);
                  onClose();
                }}
              >
                {item.avatar ? (
                  <Image source={{ uri: item.avatar }} style={styles.avatar} />
                ) : (
                  <View style={styles.avatarPlaceholder}>
                    <MaterialIcons name="person" size={24} color={COLORS.textSecondary} />
                  </View>
                )}
                <View style={styles.contactInfo}>
                  <Text style={styles.contactName}>{item.nombre}</Text>
                </View>
                <MaterialIcons name="send" size={20} color={COLORS.primary} />
              </Pressable>
            )}
            ListEmptyComponent={() => (
              <View style={styles.emptyContainer}>
                <Text style={styles.emptyText}>No se encontraron contactos</Text>
              </View>
            )}
          />
        </View>
      </View>
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
    height: "70%",
    paddingTop: 16,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.borderLight,
  },
  title: {
    fontSize: 18,
    fontWeight: "600",
    color: COLORS.text,
  },
  closeButton: {
    padding: 4,
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.surfaceSecondary,
    margin: 16,
    paddingHorizontal: 12,
    borderRadius: 8,
    height: 40,
  },
  searchInput: {
    flex: 1,
    marginLeft: 8,
    fontSize: 16,
    color: COLORS.text,
  },
  list: {
    flex: 1,
  },
  contactItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.borderLight,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
  },
  avatarPlaceholder: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: COLORS.borderLight,
    justifyContent: "center",
    alignItems: "center",
  },
  contactInfo: {
    flex: 1,
    marginLeft: 16,
  },
  contactName: {
    fontSize: 16,
    fontWeight: "500",
    color: COLORS.text,
  },
  emptyContainer: {
    padding: 24,
    alignItems: "center",
  },
  emptyText: {
    color: COLORS.textSecondary,
    fontSize: 14,
  },
});
