import React from "react";
import { Pressable, Text, View } from "react-native";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { COLORS } from "../../../../types";
import { styles } from "./styles";

interface ErrorStageProps {
  errorMessage: string;
  onRetry: () => void;
  onCancel: () => void;
}

// Etapa "error": el archivo no pudo procesarse; permite reintentar o cancelar.
const ErrorStage: React.FC<ErrorStageProps> = ({ errorMessage, onRetry, onCancel }) => (
  <View style={styles.card}>
    <View style={[styles.heroIconWrap, { backgroundColor: "#FEECEC" }]}>
      <MaterialIcons name="error" size={32} color={COLORS.error} />
    </View>
    <Text style={styles.errorTitle}>No se pudo procesar el archivo</Text>
    <Text style={styles.cardText}>
      {errorMessage || "El formato no es soportado o el archivo está dañado."}
    </Text>

    <Pressable
      style={({ pressed }) => [styles.primaryButton, pressed && { opacity: 0.6 }]}
      onPress={onRetry}
    >
      <Text style={styles.primaryButtonText}>Reintentar</Text>
    </Pressable>
    <Pressable
      style={({ pressed }) => [styles.cancelButton, pressed && { opacity: 0.6 }]}
      onPress={onCancel}
    >
      <Text style={styles.cancelButtonText}>Cancelar</Text>
    </Pressable>
  </View>
);

export default ErrorStage;
