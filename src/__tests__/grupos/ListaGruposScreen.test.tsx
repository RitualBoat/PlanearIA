import React from "react";
import { fireEvent, render } from "@testing-library/react-native";
import ListaGruposScreen from "../../screens/grupos/ListaGruposScreen";

jest.mock("@expo/vector-icons/MaterialIcons", () => "MaterialIcons");

// Presentational back button uses useNavigation; stub it (no NavigationContainer here)
jest.mock("../../components/ScreenBackButton", () => "ScreenBackButton");

const mockSetSearchQuery = jest.fn();

jest.mock("../../hooks/useGrupos", () => ({
  useGrupos: () => ({
    gruposFiltrados: [
      {
        id: 7,
        nombre: "3o A Secundaria",
        materia: "Pensamiento Matemático III",
        carrera: "ISC",
        semestre: 3,
        cantidadAlumnos: 24,
        estado: "activo",
      },
    ],
    isLoading: false,
    error: null,
    searchQuery: "",
    setSearchQuery: mockSetSearchQuery,
    conteoGrupos: 1,
    syncStatus: "synced",
    pendingSyncCount: 0,
    isOnline: true,
    sincronizarGrupos: jest.fn().mockResolvedValue(undefined),
  }),
}));

describe("ListaGruposScreen", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renderiza lista de grupos", () => {
    const navigation = { navigate: jest.fn() } as any;
    const { getByText } = render(<ListaGruposScreen navigation={navigation} />);

    expect(getByText("Mis Grupos")).toBeTruthy();
    expect(getByText("3o A Secundaria")).toBeTruthy();
    expect(getByText("1 grupos activos")).toBeTruthy();
  });

  it("aplica búsqueda al escribir", () => {
    const navigation = { navigate: jest.fn() } as any;
    const { getByPlaceholderText } = render(<ListaGruposScreen navigation={navigation} />);

    fireEvent.changeText(getByPlaceholderText("Buscar grupo..."), "secundaria");

    expect(mockSetSearchQuery).toHaveBeenCalledWith("secundaria");
  });

  it("navega a detalle al tocar un grupo", () => {
    const navigation = { navigate: jest.fn() } as any;
    const { getByText } = render(<ListaGruposScreen navigation={navigation} />);

    fireEvent.press(getByText("3o A Secundaria"));

    expect(navigation.navigate).toHaveBeenCalledWith("DetalleGrupo", {
      grupoId: 7,
      grupoNombre: "3o A Secundaria",
    });
  });
});
