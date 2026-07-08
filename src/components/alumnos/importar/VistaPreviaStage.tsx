import React from "react";
import { Pressable, Text, View } from "react-native";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { COLORS } from "../../../../types";
import type {
  AlumnoImportResult,
  AlumnoImportRowDraft,
} from "../../../services/alumnoImportService";
import { styles } from "./styles";

interface VistaPreviaStageProps {
  result: AlumnoImportResult | null;
  validCount: number;
  invalidCount: number;
  previewRows: AlumnoImportRowDraft[];
  isImporting: boolean;
  onSelectFile: () => void;
  onDownloadTemplate: () => void;
  onCancel: () => void;
  onImport: () => void;
}

// Etapa "preview": muestra archivo elegido, conteos y la tabla de validacion
// antes de confirmar la importacion de las filas validas.
const VistaPreviaStage: React.FC<VistaPreviaStageProps> = ({
  result,
  validCount,
  invalidCount,
  previewRows,
  isImporting,
  onSelectFile,
  onDownloadTemplate,
  onCancel,
  onImport,
}) => (
  <>
    <View style={styles.fileRow}>
      <View style={styles.fileIconWrap}>
        <MaterialIcons name="description" size={20} color={COLORS.primary} />
      </View>
      <View style={{ flex: 1 }}>
        <Text style={styles.fileName}>{result?.fileName}</Text>
      </View>
      <Pressable style={({ pressed }) => pressed && { opacity: 0.6 }} onPress={onSelectFile}>
        <Text style={styles.changeFileText}>Cambiar archivo</Text>
      </Pressable>
    </View>

    <Text style={styles.previewTitle}>Vista previa</Text>
    <View style={styles.statsRow}>
      <View style={styles.validBadge}>
        <Text style={styles.validText}>{validCount} Filas válidas</Text>
      </View>
      <View style={styles.invalidBadge}>
        <Text style={styles.invalidText}>{invalidCount} Filas con error</Text>
      </View>
    </View>

    <View style={styles.tableCard}>
      <View style={styles.tableHead}>
        <Text style={[styles.colHead, { flex: 1.1 }]}>Nombre</Text>
        <Text style={[styles.colHead, { flex: 1 }]}>Apellidos</Text>
        <Text style={[styles.colHead, { flex: 1 }]}>No. Control</Text>
      </View>

      {previewRows.map((row, index) => {
        const previewError = result?.errorRows.find((item) => item.draft === row);
        return (
          <View
            key={`${row.numeroControl}-${index}`}
            style={[styles.tableRow, previewError && styles.errorRow]}
          >
            <Text style={[styles.colValue, { flex: 1.1 }]}>{row.nombre || "-"}</Text>
            <Text style={[styles.colValue, { flex: 1 }]}>{row.apellidos || "-"}</Text>
            <View style={{ flex: 1 }}>
              <Text style={[styles.colValue, previewError && styles.errorCellText]}>
                {row.numeroControl || "-"}
              </Text>
              {previewError ? (
                <Text style={styles.rowErrorDetail}>{previewError.errors[0]}</Text>
              ) : null}
            </View>
          </View>
        );
      })}
    </View>

    <View style={styles.actionsCard}>
      <View style={styles.actionsRow}>
        <Pressable
          style={({ pressed }) => [styles.cancelButton, pressed && { opacity: 0.6 }]}
          onPress={onCancel}
        >
          <Text style={styles.cancelButtonText}>Cancelar</Text>
        </Pressable>
        <Pressable
          style={({ pressed }) => [styles.importButton, pressed && { opacity: 0.6 }]}
          onPress={onImport}
          disabled={isImporting || validCount === 0}
        >
          <Text style={styles.importButtonText}>
            {isImporting ? "Importando..." : "Importar alumnos válidos"}
          </Text>
        </Pressable>
      </View>
      <Pressable
        style={({ pressed }) => [styles.linkButton, pressed && { opacity: 0.6 }]}
        onPress={onDownloadTemplate}
      >
        <Text style={styles.linkButtonText}>Descargar plantilla</Text>
      </Pressable>
    </View>
  </>
);

export default VistaPreviaStage;
