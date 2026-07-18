import React from "react";
import {
  Pressable,
  View,
  Text,
  StyleSheet,
  ScrollView,
  StatusBar,
  TextInput,
} from "react-native";
import { useBreakpoint } from "../../hooks/useBreakpoint";
import { SafeAreaView } from "react-native-safe-area-context";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { COLORS, Carrera } from "../../../types";
import { useCrearGrupoViewModel } from "../../hooks/useCrearGrupoViewModel";
import { isWeb } from "../../utils/responsive";
import { useGrupos } from "../../hooks/useGrupos";

/**
 * Pantalla para Crear un Nuevo Grupo (View)
 * Solo JSX y StyleSheet - la logica vive en useCrearGrupoViewModel
 */
const CrearGrupoScreen: React.FC = () => {
  const { width } = useBreakpoint();
  const wideLayout = width >= 900;

  const {
    modo,
    nombre,
    setNombre,
    materia,
    setMateria,
    carrera,
    setCarrera,
    semestre,
    setSemestre,
    periodo,
    setPeriodo,
    horario,
    setHorario,
    validationError,
    isSaving,
    handleCrearGrupo,
    handleCancelar,
  } = useCrearGrupoViewModel();

  const { syncStatus, pendingSyncCount, isOnline, sincronizarGrupos } = useGrupos();

  const syncLabel = !isOnline
    ? "Sin conexión"
    : syncStatus === "syncing"
      ? "Sincronizando cambios con la nube..."
      : pendingSyncCount > 0
        ? `${pendingSyncCount} pendientes`
        : "Sincronizado";

  return (
    <View style={styles.container}>
      <StatusBar backgroundColor={COLORS.background} barStyle="dark-content" />

      <SafeAreaView style={styles.safeArea}>
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <Text style={styles.title}>
            {modo === "editar" ? "Editar Grupo" : "Crear Nuevo Grupo"}
          </Text>
          <Text style={styles.subtitle}>
            {modo === "editar"
              ? "Actualiza la información del grupo seleccionado para mantener tus registros al día."
              : "Completa la información base para registrar el grupo."}
          </Text>

          <View style={styles.syncRow}>
            <View
              style={[
                styles.syncBadge,
                !isOnline
                  ? styles.syncOffline
                  : syncStatus === "error"
                    ? styles.syncError
                    : pendingSyncCount > 0
                      ? styles.syncPending
                      : styles.syncOk,
              ]}
            >
              <MaterialIcons
                name={!isOnline ? "cloud-off" : pendingSyncCount > 0 ? "cloud-upload" : "sync"}
                size={14}
                color={
                  !isOnline
                    ? "#B87424"
                    : syncStatus === "error"
                      ? COLORS.dangerDark
                      : pendingSyncCount > 0
                        ? COLORS.primaryDark
                        : COLORS.successLight
                }
              />
              <Text style={styles.syncText}>{syncLabel}</Text>
            </View>

            <Pressable
              style={({ pressed }) => [
                styles.syncButton,
                (!isOnline || syncStatus === "syncing") && styles.syncButtonDisabled,
                pressed && { opacity: 0.6 },
              ]}
              onPress={() => void sincronizarGrupos()}
              disabled={!isOnline || syncStatus === "syncing"}
            >
              <MaterialIcons name="sync" size={16} color={COLORS.primary} />
              <Text style={styles.syncButtonText}>Sincronizar ahora</Text>
            </Pressable>
          </View>

          {/* Formulario */}
          <View style={[styles.form, wideLayout && styles.formWide]}>
            {/* Nombre del grupo */}
            <View style={styles.inputContainer}>
              <Text style={styles.label}>Nombre del Grupo *</Text>
              <TextInput
                style={styles.input}
                placeholder="Ej: 7A - Matemáticas Avanzadas"
                value={nombre}
                onChangeText={setNombre}
                placeholderTextColor={COLORS.textSecondary}
              />
            </View>

            {/* Materia */}
            <View style={styles.inputContainer}>
              <Text style={styles.label}>Materia *</Text>
              <TextInput
                style={styles.input}
                placeholder="Ej: Matemáticas Avanzadas"
                value={materia}
                onChangeText={setMateria}
                placeholderTextColor={COLORS.textSecondary}
              />
            </View>

            {/* Carrera */}
            <View style={styles.inputContainer}>
              <Text style={styles.label}>Carrera *</Text>
              <View style={styles.carreraContainer}>
                {(["ISC", "IGE", "ARQ", "ITICS"] as Carrera[]).map((c) => (
                  <Pressable
                    key={c}
                    style={({ pressed }) => [
                      styles.carreraButton,
                      carrera === c && styles.carreraButtonActive,
                      pressed && { opacity: 0.6 },
                    ]}
                    onPress={() => setCarrera(c)}
                  >
                    <Text
                      style={[
                        styles.carreraButtonText,
                        carrera === c && styles.carreraButtonTextActive,
                      ]}
                    >
                      {c}
                    </Text>
                  </Pressable>
                ))}
              </View>
            </View>

            {/* Semestre */}
            <View style={styles.inputContainer}>
              <Text style={styles.label}>Semestre *</Text>
              <TextInput
                style={styles.input}
                placeholder="Ej: 7"
                value={semestre}
                onChangeText={setSemestre}
                keyboardType="numeric"
                placeholderTextColor={COLORS.textSecondary}
              />
            </View>

            {/* Periodo */}
            <View style={styles.inputContainer}>
              <Text style={styles.label}>Periodo *</Text>
              <TextInput
                style={styles.input}
                placeholder="Ej: Enero-Junio 2024"
                value={periodo}
                onChangeText={setPeriodo}
                placeholderTextColor={COLORS.textSecondary}
              />
            </View>

            {/* Horario (opcional) */}
            <View style={styles.inputContainer}>
              <Text style={styles.label}>Horario (Opcional)</Text>
              <TextInput
                style={styles.input}
                placeholder="Ej: Lun-Mie-Vie 7:00-9:00"
                value={horario}
                onChangeText={setHorario}
                placeholderTextColor={COLORS.textSecondary}
              />
            </View>

            {/* Botones de acción */}
            {validationError ? <Text style={styles.errorText}>{validationError}</Text> : null}

            <Pressable
              style={({ pressed }) => [
                styles.submitButton,
                isSaving && styles.submitButtonDisabled,
                pressed && { opacity: 0.8 },
              ]}
              onPress={() => void handleCrearGrupo()}
              disabled={isSaving}
            >
              <MaterialIcons name="check-circle" size={24} color="white" />
              <Text style={styles.submitButtonText}>
                {isSaving ? "Guardando..." : modo === "editar" ? "Guardar cambios" : "Crear Grupo"}
              </Text>
            </Pressable>

            <Pressable
              style={({ pressed }) => [styles.cancelButton, pressed && { opacity: 0.8 }]}
              onPress={handleCancelar}
            >
              <Text style={styles.cancelButtonText}>Cancelar</Text>
            </Pressable>
          </View>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
};

/**
 * Estilos del componente
 */
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  safeArea: {
    flex: 1,
  },
  scrollContent: {
    width: "100%",
    maxWidth: 980,
    alignSelf: "center",
    paddingHorizontal: 16,
    paddingTop: 14,
    paddingBottom: isWeb() ? 28 : 110,
  },
  title: {
    fontSize: 34,
    fontWeight: "800",
    color: COLORS.text,
    letterSpacing: -0.4,
    marginBottom: 2,
  },
  subtitle: {
    fontSize: 15,
    color: COLORS.textSecondary,
    marginBottom: 14,
  },
  syncRow: {
    marginBottom: 10,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 8,
  },
  syncBadge: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderWidth: 1,
    gap: 6,
  },
  syncOk: {
    backgroundColor: COLORS.successTint,
    borderColor: "#B8EAD8",
  },
  syncPending: {
    backgroundColor: COLORS.primaryTint,
    borderColor: "#CAE1FB",
  },
  syncError: {
    backgroundColor: COLORS.errorTint,
    borderColor: COLORS.errorTint,
  },
  syncOffline: {
    backgroundColor: "#FFF5E9",
    borderColor: "#F5D7B0",
  },
  syncText: {
    fontSize: 12,
    fontWeight: "700",
    color: COLORS.text,
  },
  syncButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    borderWidth: 1,
    borderColor: COLORS.borderLight,
    backgroundColor: COLORS.surface,
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  syncButtonDisabled: {
    opacity: 0.6,
  },
  syncButtonText: {
    fontSize: 12,
    fontWeight: "700",
    color: COLORS.primary,
  },
  form: {
    gap: 12,
    backgroundColor: COLORS.surface,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: 14,
    boxShadow: "0px 10px 22px rgba(33, 60, 109, 0.08)",
  },
  formWide: {
    paddingHorizontal: 18,
    paddingVertical: 18,
  },
  inputContainer: {
    marginBottom: 2,
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
    color: COLORS.text,
    marginBottom: 6,
  },
  input: {
    backgroundColor: COLORS.backgroundSoft,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 15,
    color: COLORS.text,
    borderWidth: 1,
    borderColor: COLORS.borderLight,
  },
  carreraContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  carreraButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: COLORS.primary,
    backgroundColor: COLORS.surface,
  },
  carreraButtonActive: {
    backgroundColor: COLORS.primary,
  },
  carreraButtonText: {
    fontSize: 14,
    color: COLORS.primary,
    fontWeight: "600",
  },
  carreraButtonTextActive: {
    color: "white",
  },
  submitButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: COLORS.primary,
    paddingVertical: 13,
    paddingHorizontal: 20,
    borderRadius: 12,
    marginTop: 10,
    boxShadow: "0px 8px 18px rgba(22, 118, 210, 0.32)",
  },
  submitButtonDisabled: {
    opacity: 0.7,
  },
  submitButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
    marginLeft: 8,
  },
  errorText: {
    color: COLORS.dangerDark,
    fontSize: 13,
    fontWeight: "600",
    backgroundColor: COLORS.errorTint,
    borderWidth: 1,
    borderColor: COLORS.errorTint,
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 8,
  },
  cancelButton: {
    alignItems: "center",
    paddingVertical: 10,
    borderRadius: 10,
    backgroundColor: "#F3F7FD",
  },
  cancelButtonText: {
    fontSize: 14,
    color: COLORS.textSecondary,
    fontWeight: "600",
  },
});

export default CrearGrupoScreen;
