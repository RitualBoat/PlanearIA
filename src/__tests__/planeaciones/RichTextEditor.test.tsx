import React from "react";
import { Platform } from "react-native";
import { render } from "@testing-library/react-native";
import { RichTextEditor } from "../../components/editor/RichTextEditor";

const mockEditor = {
  setEditable: jest.fn(),
  setContent: jest.fn(),
};

const mockUseEditorBridge = jest.fn((_config?: unknown) => mockEditor);
const mockUseEditorContent = jest.fn((_editor?: unknown, _options?: unknown) => ({
  type: "doc",
  content: [{ type: "paragraph", content: [{ type: "text", text: "Hola" }] }],
}));

jest.mock("@10play/tentap-editor", () => ({
  RichText: () => {
    const React = require("react");
    const { Text } = require("react-native");
    return React.createElement(Text, { testID: "native-richtext" }, "native");
  },
  TenTapStartKit: [],
  useEditorBridge: (...args: any[]) => mockUseEditorBridge(args[0]),
  useEditorContent: (...args: any[]) => mockUseEditorContent(args[0], args[1]),
}));

jest.mock("../../components/editor/bridges/TableBridge", () => ({
  TableBridge: {},
}));

jest.mock("../../context/ThemeContext", () => ({
  useTheme: () => ({
    colors: {
      borderLight: "#d9d9d9",
      surfaceContainerLowest: "#ffffff",
      surfaceContainerLow: "#f4f4f4",
      onSurface: "#1f1f1f",
      onSurfaceVariant: "#4b4b4b",
      textMuted: "#8a8a8a",
      surface: "#ffffff",
    },
  }),
}));

describe("RichTextEditor", () => {
  const originalPlatform = Platform.OS;

  afterEach(() => {
    jest.clearAllMocks();
    Object.defineProperty(Platform, "OS", {
      configurable: true,
      get: () => originalPlatform,
    });
  });

  it("uses web fallback and avoids rendering native RichText on web", () => {
    Object.defineProperty(Platform, "OS", {
      configurable: true,
      get: () => "web",
    });

    const onChange = jest.fn();
    const { getByText, getByTestId, queryByTestId } = render(
      <RichTextEditor initialContent='{"type":"doc","content":[{"type":"paragraph","content":[{"type":"text","text":"Base"}]}]}' onChange={onChange} />
    );

    expect(getByText("Titulo")).toBeTruthy();
    expect(getByTestId("web-richtext-editor").props.contentEditable).toBe("true");
    expect(getByTestId("web-richtext-editor").props.tabIndex).toBe(0);
    expect(getByTestId("web-richtext-editor").props.dangerouslySetInnerHTML).toBeUndefined();
    expect(queryByTestId("native-richtext")).toBeNull();
  });

  it("does not re-emit identical editor payload on rerender", () => {
    Object.defineProperty(Platform, "OS", {
      configurable: true,
      get: () => "ios",
    });

    const onChangeFirst = jest.fn();
    const { rerender } = render(
      <RichTextEditor initialContent='{"type":"doc","content":[{"type":"paragraph"}]}' onChange={onChangeFirst} />
    );

    expect(onChangeFirst).toHaveBeenCalledTimes(1);

    const onChangeSecond = jest.fn();
    rerender(<RichTextEditor initialContent='{"type":"doc","content":[{"type":"paragraph"}]}' onChange={onChangeSecond} />);

    expect(onChangeSecond).not.toHaveBeenCalled();
  });

  it("passes HTML rendered from JSON to native TenTap and reports editor ready once", () => {
    Object.defineProperty(Platform, "OS", {
      configurable: true,
      get: () => "ios",
    });

    const firstEditor = { setEditable: jest.fn(), setContent: jest.fn() };
    const secondEditor = { setEditable: jest.fn(), setContent: jest.fn() };
    mockUseEditorBridge.mockImplementationOnce(() => firstEditor).mockImplementationOnce(() => secondEditor);

    const initialContent = {
      type: "doc",
      content: [{ type: "paragraph", content: [{ type: "text", text: "Base nativa" }] }],
    };
    const onEditorReady = jest.fn();

    const { rerender } = render(
      <RichTextEditor initialContent={initialContent} onEditorReady={onEditorReady} />
    );

    rerender(<RichTextEditor initialContent={initialContent} onEditorReady={onEditorReady} />);

    expect(mockUseEditorBridge).toHaveBeenCalledWith(
      expect.objectContaining({
        initialContent: expect.stringContaining("Base nativa"),
      })
    );
    expect(mockUseEditorBridge).toHaveBeenCalledWith(
      expect.objectContaining({
        initialContent: expect.not.stringContaining('"type":"doc"'),
      })
    );
    expect(onEditorReady).toHaveBeenCalledTimes(1);
  });

  it("converts JSON strings to HTML before passing content to native TenTap", () => {
    Object.defineProperty(Platform, "OS", {
      configurable: true,
      get: () => "android",
    });

    const initialContent = {
      type: "doc",
      content: [{ type: "paragraph", content: [{ type: "text", text: "Plantilla movil" }] }],
    };

    render(<RichTextEditor initialContent={JSON.stringify(initialContent)} />);

    expect(mockUseEditorBridge).toHaveBeenCalledWith(
      expect.objectContaining({
        initialContent: expect.stringContaining("Plantilla movil"),
      })
    );
    expect(mockUseEditorBridge).toHaveBeenCalledWith(
      expect.objectContaining({
        initialContent: expect.not.stringContaining('"type":"doc"'),
      })
    );
  });
});
