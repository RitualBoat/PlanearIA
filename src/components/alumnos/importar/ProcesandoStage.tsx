import React from "react";
import { ActivityIndicator, Text, View } from "react-native";
import { COLORS } from "../../../../types";
import { styles } from "./styles";

// Etapa "processing": el archivo se esta leyendo y validando.
const ProcesandoStage: React.FC = () => (
  <View style={styles.card}>
    <ActivityIndicator size="large" color={COLORS.primary} />
    <Text style={styles.cardTitle}>Procesando archivo y validando datos...</Text>
    <View style={styles.progressTrack}>
      <View style={styles.progressFill} />
    </View>
  </View>
);

export default ProcesandoStage;
