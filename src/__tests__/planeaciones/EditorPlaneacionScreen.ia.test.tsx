import React from "react";
import { Alert } from "react-native";
import { fireEvent, render, waitFor } from "@testing-library/react-native";
import { NivelAcademico } from "../../../types/planeacion";
import EditorPlaneacionScreen from "../../screens/planeaciones/EditorPlaneacionScreen";

const mockUseEditorPlaneacionViewModel = jest.fn();
const mockFetch = jest.fn();

(global as typeof globalThis & { fetch: typeof fetch }).fetch = mockFetch as typeof fetch;

jest.mock("../../sync/config/apiConfig", () => ({
  API_CONFIG: {
    baseUrl: "https://backend.test",
    apiSecret: "test-secret",
    timeout: 15000,
  },
}));

jest.mock("@expo/vector-icons/MaterialIcons", () => {
  const React = require("react");
  const { Text } = require("react-native");
  return () => <Text>Icon</Text>;
});

jest.mock("../../hooks/useEditorPlaneacionViewModel", () => ({
  useEditorPlaneacionViewModel: () => mockUseEditorPlaneacionViewModel(),
}));

jest.mock("../../components/BottomNavBar", () => {
  const React = require("react");
  const { Text } = require("react-native");
  return () => <Text>BottomNavBar</Text>;
});

jest.mock("../../components/SyncIndicator", () => {
  const React = require("react");
  const { Text } = require("react-native");
  return () => <Text>SyncIndicator</Text>;
});

jest.mock("../../components/WebScrollView", () => {
  const React = require("react");
  const { ScrollView } = require("react-native");
  return ({ children }: { children: React.ReactNode }) => <ScrollView>{children}</ScrollView>;
});

jest.mock("../../components/SemanaEditor", () => ({
  SemanaEditor: () => {
    const React = require("react");
    const { Text } = require("react-native");
    return <Text>SemanaEditor</Text>;
  },
}));

jest.mock("../../components/EvaluacionEditor", () => ({
  EvaluacionEditor: () => {
    const React = require("react");
    const { Text } = require("react-native");
    return <Text>EvaluacionEditor</Text>;
  },
}));

const createBaseVm = () => ({
  nivel: NivelAcademico.SECUNDARIA,
  modo: "crear" as const,
  asignatura: "Matemáticas",
  grado: "3°",
  grupo: "A",
  fecha: "2024-01-01",
  horaInicio: "08:00",
  duracionTotal: "50",
  unidadTematica: "Álgebra",
  temaSesion: "Ecuaciones lineales",
  aprendizajesEsperados: "Resuelve ecuaciones de primer grado",
  actividadInicio: "Diagnóstico inicial",
  duracionInicio: "10",
  actividadDesarrollo: "Resolución guiada",
  duracionDesarrollo: "30",
  actividadCierre: "Cierre reflexivo",
  duracionCierre: "10",
  recursos: "Pizarrón\nMarcadores",
  evaluacion: "Lista de cotejo",
  evidencias: "Ejercicios",
  observaciones: "",
  campoFormativo: "",
  competenciasDisciplinares: "Resuelve problemas algebraicos",
  competenciasGenericas: "",
  competenciasProfesionales: "",
  objetivosAprendizaje: "",
  bibliografia: "",
  modalidad: "presencial",
  modoDetallado: false,
  configuracionCurso: {
    duracionSemanas: 16 as const,
    horasTeoricas: 3,
    horasPracticas: 2,
    horasAutonomas: 5,
    creditos: 8,
    modalidad: "presencial" as const,
  },
  semanas: [],
  evaluaciones: [],
  semanasVersion: 0,
  setAsignatura: jest.fn(),
  setGrado: jest.fn(),
  setGrupo: jest.fn(),
  setFecha: jest.fn(),
  setHoraInicio: jest.fn(),
  setDuracionTotal: jest.fn(),
  setUnidadTematica: jest.fn(),
  setTemaSesion: jest.fn(),
  setAprendizajesEsperados: jest.fn(),
  setActividadInicio: jest.fn(),
  setDuracionInicio: jest.fn(),
  setActividadDesarrollo: jest.fn(),
  setDuracionDesarrollo: jest.fn(),
  setActividadCierre: jest.fn(),
  setDuracionCierre: jest.fn(),
  setRecursos: jest.fn(),
  setEvaluacion: jest.fn(),
  setEvidencias: jest.fn(),
  setObservaciones: jest.fn(),
  setCampoFormativo: jest.fn(),
  setCompetenciasDisciplinares: jest.fn(),
  setCompetenciasGenericas: jest.fn(),
  setCompetenciasProfesionales: jest.fn(),
  setObjetivosAprendizaje: jest.fn(),
  setBibliografia: jest.fn(),
  setModalidad: jest.fn(),
  setConfiguracionCurso: jest.fn(),
  setEvaluaciones: jest.fn(),
  toggleModoDetallado: jest.fn(),
  cambiarDuracionCurso: jest.fn(),
  actualizarSemana: jest.fn(),
  eliminarSemana: jest.fn(),
  clonarSemana: jest.fn(),
  handleGuardar: jest.fn(),
  obtenerTitulo: jest.fn(() => "Nueva Planeación"),
});

describe("EditorPlaneacionScreen - mejora con IA", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockUseEditorPlaneacionViewModel.mockReturnValue(createBaseVm());
  });

  it("envía la planeación actual al endpoint de mejora", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        success: true,
        data: {
          sugerencias: [],
        },
      }),
    });

    const { getByText } = render(<EditorPlaneacionScreen />);

    fireEvent.press(getByText("Mejorar con IA"));

    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledWith(
        "https://backend.test/api/planeaciones/mejorar",
        expect.objectContaining({
          method: "POST",
          headers: expect.objectContaining({
            "X-API-Key": "test-secret",
          }),
        })
      );
    });

    const [, requestInit] = mockFetch.mock.calls[0];
    const body = JSON.parse((requestInit as RequestInit).body as string);

    expect(body.planeacion.temaSesion).toBe("Ecuaciones lineales");
    expect(body.planeacion.actividades).toHaveLength(3);
  });

  it("renderiza sugerencias obtenidas de IA", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        success: true,
        data: {
          sugerencias: [
            {
              campo: "temaSesion",
              categoria: "redaccion",
              original: "ecuaciones lineales",
              mejorado: "Ecuaciones lineales con resolución contextualizada",
              justificacion: "Mayor claridad pedagógica",
            },
          ],
        },
      }),
    });

    const { getByText } = render(<EditorPlaneacionScreen />);

    fireEvent.press(getByText("Mejorar con IA"));

    await waitFor(() => {
      expect(getByText("temaSesion")).toBeTruthy();
      expect(getByText("Ecuaciones lineales con resolución contextualizada")).toBeTruthy();
      expect(getByText("REDACCION - Mayor claridad pedagógica")).toBeTruthy();
    });
  });

  it("permite aceptar una sugerencia y rechazar otra", async () => {
    const vm = createBaseVm();
    mockUseEditorPlaneacionViewModel.mockReturnValue(vm);

    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        success: true,
        data: {
          sugerencias: [
            {
              campo: "temaSesion",
              categoria: "redaccion",
              original: "ecuaciones lineales",
              mejorado: "Ecuaciones lineales con enfoque colaborativo",
              justificacion: "Mejora de claridad",
            },
            {
              campo: "evaluacion",
              categoria: "contenido",
              original: "lista de cotejo",
              mejorado: "Rúbrica analítica con criterios claros",
              justificacion: "Mejor alineación evaluativa",
            },
          ],
        },
      }),
    });

    const alertSpy = jest.spyOn(Alert, "alert").mockImplementation(jest.fn());

    const { getByText } = render(<EditorPlaneacionScreen />);

    fireEvent.press(getByText("Mejorar con IA"));

    await waitFor(() => {
      expect(getByText("temaSesion")).toBeTruthy();
      expect(getByText("evaluacion")).toBeTruthy();
    });

    // Aceptar solo la sugerencia de temaSesion (rechazar la de evaluacion)
    fireEvent.press(getByText("temaSesion"));
    fireEvent.press(getByText("Aplicar seleccionadas"));

    expect(vm.setTemaSesion).toHaveBeenCalledWith("Ecuaciones lineales con enfoque colaborativo");
    expect(vm.setEvaluacion).not.toHaveBeenCalled();
    expect(alertSpy).toHaveBeenCalled();
  });
});
