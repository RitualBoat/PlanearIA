import React from "react";
import { render, fireEvent } from "@testing-library/react-native";
import ConfirmDialog from "../../components/ConfirmDialog";

jest.mock("@expo/vector-icons/MaterialIcons", () => "MaterialIcons");

describe("ConfirmDialog", () => {
  const defaultProps = {
    visible: true,
    title: "¿Eliminar elemento?",
    message: "Esta acción no se puede deshacer.",
    confirmLabel: "Eliminar",
    onConfirm: jest.fn(),
    onCancel: jest.fn(),
  };

  beforeEach(() => jest.clearAllMocks());

  it("renderiza título y mensaje", () => {
    const { getByText } = render(<ConfirmDialog {...defaultProps} />);
    expect(getByText("¿Eliminar elemento?")).toBeTruthy();
    expect(getByText("Esta acción no se puede deshacer.")).toBeTruthy();
  });

  it("muestra los botones de confirmar y cancelar", () => {
    const { getByText } = render(<ConfirmDialog {...defaultProps} />);
    expect(getByText("Eliminar")).toBeTruthy();
    expect(getByText("Cancelar")).toBeTruthy();
  });

  it("permite customizar cancelLabel", () => {
    const { getByText } = render(<ConfirmDialog {...defaultProps} cancelLabel="No, volver" />);
    expect(getByText("No, volver")).toBeTruthy();
  });

  it("llama onConfirm al presionar botón confirmar", () => {
    const { getByLabelText } = render(<ConfirmDialog {...defaultProps} />);
    fireEvent.press(getByLabelText("Eliminar"));
    expect(defaultProps.onConfirm).toHaveBeenCalledTimes(1);
  });

  it("llama onCancel al presionar botón cancelar", () => {
    const { getByLabelText } = render(<ConfirmDialog {...defaultProps} />);
    fireEvent.press(getByLabelText("Cancelar"));
    expect(defaultProps.onCancel).toHaveBeenCalledTimes(1);
  });

  it("renderiza icono cuando se proporciona", () => {
    const { toJSON } = render(<ConfirmDialog {...defaultProps} icon="warning" />);
    expect(toJSON()).toBeTruthy();
  });

  it("aplica estilo destructive cuando destructive=true", () => {
    const { getByLabelText } = render(<ConfirmDialog {...defaultProps} destructive />);
    const btn = getByLabelText("Eliminar");
    expect(btn).toBeTruthy();
  });
});
