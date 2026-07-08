import React from "react";
import { Pressable, Text, View } from "react-native";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { COLORS } from "../../../../types";
import { styles } from "./styles";

interface ExitoStageProps {
  validCount: number;
  grupoId?: number;
  grupoNombre?: string;
  onPrimary: () => void;
  onImportMore: () => void;
}

// Etapa "success": confirma la importacion y ofrece volver al destino o
// importar mas alumnos.
const ExitoStage: React.FC<ExitoStageProps> = ({
  validCount,
  grupoId,
  grupoNombre,
  onPrimary,
  onImportMore,
}) => (
  <View style={styles.card}>
    <View style={[styles.heroIconWrap, { backgroundColor: "#EAF3FF" }]}>
      <MaterialIcons name="check" size={38} color={COLORS.primary} />
    </View>
    <Text style={styles.successTitle}>Importación completada</Text>
    <Text style={styles.cardText}>
      Se han importado {validCount} alumnos nuevos correctamente
      {grupoId ? ` en ${grupoNombre ?? "este grupo"}` : ""}.
    </Text>

    <Pressable
      style={({ pressed }) => [styles.primaryButton, pressed && { opacity: 0.6 }]}
      onPress={onPrimary}
    >
      <Text style={styles.primaryButtonText}>{grupoId ? "Volver a la clase" : "Ir a mis alumnos"}</Text>
    </Pressable>

    <Pressable
      style={({ pressed }) => [styles.secondaryButton, pressed && { opacity: 0.6 }]}
      onPress={onImportMore}
    >
      <Text style={styles.secondaryButtonText}>Importar más alumnos</Text>
    </Pressable>
  </View>
);

export default ExitoStage;
