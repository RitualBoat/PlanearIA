import { useCallback, useMemo, useState } from "react";
import { Alert, Platform } from "react-native";
import * as DocumentPicker from "expo-document-picker";
import { useAlumnos } from "../context/AlumnosContext";
import {
  buildAlumnoFromDraft,
  parseAlumnosFromAsset,
  type AlumnoImportResult,
  type AlumnoImportRowDraft,
} from "../services/alumnoImportService";

export type ImportarAlumnosUiState = "idle" | "processing" | "preview" | "success" | "error";

export interface ImportarAlumnosViewModel {
  uiState: ImportarAlumnosUiState;
  result: AlumnoImportResult | null;
  errorMessage: string;
  isImporting: boolean;
  validCount: number;
  invalidCount: number;
  previewRows: AlumnoImportRowDraft[];
  handleDownloadTemplate: () => void;
  handleSelectFile: () => Promise<void>;
  handleImportValidRows: () => Promise<void>;
  resetFlow: () => void;
}

export const useImportarAlumnosViewModel = (grupoId?: number): ImportarAlumnosViewModel => {
  const { alumnos, agregarAlumno } = useAlumnos();
  const [uiState, setUiState] = useState<ImportarAlumnosUiState>("idle");
  const [result, setResult] = useState<AlumnoImportResult | null>(null);
  const [errorMessage, setErrorMessage] = useState("");
  const [isImporting, setIsImporting] = useState(false);

  const validCount = result?.validRows.length || 0;
  const invalidCount = result?.errorRows.length || 0;

  const previewRows = useMemo(() => {
    return result?.previewRows || [];
  }, [result]);

  const handleDownloadTemplate = useCallback(() => {
    const message =
      "Plantilla sugerida: columnas Nombre, Apellidos, NumeroControl, Carrera, Email, Telefono, Escuela.";

    if (Platform.OS === "web") {
      window.alert(message);
      return;
    }

    Alert.alert("Descargar plantilla", message);
  }, []);

  const handleSelectFile = useCallback(async () => {
    try {
      setErrorMessage("");
      setUiState("processing");

      const picked = await DocumentPicker.getDocumentAsync({
        copyToCacheDirectory: true,
        multiple: false,
        type: [
          "text/csv",
          "application/vnd.ms-excel",
          "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        ],
      });

      if (picked.canceled) {
        setUiState("idle");
        return;
      }

      const asset = picked.assets?.[0];
      if (!asset) {
        throw new Error("No se pudo leer el archivo seleccionado.");
      }

      const parsed = await parseAlumnosFromAsset(asset);
      setResult(parsed);
      setUiState("preview");
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "No se pudo procesar el archivo");
      setUiState("error");
    }
  }, []);

  const handleImportValidRows = useCallback(async () => {
    if (!result || result.validRows.length === 0) {
      setErrorMessage("No hay filas válidas para importar.");
      setUiState("error");
      return;
    }

    try {
      setIsImporting(true);
      const baseId = Math.max(0, ...alumnos.map((item) => item.id || 0)) + 1;

      for (let i = 0; i < result.validRows.length; i += 1) {
        const alumno = buildAlumnoFromDraft(result.validRows[i], baseId + i, grupoId);
        await agregarAlumno(alumno);
      }

      setUiState("success");
    } catch {
      setErrorMessage("No se pudo completar la importación.");
      setUiState("error");
    } finally {
      setIsImporting(false);
    }
  }, [agregarAlumno, alumnos, grupoId, result]);

  const resetFlow = useCallback(() => {
    setUiState("idle");
    setErrorMessage("");
    setResult(null);
    setIsImporting(false);
  }, []);

  return {
    uiState,
    result,
    errorMessage,
    isImporting,
    validCount,
    invalidCount,
    previewRows,
    handleDownloadTemplate,
    handleSelectFile,
    handleImportValidRows,
    resetFlow,
  };
};
