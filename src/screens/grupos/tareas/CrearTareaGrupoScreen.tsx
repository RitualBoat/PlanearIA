import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  StatusBar,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { StackNavigationProp } from "@react-navigation/stack";
import { RouteProp } from "@react-navigation/native";
import { RootStackParamList } from "../../../navigation/StackNavigator";
import { COLORS, FONT_SIZES } from "../../../../types";
import BottomNavBar from "../../../components/BottomNavBar";
import WebScrollView from "../../../components/WebScrollView";

type CrearTareaGrupoScreenNavigationProp = StackNavigationProp<
  RootStackParamList,
  "CrearTareaGrupo"
>;

type CrearTareaGrupoScreenRouteProp = RouteProp<
  RootStackParamList,
  "CrearTareaGrupo"
>;

interface CrearTareaGrupoScreenProps {
  navigation: CrearTareaGrupoScreenNavigationProp;
  route: CrearTareaGrupoScreenRouteProp;
}

/**
 * Pantalla para crear una nueva tarea en un grupo
 */
const CrearTareaGrupoScreen: React.FC<CrearTareaGrupoScreenProps> = ({
  navigation,
  route,
}) => {
  const { grupoId } = route.params;

  const [titulo, setTitulo] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [tipo, setTipo] = useState<
    "tarea" | "examen" | "proyecto" | "investigacion"
  >("tarea");
  const [valor, setValor] = useState("");
  const [fechaEntrega, setFechaEntrega] = useState("");

  const tipoOptions = [
    { value: "tarea", label: "Tarea", icon: "assignment" },
    { value: "examen", label: "Examen", icon: "quiz" },
    { value: "proyecto", label: "Proyecto", icon: "science" },
    { value: "investigacion", label: "Investigación", icon: "search" },
  ];

  const handleGuardar = () => {
    // TODO: Implementar lógica de guardado
    console.log("Guardando tarea:", {
      grupoId,
      titulo,
      descripcion,
      tipo,
      valor,
      fechaEntrega,
    });
    // Volver a la pantalla anterior
    navigation.goBack();
  };

  return (
    <View style={styles.container}>
      <StatusBar backgroundColor={COLORS.primary} barStyle="light-content" />

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
                    style={[
                      styles.tipoButton,
                      tipo === option.value && styles.tipoButtonActive,
                    ]}
                    onPress={() =>
                      setTipo(
                        option.value as
                          | "tarea"
                          | "examen"
                          | "proyecto"
                          | "investigacion",
                      )
                    }
                  >
                    <MaterialIcons
                      name={option.icon as any}
                      size={24}
                      color={
                        tipo === option.value
                          ? COLORS.primary
                          : COLORS.textSecondary
                      }
                    />
                    <Text
                      style={[
                        styles.tipoLabel,
                        tipo === option.value && styles.tipoLabelActive,
                      ]}
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
                onPress={() => navigation.goBack()}
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

      <BottomNavBar currentScreen="Crear Tarea" />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  safeArea: {
    flex: 1,
  },
  content: {
    flex: 1,
  },
  formContainer: {
    padding: 20,
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
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: "#e0e0e0",
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
    backgroundColor: COLORS.surface,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#e0e0e0",
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
    backgroundColor: COLORS.surface,
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
