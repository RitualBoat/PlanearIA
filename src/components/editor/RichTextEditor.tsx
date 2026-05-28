import React, { useEffect, useMemo, useRef } from "react";
import { StyleSheet, View, type StyleProp, type ViewStyle } from "react-native";
import {
  RichText,
  TenTapStartKit,
  useEditorBridge,
  useEditorContent,
  type EditorBridge,
} from "@10play/tentap-editor";
import { useTheme } from "../../context/ThemeContext";
import type { EditorMode } from "../../hooks/useEditorMode";
import { TableBridge } from "./bridges/TableBridge";

type SerializableEditorContent = string | Record<string, unknown>;

export interface RichTextEditorProps {
  initialContent?: SerializableEditorContent;
  onChange?: (content: Record<string, unknown>) => void;
  editable?: boolean;
  mode?: EditorMode;
  placeholder?: string;
  style?: StyleProp<ViewStyle>;
  minHeight?: number;
  onEditorReady?: (editor: EditorBridge) => void;
}

const normalizeContent = (value?: SerializableEditorContent): SerializableEditorContent => {
  if (value == null) return "";
  return value;
};

const fingerprintContent = (value: SerializableEditorContent): string => {
  if (typeof value === "string") return value;
  try {
    return JSON.stringify(value);
  } catch {
    return "";
  }
};

export const RichTextEditor: React.FC<RichTextEditorProps> = ({
  initialContent,
  onChange,
  editable = true,
  mode = "mobile",
  placeholder = "Escribe tu planeacion aqui...",
  style,
  minHeight,
  onEditorReady,
}) => {
  const { colors } = useTheme();
  const safeInitialContent = normalizeContent(initialContent);
  const latestContentFingerprint = fingerprintContent(safeInitialContent);
  const latestContentFingerprintRef = useRef(latestContentFingerprint);

  const bridgeExtensions = useMemo(
    () => [
      // TenTapStartKit ya incluye TaskList, Placeholder y Heading.
      ...TenTapStartKit,
      TableBridge,
    ],
    []
  );

  const editor = useEditorBridge({
    bridgeExtensions,
    autofocus: false,
    avoidIosKeyboard: true,
    initialContent: safeInitialContent,
    editable,
  });

  const jsonContent = useEditorContent(editor, {
    type: "json",
    debounceInterval: 200,
  });

  useEffect(() => {
    onEditorReady?.(editor);
  }, [editor, onEditorReady]);

  useEffect(() => {
    if (typeof (editor as any).setPlaceholder === "function") {
      (editor as any).setPlaceholder(placeholder);
    }
  }, [editor, placeholder]);

  useEffect(() => {
    if (latestContentFingerprintRef.current === latestContentFingerprint) return;
    latestContentFingerprintRef.current = latestContentFingerprint;
    editor.setContent(safeInitialContent as any);
  }, [editor, latestContentFingerprint, safeInitialContent]);

  useEffect(() => {
    if (!jsonContent || !onChange) return;
    onChange(jsonContent as Record<string, unknown>);
  }, [jsonContent, onChange]);

  const computedMinHeight = minHeight ?? (mode === "standard" ? 420 : 300);

  return (
    <View
      style={[
        styles.wrapper,
        {
          minHeight: computedMinHeight,
          borderColor: colors.borderLight,
          backgroundColor: colors.surfaceContainerLowest,
        },
        mode === "standard" ? styles.standard : styles.mobile,
        style,
      ]}
    >
      <RichText editor={editor} style={styles.editorWebView} />
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    borderWidth: 1,
    borderRadius: 14,
    overflow: "hidden",
  },
  standard: {
    paddingHorizontal: 10,
    paddingVertical: 8,
  },
  mobile: {
    paddingHorizontal: 6,
    paddingVertical: 6,
  },
  editorWebView: {
    flex: 1,
    minHeight: 260,
  },
});

export default RichTextEditor;
