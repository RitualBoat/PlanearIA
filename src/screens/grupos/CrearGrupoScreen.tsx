import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  StatusBar,
  TextInput,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { COLORS, FONT_SIZES, Carrera } from "../../../types";
import BottomNavBar from "../../components/BottomNavBar";
import { useCrearGrupoViewModel } from "../../hooks/useCrearGrupoViewModel";

/**
 * Pantalla para Crear un Nuevo Grupo (View)
 * Solo JSX y StyleSheet - la logica vive en useCrearGrupoViewModel
 */
const CrearGrupoScreen: React.FC = () => {
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
      <StatusBar backgroundColor={COLORS.primary} barStyle="light-content" />

      <SafeAreaView style={styles.safeArea}>
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <Text style={styles.title}>Crear Nuevo Grupo</Text>
          <Text style={styles.subtitle}>Completa la información del grupo</Text>

          {/* Formulario */}
          <View style={styles.form}>
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
                    style={[
                      styles.carreraButton,
                      carrera === c && styles.carreraButtonActive,
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

      <BottomNavBar currentScreen="Crear Grupo" />
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
    padding: 20,
    paddingBottom: 40,
  },
  title: {
    fontSize: FONT_SIZES.xlarge,
    fontWeight: "bold",
    color: COLORS.primary,
    textAlign: "center",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: FONT_SIZES.medium,
    color: COLORS.textSecondary,
    textAlign: "center",
    marginBottom: 30,
  },
  form: {
    gap: 20,
  },
  inputContainer: {
    marginBottom: 5,
  },
  label: {
    fontSize: FONT_SIZES.medium,
    fontWeight: "600",
    color: COLORS.text,
    marginBottom: 8,
  },
  input: {
    backgroundColor: COLORS.surface,
    borderRadius: 10,
    paddingHorizontal: 15,
    paddingVertical: 12,
    fontSize: FONT_SIZES.medium,
    color: COLORS.text,
    borderWidth: 1,
    borderColor: "#e0e0e0",
  },
  carreraContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  carreraButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: COLORS.primary,
    backgroundColor: COLORS.surface,
  },
  carreraButtonActive: {
    backgroundColor: COLORS.primary,
  },
  carreraButtonText: {
    fontSize: FONT_SIZES.medium,
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
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 10,
    marginTop: 10,
    boxShadow: "0px 2px 5px rgba(33, 150, 243, 0.3)",
  },
  submitButtonText: {
    color: "white",
    fontSize: FONT_SIZES.large,
    fontWeight: "bold",
    marginLeft: 8,
  },
  cancelButton: {
    alignItems: "center",
    paddingVertical: 12,
  },
  cancelButtonText: {
    fontSize: FONT_SIZES.medium,
    color: COLORS.textSecondary,
    fontWeight: "600",
  },
});

export default CrearGrupoScreen;
