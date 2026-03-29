import React from "react";
import { render } from "@testing-library/react-native";
import ImportarPlaneacionScreen from "../../screens/planeaciones/ImportarPlaneacionScreen";

const mockGoBack = jest.fn();

jest.mock("@react-navigation/native", () => ({
  useNavigation: () => ({
    goBack: mockGoBack,
  }),
}));

jest.mock("@expo/vector-icons/MaterialIcons", () => {
  const React = require("react");
  const { Text } = require("react-native");
  return () => <Text>Icon</Text>;
});

describe("ImportarPlaneacionScreen", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renderiza secciones principales del diseño", () => {
    const { getByText, getAllByText } = render(<ImportarPlaneacionScreen />);

    expect(getByText("Importar Planeación")).toBeTruthy();
    expect(getAllByText("Seleccionar archivo").length).toBeGreaterThan(0);
    expect(getByText("Arrastra o selecciona un archivo")).toBeTruthy();
    expect(getByText("Vista previa")).toBeTruthy();
    expect(getByText("Importar y continuar")).toBeTruthy();
    expect(getByText("Cancelar")).toBeTruthy();
  });
});
