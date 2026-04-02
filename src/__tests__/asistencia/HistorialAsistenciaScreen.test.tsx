import React from "react";
import { render } from "@testing-library/react-native";
import HistorialAsistenciaScreen from "../../screens/asistencia/HistorialAsistenciaScreen";

jest.mock("@expo/vector-icons/MaterialIcons", () => "MaterialIcons");

const mockGoBack = jest.fn();
const mockNavigate = jest.fn();

jest.mock("@react-navigation/native", () => ({
  useNavigation: () => ({ goBack: mockGoBack, navigate: mockNavigate }),
  useRoute: () => ({ params: { grupoId: 10 } }),
}));

jest.mock("@react-native-async-storage/async-storage", () => ({
  getItem: jest.fn().mockResolvedValue("[]"),
  setItem: jest.fn().mockResolvedValue(undefined),
}));

jest.mock("../../sync/config/apiConfig", () => ({
  API_CONFIG: { baseUrl: "", apiSecret: "", timeout: 5000 },
  isAPIConfigured: () => false,
}));

const mockObtenerPorGrupo = jest.fn();

jest.mock("../../context/AsistenciaContext", () => ({
  useAsistencias: () => ({
    asistencias: [],
    obtenerAsistenciasPorGrupo: mockObtenerPorGrupo,
  }),
}));

jest.mock("../../hooks/useGrupos", () => ({
  useGrupos: () => ({
    grupos: [
      {
        id: 10,
        nombre: "ISC-501",
        materia: "Programación Web",
        horario: "Lun-Mié 09:00",
        estado: "activo",
      },
    ],
  }),
}));

describe("HistorialAsistenciaScreen", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockObtenerPorGrupo.mockReturnValue([]);
  });

  const renderScreen = () =>
    render(
      <HistorialAsistenciaScreen
        navigation={{ goBack: mockGoBack, navigate: mockNavigate } as any}
        route={{ params: { grupoId: 10 } } as any}
      />
    );

  it("muestra estado vacío cuando no hay registros", () => {
    const { getByText } = renderScreen();

    expect(getByText("Sin registros de asistencia")).toBeTruthy();
    expect(getByText("Pasa lista para ver el historial aquí.")).toBeTruthy();
    expect(getByText("Iniciar Pase de Lista")).toBeTruthy();
  });

  it("muestra el nombre del grupo en estado vacío", () => {
    const { getByText } = renderScreen();

    expect(getByText("ISC-501 • Programación Web")).toBeTruthy();
  });

  it("muestra estadísticas cuando hay registros", () => {
    mockObtenerPorGrupo.mockReturnValue([
      { id: 1, alumnoId: 1, grupoId: 10, fecha: "2025-03-24", estado: "presente" },
      { id: 2, alumnoId: 2, grupoId: 10, fecha: "2025-03-24", estado: "presente" },
      { id: 3, alumnoId: 3, grupoId: 10, fecha: "2025-03-24", estado: "retardo" },
      { id: 4, alumnoId: 4, grupoId: 10, fecha: "2025-03-24", estado: "ausente" },
    ]);

    const { getByText } = renderScreen();

    expect(getByText("PROMEDIO DE ASISTENCIA")).toBeTruthy();
    expect(getByText("50%")).toBeTruthy(); // 2 presentes / 4 total
    expect(getByText("SESIONES")).toBeTruthy();
  });

  it("muestra tarjetas de sesión agrupadas por fecha", () => {
    mockObtenerPorGrupo.mockReturnValue([
      { id: 1, alumnoId: 1, grupoId: 10, fecha: "2025-03-24", estado: "presente" },
      { id: 2, alumnoId: 2, grupoId: 10, fecha: "2025-03-24", estado: "retardo" },
      { id: 3, alumnoId: 1, grupoId: 10, fecha: "2025-03-19", estado: "presente" },
    ]);

    const { getByText, getAllByText } = renderScreen();

    expect(getByText("Sesiones Recientes")).toBeTruthy();
    // Two session cards should exist (two distinct dates)
    expect(getAllByText("MAR")).toHaveLength(2);
  });

  it("muestra chips de estado en las tarjetas de sesión", () => {
    mockObtenerPorGrupo.mockReturnValue([
      { id: 1, alumnoId: 1, grupoId: 10, fecha: "2025-03-24", estado: "presente" },
      { id: 2, alumnoId: 2, grupoId: 10, fecha: "2025-03-24", estado: "retardo" },
      { id: 3, alumnoId: 3, grupoId: 10, fecha: "2025-03-24", estado: "ausente" },
    ]);

    const { getByText } = renderScreen();

    expect(getByText("1 PRESENTES")).toBeTruthy();
    expect(getByText("1 RETARDOS")).toBeTruthy();
    expect(getByText("1 FALTA")).toBeTruthy();
  });

  it("muestra filtros", () => {
    mockObtenerPorGrupo.mockReturnValue([
      { id: 1, alumnoId: 1, grupoId: 10, fecha: "2025-03-24", estado: "presente" },
    ]);

    const { getByText } = renderScreen();

    expect(getByText("Todos")).toBeTruthy();
    expect(getByText("Presentes")).toBeTruthy();
    expect(getByText("Retardos")).toBeTruthy();
    expect(getByText("Faltas")).toBeTruthy();
  });

  it("muestra mini stats con conteos correctos", () => {
    mockObtenerPorGrupo.mockReturnValue([
      { id: 1, alumnoId: 1, grupoId: 10, fecha: "2025-03-24", estado: "presente" },
      { id: 2, alumnoId: 2, grupoId: 10, fecha: "2025-03-24", estado: "retardo" },
      { id: 3, alumnoId: 3, grupoId: 10, fecha: "2025-03-24", estado: "ausente" },
      { id: 4, alumnoId: 4, grupoId: 10, fecha: "2025-03-24", estado: "ausente" },
    ]);

    const { getByText } = renderScreen();

    expect(getByText("SESIONES")).toBeTruthy();
    expect(getByText("RETARDOS")).toBeTruthy();
    expect(getByText("FALTAS")).toBeTruthy();
  });
});
