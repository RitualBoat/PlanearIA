import React from "react";
import { fireEvent, render, waitFor } from "@testing-library/react-native";
import GruposDashboardScreen from "../../screens/grupos/GruposDashboardScreen";

// ─── Mock ViewModel ───

const mockRecargar = jest.fn();
let mockViewModelReturn: any = {};

jest.mock("../../hooks/useGruposDashboardViewModel", () => ({
  useGruposDashboardViewModel: () => mockViewModelReturn,
  // Re-export types used in the component
  GrupoMiniStats: {},
  AlertaAlumno: {},
  QuickActionType: {},
}));

// ─── Mock Dependencies ───

const mockNavigate = jest.fn();

jest.mock("@react-navigation/native", () => ({
  useNavigation: () => ({ navigate: mockNavigate }),
}));

jest.mock("@expo/vector-icons/MaterialIcons", () => {
  const React = require("react");
  const { Text } = require("react-native");
  return (props: any) => <Text>{props.name}</Text>;
});

jest.mock("react-native-safe-area-context", () => {
  const React = require("react");
  return {
    SafeAreaView: ({ children }: { children: React.ReactNode }) => children,
  };
});

jest.mock("../../components/AnimatedTopPill", () => {
  const React = require("react");
  const { Text } = require("react-native");
  return (props: any) => <Text>{props.title}</Text>;
});

let mockGruposContextReturn: any = { grupos: [] };

jest.mock("../../context/GruposContext", () => ({
  useGruposContext: () => mockGruposContextReturn,
}));

jest.mock("../../utils/responsive", () => ({
  isWeb: () => false,
  isLargeScreen: () => false,
  responsive: (mobile: any) => mobile,
}));

jest.mock("expo-linear-gradient", () => {
  const React = require("react");
  const { View } = require("react-native");
  return {
    LinearGradient: (props: any) => <View {...props} />,
  };
});

// ─── Helpers ───

const defaultQuickActions = [
  {
    id: "calificar",
    label: "Calificar",
    icon: "rate-review",
    color: "#004580",
    bgColor: "#d4e3ff",
  },
  { id: "tarea", label: "Tarea", icon: "assignment", color: "#EA6C00", bgColor: "#FFF3E0" },
  { id: "reportes", label: "Reportes", icon: "analytics", color: "#7B1FA2", bgColor: "#F3E5F5" },
  {
    id: "asistencia",
    label: "Asistencia",
    icon: "fact-check",
    color: "#00796B",
    bgColor: "#E0F2F1",
  },
];

const buildViewModel = (overrides: Partial<typeof mockViewModelReturn> = {}) => ({
  isLoading: false,
  error: null,
  isEmpty: false,
  kpis: {
    totalAlumnos: 45,
    promedioGeneral: 8.2,
    indiceAsistencia: 92,
    entregasPendientes: 3,
    gruposActivos: 2,
  },
  gruposConStats: [
    {
      id: 1,
      nombre: "7A Matemáticas",
      materia: "Matemáticas",
      cantidadAlumnos: 25,
      estado: "activo",
      promedio: 8.5,
      asistencia: 94,
      pendientes: 1,
    },
    {
      id: 2,
      nombre: "3B Física",
      materia: "Física",
      cantidadAlumnos: 20,
      estado: "activo",
      promedio: 7.9,
      asistencia: 88,
      pendientes: 2,
    },
  ],
  alertas: [],
  quickActions: defaultQuickActions,
  recargar: mockRecargar,
  ...overrides,
});

const renderScreen = () => {
  return render(<GruposDashboardScreen navigation={{ navigate: mockNavigate } as any} />);
};

// ─── Tests ───

describe("GruposDashboardScreen", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockViewModelReturn = buildViewModel();
    mockGruposContextReturn = {
      grupos: [
        {
          id: 1,
          nombre: "7A Matemáticas",
          materia: "Matemáticas",
          estado: "activo",
          cantidadAlumnos: 25,
        },
        { id: 2, nombre: "3B Física", materia: "Física", estado: "activo", cantidadAlumnos: 20 },
      ],
    };
  });

  // ─── Empty State ───

  describe("empty state", () => {
    it("muestra estado vacío con CTA de crear grupo", () => {
      mockViewModelReturn = buildViewModel({ isEmpty: true, gruposConStats: [] });
      mockGruposContextReturn = { grupos: [] };

      const { getByText } = renderScreen();
      expect(getByText("Aún no tienes grupos")).toBeTruthy();
      expect(getByText("Crear mi primer grupo")).toBeTruthy();
    });

    it("navega a CrearGrupo al presionar CTA", () => {
      mockViewModelReturn = buildViewModel({ isEmpty: true, gruposConStats: [] });
      mockGruposContextReturn = { grupos: [] };

      const { getByText } = renderScreen();
      fireEvent.press(getByText("Crear mi primer grupo"));

      expect(mockNavigate).toHaveBeenCalledWith("CrearGrupo");
    });
  });

  // ─── Loading State ───

  describe("loading state", () => {
    it("muestra esqueleto de carga", () => {
      mockViewModelReturn = buildViewModel({ isLoading: true, isEmpty: false });

      const { toJSON } = renderScreen();
      // Skeleton renders without text, just verify no crash
      expect(toJSON()).toBeTruthy();
    });
  });

  // ─── Error State ───

  describe("error state", () => {
    it("muestra mensaje de error y botón reintentar", () => {
      mockViewModelReturn = buildViewModel({ error: "Sin conexión" });

      const { getByText } = renderScreen();
      expect(getByText("No se pudieron cargar los datos")).toBeTruthy();
      expect(getByText("Ocurrió un error al obtener la información de tus grupos")).toBeTruthy();
      expect(getByText("Reintentar")).toBeTruthy();
    });

    it("ejecuta recargar al presionar Reintentar", () => {
      mockViewModelReturn = buildViewModel({ error: "Error" });

      const { getByText } = renderScreen();
      fireEvent.press(getByText("Reintentar"));

      expect(mockRecargar).toHaveBeenCalledTimes(1);
    });
  });

  // ─── Dashboard KPIs ───

  describe("dashboard", () => {
    it("muestra los 4 KPIs con valores correctos", () => {
      const { getByText } = renderScreen();

      expect(getByText("45")).toBeTruthy();
      expect(getByText("8.2")).toBeTruthy();
      expect(getByText("92%")).toBeTruthy();
      expect(getByText("3")).toBeTruthy();
    });

    it("muestra los grupos activos", () => {
      const { getByText } = renderScreen();

      expect(getByText("7A Matemáticas")).toBeTruthy();
      expect(getByText("3B Física")).toBeTruthy();
    });

    it("muestra las acciones rápidas", () => {
      const { getByText, getAllByText } = renderScreen();

      expect(getByText("Calificar")).toBeTruthy();
      expect(getByText("Tarea")).toBeTruthy();
      expect(getByText("Reportes")).toBeTruthy();
      // "Asistencia" appears in quick actions + grupo card stats
      expect(getAllByText("Asistencia").length).toBeGreaterThanOrEqual(1);
    });

    it("muestra la sección de tip", () => {
      const { getByText } = renderScreen();
      expect(getByText("CONSEJO DEL DÍA")).toBeTruthy();
    });
  });

  // ─── Quick Actions Navigation ───

  describe("quick actions navigation", () => {
    it("navega directamente si solo hay un grupo", () => {
      mockViewModelReturn = buildViewModel({
        gruposConStats: [
          {
            id: 5,
            nombre: "7A",
            materia: "Mat",
            cantidadAlumnos: 10,
            estado: "activo",
            promedio: 8,
            asistencia: 90,
            pendientes: 0,
          },
        ],
      });
      mockGruposContextReturn = {
        grupos: [{ id: 5, nombre: "7A", materia: "Mat", estado: "activo" }],
      };

      const { getByText } = renderScreen();
      fireEvent.press(getByText("Calificar"));

      expect(mockNavigate).toHaveBeenCalledWith("CapturarCalificaciones", { grupoId: 5 });
    });

    it("abre selector modal si hay múltiples grupos", () => {
      const { getByText, queryByText } = renderScreen();

      fireEvent.press(getByText("Calificar"));

      // Should show the selector modal title
      expect(getByText("Calificar — Selecciona un grupo")).toBeTruthy();
    });
  });

  // ─── Grupo Press Navigation ───

  describe("grupo press", () => {
    it("navega a DetalleGrupo al presionar un grupo", () => {
      const { getByText } = renderScreen();
      fireEvent.press(getByText("7A Matemáticas"));

      expect(mockNavigate).toHaveBeenCalledWith("DetalleGrupo", {
        grupoId: 1,
        grupoNombre: "7A Matemáticas",
      });
    });
  });

  // ─── Alertas ───

  describe("alertas", () => {
    it("muestra sección de alertas cuando hay alertas", () => {
      mockViewModelReturn = buildViewModel({
        alertas: [
          {
            alumnoId: 10,
            nombre: "Pedro",
            apellidos: "García",
            grupoNombre: "7A",
            tipo: "critico",
            mensaje: "Promedio bajo (4.5)",
          },
        ],
      });

      const { getByText } = renderScreen();
      expect(getByText("Pedro García")).toBeTruthy();
      expect(getByText("Promedio bajo (4.5)")).toBeTruthy();
    });

    it("oculta sección de alertas cuando no hay alertas", () => {
      mockViewModelReturn = buildViewModel({ alertas: [] });

      const { queryByText } = renderScreen();
      expect(queryByText("ATENCIÓN REQUERIDA")).toBeNull();
    });

    it("navega a ReportesAlumno al presionar alerta", () => {
      mockViewModelReturn = buildViewModel({
        alertas: [
          {
            alumnoId: 15,
            nombre: "Luis",
            apellidos: "Martínez",
            grupoNombre: "7A",
            tipo: "critico",
            mensaje: "Promedio bajo (3.2)",
          },
        ],
      });

      const { getByText } = renderScreen();
      fireEvent.press(getByText("Luis Martínez"));

      expect(mockNavigate).toHaveBeenCalledWith("ReportesAlumno", {
        alumnoId: 15,
        alumnoNombre: "Luis Martínez",
      });
    });
  });

  // ─── Grupo Selector Modal ───

  describe("GrupoSelectorModal", () => {
    it("filtra grupos por búsqueda", async () => {
      const { getAllByText, getByPlaceholderText, queryByText } = renderScreen();

      fireEvent.press(getAllByText("Calificar")[0]);
      // Both grupos appear in dashboard list AND modal
      expect(getAllByText("7A Matemáticas").length).toBeGreaterThanOrEqual(2);
      expect(getAllByText("3B Física").length).toBeGreaterThanOrEqual(2);

      fireEvent.changeText(getByPlaceholderText("Buscar grupo..."), "Física");

      await waitFor(() => {
        // After filtering, 7A should appear only in dashboard list (1 instance)
        expect(getAllByText("7A Matemáticas")).toHaveLength(1);
        expect(getAllByText("3B Física").length).toBeGreaterThanOrEqual(2);
      });
    });

    it("cierra modal con botón Cancelar", () => {
      const { getByText, queryByText } = renderScreen();

      fireEvent.press(getByText("Calificar"));
      expect(getByText("Calificar — Selecciona un grupo")).toBeTruthy();

      fireEvent.press(getByText("Cancelar"));

      expect(queryByText("Calificar — Selecciona un grupo")).toBeNull();
    });

    it("navega al seleccionar grupo del modal", () => {
      const { getByText, getAllByText } = renderScreen();

      // Open modal for "Tarea" action
      fireEvent.press(getByText("Tarea"));

      // Press the grupo in the modal - there are 2 instances because of the dashboard list
      const grupoButtons = getAllByText("7A Matemáticas");
      // The last one should be the modal item
      fireEvent.press(grupoButtons[grupoButtons.length - 1]);

      expect(mockNavigate).toHaveBeenCalledWith("CrearTareaGrupo", { grupoId: 1 });
    });
  });

  // ─── CompararGruposModal ───

  describe("CompararGruposModal", () => {
    it("muestra botón Comparar Grupos con ≥2 grupos", () => {
      const { getByText } = renderScreen();
      expect(getByText("Comparar Grupos")).toBeTruthy();
    });

    it("oculta botón Comparar Grupos con <2 grupos", () => {
      mockViewModelReturn = buildViewModel({
        gruposConStats: [
          {
            id: 1,
            nombre: "7A",
            materia: "Mat",
            cantidadAlumnos: 10,
            estado: "activo",
            promedio: 8,
            asistencia: 90,
            pendientes: 0,
          },
        ],
      });
      mockGruposContextReturn = {
        grupos: [{ id: 1, nombre: "7A", materia: "Mat", estado: "activo" }],
      };

      const { queryByText } = renderScreen();
      expect(queryByText("Comparar Grupos")).toBeNull();
    });

    it("abre modal y muestra tabla comparativa", () => {
      const { getByText, getAllByText } = renderScreen();
      fireEvent.press(getByText("Comparar Grupos"));

      // Button + modal title = 2 instances
      expect(getAllByText("Comparar Grupos")).toHaveLength(2);
      expect(getByText("MÉTRICA")).toBeTruthy();
      expect(getByText("Alumnos")).toBeTruthy();
      // "Promedio" appears in grupo card stats + modal table
      expect(getAllByText("Promedio").length).toBeGreaterThanOrEqual(2);
      // "Asistencia" appears in quick actions + modal table
      expect(getAllByText("Asistencia").length).toBeGreaterThanOrEqual(2);
      // "Pendientes" may appear multiple times
      expect(getAllByText("Pendientes").length).toBeGreaterThanOrEqual(1);
    });

    it("cierra modal comparar con botón Cerrar", () => {
      const { getByText, queryByText } = renderScreen();
      fireEvent.press(getByText("Comparar Grupos"));

      expect(getByText("MÉTRICA")).toBeTruthy();

      fireEvent.press(getByText("Cerrar"));

      expect(queryByText("MÉTRICA")).toBeNull();
    });
  });
});
