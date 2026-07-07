import React from "react";
import { Pressable, Text, View } from "react-native";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { COLORS } from "../../../../types";
import { styles } from "./styles";

interface SeleccionArchivoStageProps {
  grupoId?: number;
  grupoNombre?: string;
  onSelectFile: () => void;
  onDownloadTemplate: () => void;
}

// Etapa "idle": invita a seleccionar el archivo CSV/Excel a importar.
const SeleccionArchivoStage: React.FC<SeleccionArchivoStageProps> = ({
  grupoId,
  grupoNombre,
  onSelectFile,
  onDownloadTemplate,
}) => (
  <View style={styles.card}>
    <View style={styles.heroIconWrap}>
      <MaterialIcons name="upload-file" size={34} color={COLORS.primary} />
    </View>
    <Text style={styles.cardTitle}>Subir listado de alumnos</Text>
    <Text style={styles.cardText}>
      {grupoId
        ? `Sube CSV o Excel para importar alumnos directamente a ${grupoNombre ?? "este grupo"}.`
        : "Aun no has seleccionado archivo. Sube CSV o Excel para importar alumnos."}
    </Text>

    <Pressable
      style={({ pressed }) => [styles.primaryButton, pressed && { opacity: 0.6 }]}
      onPress={onSelectFile}
    >
      <MaterialIcons name="file-upload" size={18} color={COLORS.surface} />
      <Text style={styles.primaryButtonText}>Seleccionar archivo</Text>
    </Pressable>

    <Pressable
      style={({ pressed }) => [styles.linkButton, pressed && { opacity: 0.6 }]}
      onPress={onDownloadTemplate}
    >
      <MaterialIcons name="download" size={16} color={COLORS.primary} />
      <Text style={styles.linkButtonText}>Descargar plantilla</Text>
    </Pressable>
  </View>
);

export default SeleccionArchivoStage;
