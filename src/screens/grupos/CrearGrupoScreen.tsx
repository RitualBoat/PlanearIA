import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  StatusBar,
  TextInput,
  useWindowDimensions,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { COLORS, Carrera } from "../../../types";
import { useCrearGrupoViewModel } from "../../hooks/useCrearGrupoViewModel";
import { isWeb } from "../../utils/responsive";

/**
 * Pantalla para Crear un Nuevo Grupo (View)
 * Solo JSX y StyleSheet - la logica vive en useCrearGrupoViewModel
 */
const CrearGrupoScreen: React.FC = () => {
  const { width } = useWindowDimensions();
  const wideLayout = width >= 900;

  const {
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
    handleCrearGrupo,
    handleCancelar,
  } = useCrearGrupoViewModel();

  return (
    <View style={styles.container}>
      <StatusBar backgroundColor="#EEF3FA" barStyle="dark-content" />

      <SafeAreaView style={styles.safeArea}>
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <Text style={styles.title}>Crear Nuevo Grupo</Text>
          <Text style={styles.subtitle}>Completa la información base para registrar el grupo.</Text>

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
                  <TouchableOpacity
                    key={c}
                    style={[styles.carreraButton, carrera === c && styles.carreraButtonActive]}
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
                  </TouchableOpacity>
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
            <TouchableOpacity
              style={styles.submitButton}
              onPress={handleCrearGrupo}
              activeOpacity={0.8}
            >
              <MaterialIcons name="check-circle" size={24} color="white" />
              <Text style={styles.submitButtonText}>Crear Grupo</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.cancelButton}
              onPress={handleCancelar}
              activeOpacity={0.8}
            >
              <Text style={styles.cancelButtonText}>Cancelar</Text>
            </TouchableOpacity>
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
    backgroundColor: "#EEF3FA",
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
    color: "#1E2A3A",
    letterSpacing: -0.4,
    marginBottom: 2,
  },
  subtitle: {
    fontSize: 15,
    color: "#5C6E86",
    marginBottom: 14,
  },
  form: {
    gap: 12,
    backgroundColor: "#FFFFFF",
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#E3EAF4",
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
    color: "#1E2A3A",
    marginBottom: 6,
  },
  input: {
    backgroundColor: "#F8FBFF",
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 15,
    color: "#1E2A3A",
    borderWidth: 1,
    borderColor: "#DCE6F3",
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
    backgroundColor: "#FFFFFF",
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
  submitButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
    marginLeft: 8,
  },
  cancelButton: {
    alignItems: "center",
    paddingVertical: 10,
    borderRadius: 10,
    backgroundColor: "#F3F7FD",
  },
  cancelButtonText: {
    fontSize: 14,
    color: "#5C6E86",
    fontWeight: "600",
  },
});

export default CrearGrupoScreen;
