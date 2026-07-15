import { useCallback, useMemo, useState } from "react";
import { Alert, Platform } from "react-native";
import * as DocumentPicker from "expo-document-picker";
import { useNavigation } from "@react-navigation/native";
import type { StackNavigationProp } from "@react-navigation/stack";
import type { RootStackParamList } from "../navigation/StackNavigator";
import { useAuth } from ".//useAuth";
import {
  extractRawTextFromImportedFile,
  scanPlantillaFromRawText,
  type ExtractedPlaneacionText,
} from "../services/planeacionImportService";
import { savePlantillaDocumento } from "../services/plantillaDocumentoService";
import { NivelAcademico } from "../../types/planeacionV2";
import type { PlantillaDocumento } from "../../types/plantillaDocumento";

type Nav = StackNavigationProp<RootStackParamList, "EscanerPlantilla">;
type PasoEscaner = 1 | 2 | 3 | 4 | 5;

const showMessage = (title: string, message: string) => {
  if (Platform.OS === "web") {
    window.alert(`${title}\n\n${message}`);
    return;
  }

  Alert.alert(title, message);
};

export interface EscanerPlantillaViewModel {
  paso: PasoEscaner;
  archivo: DocumentPicker.DocumentPickerAsset | null;
  extraccion: ExtractedPlaneacionText | null;
  textoPreview: string;
  nivelAcademico: NivelAcademico;
  plantilla: PlantillaDocumento | null;
  plantillaGuardada: PlantillaDocumento | null;
  nombrePlantilla: string;
  descripcionPlantilla: string;
  isExtracting: boolean;
  isScanning: boolean;
  isSaving: boolean;
  error: string | null;
  puedeAnalizar: boolean;
  puedeGuardar: boolean;
  progresoLabel: string;
  setNivelAcademico: (nivel: NivelAcademico) => void;
  setNombrePlantilla: (value: string) => void;
  setDescripcionPlantilla: (value: string) => void;
  seleccionarArchivo: () => Promise<void>;
  analizarPlantilla: () => Promise<void>;
  guardarPlantilla: () => Promise<void>;
  reiniciar: () => void;
  irPasoAnterior: () => void;
  irACrearDesdePlantilla: () => void;
  cancelar: () => void;
}

export const useEscanerPlantillaViewModel = (): EscanerPlantillaViewModel => {
  const navigation = useNavigation<Nav>();
  const { usuario } = useAuth();
  const userId = String(usuario?.id ?? "guest");

  const [paso, setPaso] = useState<PasoEscaner>(1);
  const [archivo, setArchivo] = useState<DocumentPicker.DocumentPickerAsset | null>(null);
  const [extraccion, setExtraccion] = useState<ExtractedPlaneacionText | null>(null);
  const [nivelAcademico, setNivelAcademico] = useState<NivelAcademico>(NivelAcademico.PRIMARIA);
  const [plantilla, setPlantilla] = useState<PlantillaDocumento | null>(null);
  const [plantillaGuardada, setPlantillaGuardada] = useState<PlantillaDocumento | null>(null);
  const [nombrePlantilla, setNombrePlantilla] = useState("");
  const [descripcionPlantilla, setDescripcionPlantilla] = useState("");
  const [isExtracting, setIsExtracting] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const textoPreview = useMemo(() => {
    const text = extraccion?.rawText || "";
    return text.length > 2400 ? `${text.slice(0, 2400)}...` : text;
  }, [extraccion?.rawText]);

  const puedeAnalizar = Boolean(extraccion?.rawText?.trim()) && !isExtracting && !isScanning;
  const puedeGuardar = Boolean(plantilla && nombrePlantilla.trim()) && !isSaving && !isScanning;

  const progresoLabel = useMemo(() => {
    if (paso === 1) return "Selecciona un PDF o DOCX";
    if (paso === 2) return "Revisa el texto extraido";
    if (paso === 3) return "Analizando estructura con IA";
    if (paso === 4) return "Confirma la plantilla detectada";
    return "Plantilla guardada";
  }, [paso]);

  const seleccionarArchivo = useCallback(async () => {
    try {
      setError(null);
      setPlantilla(null);
      setPlantillaGuardada(null);
      setIsExtracting(true);

      const result = await DocumentPicker.getDocumentAsync({
        copyToCacheDirectory: true,
        multiple: false,
        type: [
          "application/pdf",
          "application/msword",
          "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        ],
      });

      if (result.canceled) {
        setIsExtracting(false);
        return;
      }

      const asset = result.assets?.[0];
      if (!asset?.name) {
        throw new Error("No se pudo leer el archivo seleccionado.");
      }

      const extracted = await extractRawTextFromImportedFile(asset);
      if (!extracted.rawText.trim()) {
        throw new Error("No se pudo extraer texto del archivo. Intenta con otro PDF o DOCX.");
      }

      setArchivo(asset);
      setExtraccion(extracted);
      setNivelAcademico(extracted.nivelAcademico);
      setNombrePlantilla(`Plantilla ${extracted.fallbackSubject || "escaneada"}`.trim());
      setDescripcionPlantilla("Plantilla generada a partir de un documento importado.");
      setPaso(2);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "No se pudo procesar el archivo.");
    } finally {
      setIsExtracting(false);
    }
  }, []);

  const analizarPlantilla = useCallback(async () => {
    const textoRaw = extraccion?.rawText?.trim();
    if (!textoRaw) {
      setError("Selecciona un archivo con texto antes de analizar.");
      return;
    }

    try {
      setError(null);
      setIsScanning(true);
      setPaso(3);

      const generated = await scanPlantillaFromRawText(textoRaw, {
        nivelAcademico,
        userId,
      });

      setPlantilla(generated);
      setNombrePlantilla(generated.nombre || nombrePlantilla);
      setDescripcionPlantilla(generated.descripcion || descripcionPlantilla);
      setPaso(4);
    } catch (caught) {
      setPaso(2);
      setError(caught instanceof Error ? caught.message : "No se pudo analizar la plantilla.");
    } finally {
      setIsScanning(false);
    }
  }, [descripcionPlantilla, extraccion?.rawText, nivelAcademico, nombrePlantilla, userId]);

  const guardarPlantilla = useCallback(async () => {
    if (!plantilla) {
      setError("No hay una plantilla generada para guardar.");
      return;
    }

    try {
      setError(null);
      setIsSaving(true);

      const saved = await savePlantillaDocumento(
        {
          ...plantilla,
          userId,
          nombre: nombrePlantilla.trim() || plantilla.nombre,
          descripcion: descripcionPlantilla.trim() || plantilla.descripcion,
          nivelAcademico,
          origen: "escaner",
        },
        userId
      );

      setPlantillaGuardada(saved);
      setPlantilla(saved);
      setPaso(5);
      showMessage("Plantilla guardada", "Ya puedes usarla desde el flujo 'Desde plantilla'.");
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "No se pudo guardar la plantilla.");
    } finally {
      setIsSaving(false);
    }
  }, [descripcionPlantilla, nivelAcademico, nombrePlantilla, plantilla, userId]);

  const reiniciar = useCallback(() => {
    setPaso(1);
    setArchivo(null);
    setExtraccion(null);
    setPlantilla(null);
    setPlantillaGuardada(null);
    setNombrePlantilla("");
    setDescripcionPlantilla("");
    setNivelAcademico(NivelAcademico.PRIMARIA);
    setError(null);
  }, []);

  const irPasoAnterior = useCallback(() => {
    setError(null);
    setPaso((current) => {
      if (current === 1) return 1;
      if (current === 5) return 4;
      if (current === 4) return 2;
      if (current === 3) return 2;
      return 1;
    });
  }, []);

  const irACrearDesdePlantilla = useCallback(() => {
    navigation.navigate("CrearPlaneacion");
  }, [navigation]);

  const cancelar = useCallback(() => {
    navigation.goBack();
  }, [navigation]);

  return {
    paso,
    archivo,
    extraccion,
    textoPreview,
    nivelAcademico,
    plantilla,
    plantillaGuardada,
    nombrePlantilla,
    descripcionPlantilla,
    isExtracting,
    isScanning,
    isSaving,
    error,
    puedeAnalizar,
    puedeGuardar,
    progresoLabel,
    setNivelAcademico,
    setNombrePlantilla,
    setDescripcionPlantilla,
    seleccionarArchivo,
    analizarPlantilla,
    guardarPlantilla,
    reiniciar,
    irPasoAnterior,
    irACrearDesdePlantilla,
    cancelar,
  };
};

export default useEscanerPlantillaViewModel;
