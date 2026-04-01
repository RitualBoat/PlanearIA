import React from "react";
import { View, Text, StyleSheet, TouchableOpacity, TextInput, StatusBar } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { COLORS, FONT_SIZES } from "../../../../types";
import WebScrollView from "../../../components/WebScrollView";
import { useCrearTareaGrupoViewModel } from "../../../hooks/useCrearTareaGrupoViewModel";
import { useRoute, RouteProp } from "@react-navigation/native";
import { RootStackParamList } from "../../../navigation/StackNavigator";

/**
 * Pantalla para crear una nueva tarea en un grupo (View)
 * Solo JSX y StyleSheet - la logica vive en useCrearTareaGrupoViewModel
 */
const CrearTareaGrupoScreen: React.FC = () => {
  const route = useRoute<RouteProp<RootStackParamList, "CrearTareaGrupo">>();
  const {
    grupoId,
    titulo,
    setTitulo,
    descripcion,
    setDescripcion,
    tipo,
    setTipo,
    valor,
    setValor,
    fechaEntrega,
    setFechaEntrega,
    tipoOptions,
    handleGuardar,
    handleCancelar,
  } = useCrearTareaGrupoViewModel(route.params.grupoId);

  return (
    <View style={styles.container}>
      <StatusBar backgroundColor="#EEF3FA" barStyle="dark-content" />

      <SafeAreaView style={styles.safeArea}>
        <WebScrollView style={styles.content}>
          <View style={styles.formContainer}>
            <Text style={styles.pageTitle}>Crear Nueva Tarea</Text>
            <Text style={styles.pageSubtitle}>Grupo ID: {grupoId}</Text>

            {/* Título */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Título *</Text>
              <TextInput
                style={styles.input}
                placeholder="Ej: Investigación sobre Algoritmos"
                value={titulo}
                onChangeText={setTitulo}
                placeholderTextColor={COLORS.textSecondary}
              />
            </View>

            {/* Tipo */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Tipo de Tarea *</Text>
              <View style={styles.tipoContainer}>
                {tipoOptions.map((option) => (
                  <TouchableOpacity
                    key={option.value}
                    style={[styles.tipoButton, tipo === option.value && styles.tipoButtonActive]}
                    onPress={() =>
                      setTipo(option.value as "tarea" | "examen" | "proyecto" | "investigacion")
                    }
                  >
                    <MaterialIcons
                      name={option.icon as any}
                      size={24}
                      color={tipo === option.value ? COLORS.primary : COLORS.textSecondary}
                    />
                    <Text
                      style={[styles.tipoLabel, tipo === option.value && styles.tipoLabelActive]}
                    >
                      {option.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Descripción */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Descripción e Instrucciones</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                placeholder="Describe qué deben hacer los alumnos..."
                value={descripcion}
                onChangeText={setDescripcion}
                multiline
                numberOfLines={4}
                placeholderTextColor={COLORS.textSecondary}
              />
            </View>

            {/* Valor */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Valor en Puntos *</Text>
              <TextInput
                style={styles.input}
                placeholder="Ej: 20"
                value={valor}
                onChangeText={setValor}
                keyboardType="numeric"
                placeholderTextColor={COLORS.textSecondary}
              />
            </View>

            {/* Fecha de Entrega */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Fecha de Entrega *</Text>
              <TextInput
                style={styles.input}
                placeholder="DD/MM/AAAA"
                value={fechaEntrega}
                onChangeText={setFechaEntrega}
                placeholderTextColor={COLORS.textSecondary}
              />
              <Text style={styles.hint}>
                Nota: En una versión futura se usará un selector de fecha
              </Text>
            </View>

            {/* Botones */}
            <View style={styles.buttonContainer}>
              <TouchableOpacity
                style={[styles.button, styles.buttonSecondary]}
                onPress={handleCancelar}
              >
                <Text style={styles.buttonTextSecondary}>Cancelar</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.button, styles.buttonPrimary]}
                onPress={handleGuardar}
              >
                <MaterialIcons name="save" size={20} color="white" />
                <Text style={styles.buttonText}>Guardar Tarea</Text>
              </TouchableOpacity>
            </View>
          </View>
        </WebScrollView>
      </SafeAreaView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#EEF3FA",
  },
  safeArea: {
    flex: 1,
  },
  content: {
    flex: 1,
  },
  formContainer: {
    width: "100%",
    maxWidth: 960,
    alignSelf: "center",
    paddingHorizontal: 16,
    paddingTop: 14,
    paddingBottom: 110,
  },
  pageTitle: {
    fontSize: FONT_SIZES.xxlarge,
    fontWeight: "bold",
    color: COLORS.text,
    marginBottom: 8,
  },
  pageSubtitle: {
    fontSize: FONT_SIZES.medium,
    color: COLORS.textSecondary,
    marginBottom: 30,
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: FONT_SIZES.medium,
    fontWeight: "600",
    color: COLORS.text,
    marginBottom: 8,
  },
  input: {
    backgroundColor: "#F8FBFF",
    borderWidth: 1,
    borderColor: "#DCE6F3",
    borderRadius: 10,
    padding: 15,
    fontSize: FONT_SIZES.medium,
    color: COLORS.text,
  },
  textArea: {
    minHeight: 100,
    textAlignVertical: "top",
  },
  hint: {
    fontSize: FONT_SIZES.small,
    color: COLORS.textSecondary,
    marginTop: 6,
  },
  tipoContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  tipoButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#DCE6F3",
    flex: 1,
    minWidth: "45%",
  },
  tipoButtonActive: {
    borderColor: COLORS.primary,
    backgroundColor: `${COLORS.primary}10`,
  },
  tipoLabel: {
    fontSize: FONT_SIZES.medium,
    color: COLORS.textSecondary,
    marginLeft: 8,
  },
  tipoLabelActive: {
    color: COLORS.primary,
    fontWeight: "600",
  },
  buttonContainer: {
    flexDirection: "row",
    gap: 10,
    marginTop: 30,
  },
  button: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 15,
    borderRadius: 10,
    gap: 8,
  },
  buttonPrimary: {
    backgroundColor: COLORS.primary,
  },
  buttonSecondary: {
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: COLORS.primary,
  },
  buttonText: {
    color: "white",
    fontSize: FONT_SIZES.medium,
    fontWeight: "bold",
  },
  buttonTextSecondary: {
    color: COLORS.primary,
    fontSize: FONT_SIZES.medium,
    fontWeight: "bold",
  },
});

export default CrearTareaGrupoScreen;
