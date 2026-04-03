import React from "react";
import { render, fireEvent } from "@testing-library/react-native";
import PostOptionsSheet from "../../components/PostOptionsSheet";

jest.mock("@expo/vector-icons/MaterialIcons", () => "MaterialIcons");

jest.mock("../../context/ThemeContext", () => ({
  useTheme: () => ({
    theme: "light",
    isDark: false,
    colors: {
      primary: "#1676D2",
      surfaceContainerLowest: "#FFFFFF",
      surfaceContainerLow: "#f1f4f8",
      surfaceContainerHigh: "#e3e8ef",
      onSurface: "#181c1f",
      onSurfaceVariant: "#43474e",
      outlineVariant: "#c0c7d4",
      error: "#BA1A1A",
    },
  }),
}));

describe("PostOptionsSheet", () => {
  const mockOnClose = jest.fn();
  const mockOnEdit = jest.fn();
  const mockOnPin = jest.fn();
  const mockOnDelete = jest.fn();
  const mockOnSaveToLibrary = jest.fn();
  const mockOnCopyLink = jest.fn();
  const mockOnMuteAuthor = jest.fn();
  const mockOnReport = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("muestra opciones de post propio", () => {
    const { getByText } = render(
      <PostOptionsSheet
        visible={true}
        onClose={mockOnClose}
        isOwnPost={true}
        onEdit={mockOnEdit}
        onPin={mockOnPin}
        onDelete={mockOnDelete}
      />
    );

    expect(getByText("Editar publicación")).toBeTruthy();
    expect(getByText("Fijar en perfil")).toBeTruthy();
    expect(getByText("Eliminar publicación")).toBeTruthy();
  });

  it("muestra opciones de post ajeno", () => {
    const { getByText } = render(
      <PostOptionsSheet
        visible={true}
        onClose={mockOnClose}
        isOwnPost={false}
        onSaveToLibrary={mockOnSaveToLibrary}
        onCopyLink={mockOnCopyLink}
        onMuteAuthor={mockOnMuteAuthor}
        onReport={mockOnReport}
      />
    );

    expect(getByText("Guardar en biblioteca")).toBeTruthy();
    expect(getByText("Copiar enlace")).toBeTruthy();
    expect(getByText("Silenciar autor")).toBeTruthy();
    expect(getByText("Reportar publicación")).toBeTruthy();
  });

  it("llama onEdit al tocar editar", () => {
    const { getByText } = render(
      <PostOptionsSheet
        visible={true}
        onClose={mockOnClose}
        isOwnPost={true}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete}
      />
    );

    fireEvent.press(getByText("Editar publicación"));
    expect(mockOnEdit).toHaveBeenCalled();
    expect(mockOnClose).toHaveBeenCalled();
  });

  it("llama onDelete al tocar eliminar", () => {
    const { getByText } = render(
      <PostOptionsSheet
        visible={true}
        onClose={mockOnClose}
        isOwnPost={true}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete}
      />
    );

    fireEvent.press(getByText("Eliminar publicación"));
    expect(mockOnDelete).toHaveBeenCalled();
  });

  it("llama onReport al tocar reportar", () => {
    const { getByText } = render(
      <PostOptionsSheet
        visible={true}
        onClose={mockOnClose}
        isOwnPost={false}
        onReport={mockOnReport}
      />
    );

    fireEvent.press(getByText("Reportar publicación"));
    expect(mockOnReport).toHaveBeenCalled();
  });

  it("muestra botón Cancelar", () => {
    const { getByText } = render(
      <PostOptionsSheet visible={true} onClose={mockOnClose} isOwnPost={true} />
    );

    expect(getByText("Cancelar")).toBeTruthy();
    fireEvent.press(getByText("Cancelar"));
    expect(mockOnClose).toHaveBeenCalled();
  });

  it("no renderiza contenido cuando visible=false", () => {
    const { queryByText } = render(
      <PostOptionsSheet visible={false} onClose={mockOnClose} isOwnPost={true} />
    );

    // Modal is not visible, content may or may not render depending on RN
    // but modal should be hidden
    expect(queryByText("GESTIONAR PUBLICACIÓN")).toBeNull();
  });

  it("muestra header correcto para post propio", () => {
    const { getByText } = render(
      <PostOptionsSheet visible={true} onClose={mockOnClose} isOwnPost={true} />
    );

    expect(getByText("GESTIONAR PUBLICACIÓN")).toBeTruthy();
  });

  it("muestra header correcto para post ajeno", () => {
    const { getByText } = render(
      <PostOptionsSheet visible={true} onClose={mockOnClose} isOwnPost={false} />
    );

    expect(getByText("OPCIONES")).toBeTruthy();
  });
});
