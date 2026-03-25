import React from "react";
import { render } from "@testing-library/react-native";
import { NivelAcademico } from "../../../types/planeacion";
import EditorPlaneacionScreen from "../../screens/planeaciones/EditorPlaneacionScreen";

const mockUseEditorPlaneacionViewModel = jest.fn();

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

const createBaseVm = (nivel: NivelAcademico) => ({
  nivel,
  modo: "crear" as const,
  asignatura: "",
  grado: "",
  grupo: "",
  fecha: "2024-01-01",
  horaInicio: "08:00",
  duracionTotal: "50",
  unidadTematica: "",
  temaSesion: "",
  aprendizajesEsperados: "",
  actividadInicio: "",
  duracionInicio: "10",
  actividadDesarrollo: "",
  duracionDesarrollo: "30",
  actividadCierre: "",
  duracionCierre: "10",
  recursos: "",
  evaluacion: "",
  evidencias: "",
  observaciones: "",
  campoFormativo: "",
  competenciasDisciplinares: "",
  competenciasGenericas: "",
  competenciasProfesionales: "",
  objetivosAprendizaje: "",
  bibliografia: "",
  modalidad: "presencial",
  modoDetallado: false,
  configuracionCurso: {
    duracionSemanas: 16,
    horasTeoricas: 3,
    horasPracticas: 2,
    horasAutonomas: 5,
    creditos: 8,
    modalidad: "presencial",
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

describe("EditorPlaneacionScreen por nivel", () => {
  it("muestra campo de Primaria", () => {
    mockUseEditorPlaneacionViewModel.mockReturnValue(createBaseVm(NivelAcademico.PRIMARIA));
    const { getByText } = render(<EditorPlaneacionScreen />);
    expect(getByText("Campo Formativo")).toBeTruthy();
  });

  it("muestra campo de Secundaria", () => {
    mockUseEditorPlaneacionViewModel.mockReturnValue(createBaseVm(NivelAcademico.SECUNDARIA));
    const { getByText } = render(<EditorPlaneacionScreen />);
    expect(getByText("Competencias Disciplinares (una por línea)")).toBeTruthy();
  });

  it("muestra campos de Preparatoria", () => {
    mockUseEditorPlaneacionViewModel.mockReturnValue(createBaseVm(NivelAcademico.PREPARATORIA));
    const { getByText } = render(<EditorPlaneacionScreen />);
    expect(getByText("Competencias Genéricas (una por línea)")).toBeTruthy();
  });

  it("muestra campos de Universidad", () => {
    mockUseEditorPlaneacionViewModel.mockReturnValue(createBaseVm(NivelAcademico.UNIVERSIDAD));
    const { getByText } = render(<EditorPlaneacionScreen />);
    expect(getByText("Competencias Profesionales (una por línea)")).toBeTruthy();
  });
});
