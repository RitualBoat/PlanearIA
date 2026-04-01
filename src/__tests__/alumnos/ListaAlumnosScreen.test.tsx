import React from "react";
import { Alert } from "react-native";
import { fireEvent, render } from "@testing-library/react-native";
import ListaAlumnosScreen from "../../screens/alumnos/ListaAlumnosScreen";

const mockNavigate = jest.fn();
const mockEliminarAlumno = jest.fn();

jest.mock("@expo/vector-icons/MaterialIcons", () => "MaterialIcons");

jest.mock("@react-navigation/native", () => ({
  useNavigation: () => ({
    navigate: mockNavigate,
  }),
}));

jest.mock("../../context/AlumnosContext", () => ({
  useAlumnos: () => ({
    isLoading: false,
    eliminarAlumno: mockEliminarAlumno,
    alumnos: [
      {
        id: 1,
        nombre: "Ana",
        apellidos: "Lopez",
        numeroControl: "A001",
        carrera: "ISC",
        fechaIngreso: "2026-01-01T00:00:00.000Z",
        estado: "activo",
      },
      {
        id: 2,
        nombre: "Bruno",
        apellidos: "Perez",
        numeroControl: "A002",
        carrera: "IGE",
        fechaIngreso: "2026-01-01T00:00:00.000Z",
        estado: "activo",
      },
    ],
  }),
}));

describe("ListaAlumnosScreen", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renderiza la lista de alumnos", () => {
    const { getByText } = render(<ListaAlumnosScreen />);

    expect(getByText("Students")).toBeTruthy();
    expect(getByText("Ana Lopez")).toBeTruthy();
    expect(getByText("Bruno Perez")).toBeTruthy();
  });

  it("filtra por busqueda de nombre o control", () => {
    const { getByPlaceholderText, queryByText, getByText } = render(<ListaAlumnosScreen />);

    fireEvent.changeText(getByPlaceholderText("Buscar alumnos..."), "A002");

    expect(getByText("Bruno Perez")).toBeTruthy();
    expect(queryByText("Ana Lopez")).toBeNull();
  });

  it("elimina alumno con confirmacion", () => {
    const alertSpy = jest.spyOn(Alert, "alert").mockImplementation((_, __, buttons) => {
      const eliminar = buttons?.find((button) => button.text === "Eliminar");
      eliminar?.onPress?.();
    });

    const { getByTestId } = render(<ListaAlumnosScreen />);

    fireEvent.press(getByTestId("delete-menu-1"));

    expect(alertSpy).toHaveBeenCalled();
    expect(mockEliminarAlumno).toHaveBeenCalledWith(1);

    alertSpy.mockRestore();
  });
});
