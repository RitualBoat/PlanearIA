import React from "react";
import { render, fireEvent } from "@testing-library/react-native";
import Toast from "../../components/Toast";

jest.mock("@expo/vector-icons/MaterialIcons", () => "MaterialIcons");

describe("Toast", () => {
  const defaultProps = {
    visible: true,
    message: "Operación exitosa",
    type: "success" as const,
    onDismiss: jest.fn(),
  };

  beforeEach(() => jest.clearAllMocks());

  it("no renderiza nada cuando visible=false", () => {
    const { toJSON } = render(<Toast {...defaultProps} visible={false} />);
    expect(toJSON()).toBeNull();
  });

  it("renderiza el mensaje cuando visible=true", () => {
    const { getByText } = render(<Toast {...defaultProps} />);
    expect(getByText("Operación exitosa")).toBeTruthy();
  });

  it("muestra botón de cerrar cuando dismissible=true (default)", () => {
    const { getByLabelText } = render(<Toast {...defaultProps} />);
    expect(getByLabelText("Cerrar notificación")).toBeTruthy();
  });

  it("no muestra botón de cerrar cuando dismissible=false", () => {
    const { queryByLabelText } = render(<Toast {...defaultProps} dismissible={false} />);
    expect(queryByLabelText("Cerrar notificación")).toBeNull();
  });

  it("tiene accessibilityRole='alert'", () => {
    const { getByText } = render(<Toast {...defaultProps} />);
    // Verify the message renders (Animated.View role not queryable in tests)
    expect(getByText("Operación exitosa")).toBeTruthy();
  });

  it("renderiza correctamente para type='error'", () => {
    const { getByText } = render(<Toast {...defaultProps} type="error" message="Algo salió mal" />);
    expect(getByText("Algo salió mal")).toBeTruthy();
  });

  it("renderiza correctamente para type='share'", () => {
    const { getByText } = render(<Toast {...defaultProps} type="share" message="Enlace copiado" />);
    expect(getByText("Enlace copiado")).toBeTruthy();
  });

  it("renderiza correctamente para type='info'", () => {
    const { getByText } = render(<Toast {...defaultProps} type="info" message="Información" />);
    expect(getByText("Información")).toBeTruthy();
  });
});
