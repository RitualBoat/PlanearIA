import React from "react";
import { fireEvent, render } from "@testing-library/react-native";
import PlaneacionesScreen from "../../screens/planeaciones/PlaneacionesScreen";

jest.mock("@expo/vector-icons/MaterialIcons", () => {
  const React = require("react");
  const { Text } = require("react-native");
  return () => <Text>Icon</Text>;
});

jest.mock("../../components/BottomNavBar", () => {
  const React = require("react");
  const { Text } = require("react-native");
  return () => <Text>BottomNavBar</Text>;
});

describe("PlaneacionesScreen - Importar", () => {
  it("navega a ImportarPlaneacion desde la nueva tarjeta", () => {
    const navigate = jest.fn();

    const { getByText } = render(
      <PlaneacionesScreen navigation={{ navigate } as any} />
    );

    fireEvent.press(getByText("Importar Planeación"));

    expect(navigate).toHaveBeenCalledWith("ImportarPlaneacion");
  });
});
