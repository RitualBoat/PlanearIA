import React, { useCallback, useEffect, useLayoutEffect, useMemo, useRef } from "react";
import {
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
  type StyleProp,
  type ViewStyle,
} from "react-native";
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

const normalizeNativeContent = (value?: SerializableEditorContent): string => {
  const normalized = normalizeContent(value);
  if (typeof normalized === "string") {
    const trimmed = normalized.trim();
    if (trimmed.startsWith("{") || trimmed.startsWith("[")) {
      try {
        return tipTapToHtml(JSON.parse(trimmed) as Record<string, unknown>);
      } catch {
        return normalized;
      }
    }
    return normalized;
  }

  return tipTapToHtml(normalized);
};

const fingerprintContent = (value: SerializableEditorContent): string => {
  if (typeof value === "string") return value;
  try {
    return JSON.stringify(value);
  } catch {
    return "";
  }
};

const escapeHtml = (value: string): string =>
  value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");

const parseToPlainText = (value?: SerializableEditorContent): string => {
  if (value == null) return "";
  if (typeof value === "string") {
    const trimmed = value.trim();
    if (!trimmed) return "";
    if (trimmed.startsWith("{") || trimmed.startsWith("[")) {
      try {
        return parseToPlainText(JSON.parse(trimmed) as Record<string, unknown>);
      } catch {
        return value;
      }
    }
    return value;
  }

  const node = value as { type?: string; text?: string; content?: unknown[] };
  if (typeof node.text === "string") return node.text;
  if (!Array.isArray(node.content)) return "";
  return node.content
    .flatMap((item) => {
      const text = parseToPlainText(item as SerializableEditorContent);
      return text ? [text] : [];
    })
    .join(node.type === "doc" ? "\n" : " ")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
};

const plainTextToDocJson = (value: string): Record<string, unknown> => {
  const lines = value.replace(/\r\n/g, "\n").split("\n");
  return {
    type: "doc",
    content: lines.map((line) => ({
      type: "paragraph",
      content: line
        ? [
            {
              type: "text",
              text: line,
            },
          ]
        : [],
    })),
  };
};

const nodeTextContent = (node: Record<string, unknown>): string => {
  if (typeof node.text === "string") return node.text;
  const children = Array.isArray(node.content) ? node.content : [];
  return children.map((child) => nodeTextContent(child as Record<string, unknown>)).join("");
};

const renderNodeToHtml = (node: unknown): string => {
  if (!node || typeof node !== "object") return "";
  const record = node as Record<string, unknown>;
  const type = String(record.type || "");
  const children = Array.isArray(record.content) ? record.content.map(renderNodeToHtml).join("") : "";

  if (type === "doc") return children;
  if (type === "text") {
    const text = escapeHtml(String(record.text || ""));
    const marks = Array.isArray(record.marks) ? record.marks : [];
    return marks.reduce((acc, mark) => {
      const markType = String((mark as Record<string, unknown>).type || "");
      if (markType === "bold") return `<strong>${acc}</strong>`;
      if (markType === "italic") return `<em>${acc}</em>`;
      if (markType === "underline") return `<u>${acc}</u>`;
      return acc;
    }, text);
  }
  if (type === "hardBreak") return "<br/>";
  if (type === "heading") {
    const attrs = (record.attrs || {}) as Record<string, unknown>;
    const level = Math.max(1, Math.min(Number(attrs.level || 2), 4));
    return `<h${level}>${children || escapeHtml(nodeTextContent(record)) || "<br/>"}</h${level}>`;
  }
  if (type === "paragraph") return `<p>${children || "<br/>"}</p>`;
  if (type === "bulletList") return `<ul>${children}</ul>`;
  if (type === "orderedList") return `<ol>${children}</ol>`;
  if (type === "listItem") return `<li>${children || "<br/>"}</li>`;
  if (type === "table") return `<table class="planeacion-doc-table"><tbody>${children}</tbody></table>`;
  if (type === "tableRow") return `<tr>${children}</tr>`;
  if (type === "tableHeader") return `<th>${children || "<p><br/></p>"}</th>`;
  if (type === "tableCell") return `<td>${children || "<p><br/></p>"}</td>`;
  return children || `<p>${escapeHtml(nodeTextContent(record))}</p>`;
};

const tipTapToHtml = (value?: SerializableEditorContent): string => {
  const normalized = normalizeContent(value);
  if (typeof normalized === "string") {
    const trimmed = normalized.trim();
    if (!trimmed) return "<p><br/></p>";
    if (trimmed.startsWith("{") || trimmed.startsWith("[")) {
      try {
        return tipTapToHtml(JSON.parse(trimmed) as Record<string, unknown>);
      } catch {
        return `<p>${escapeHtml(trimmed).replace(/\n/g, "<br/>")}</p>`;
      }
    }
    return `<p>${escapeHtml(trimmed).replace(/\n/g, "<br/>")}</p>`;
  }

  return renderNodeToHtml(normalized) || "<p><br/></p>";
};

const inlineNodesFromElement = (element: Element): Record<string, unknown>[] => {
  const nodes: Record<string, unknown>[] = [];
  element.childNodes.forEach((child) => {
    if (child.nodeType === 3) {
      const text = child.textContent || "";
      if (text) nodes.push({ type: "text", text });
      return;
    }

    if (child.nodeType !== 1) return;
    const childElement = child as Element;
    const tag = childElement.tagName.toLowerCase();
    if (tag === "br") {
      nodes.push({ type: "hardBreak" });
      return;
    }

    const inner = inlineNodesFromElement(childElement);
    if (tag === "strong" || tag === "b" || tag === "em" || tag === "i" || tag === "u") {
      const markType = tag === "strong" || tag === "b" ? "bold" : tag === "u" ? "underline" : "italic";
      inner.forEach((item) => {
        if (item.type === "text") {
          nodes.push({
            ...item,
            marks: [...((item.marks as unknown[]) || []), { type: markType }],
          });
        } else {
          nodes.push(item);
        }
      });
      return;
    }

    nodes.push(...inner);
  });

  return nodes;
};

const blockFromElement = (element: Element): Record<string, unknown> | null => {
  const tag = element.tagName.toLowerCase();

  if (/^h[1-6]$/.test(tag)) {
    return {
      type: "heading",
      attrs: { level: Number(tag.slice(1)) },
      content: inlineNodesFromElement(element),
    };
  }

  if (tag === "table") {
    return {
      type: "table",
      content: Array.from(element.querySelectorAll(":scope > tbody > tr, :scope > tr"))
        .flatMap((row) => {
          const block = blockFromElement(row);
          return block ? [block] : [];
        }),
    };
  }

  if (tag === "tr") {
    return {
      type: "tableRow",
      content: Array.from(element.children)
        .flatMap((cell) => {
          const block = blockFromElement(cell);
          return block ? [block] : [];
        }),
    };
  }

  if (tag === "th" || tag === "td") {
    const content = Array.from(element.children)
      .flatMap((child) => {
        const block = blockFromElement(child);
        return block ? [block] : [];
      });
    return {
      type: tag === "th" ? "tableHeader" : "tableCell",
      content: content.length ? content : [{ type: "paragraph", content: inlineNodesFromElement(element) }],
    };
  }

  if (tag === "ul" || tag === "ol") {
    return {
      type: tag === "ul" ? "bulletList" : "orderedList",
      content: Array.from(element.children)
        .flatMap((child) => {
          const block = blockFromElement(child);
          return block ? [block] : [];
        }),
    };
  }

  if (tag === "li") {
    return {
      type: "listItem",
      content: [{ type: "paragraph", content: inlineNodesFromElement(element) }],
    };
  }

  const content = inlineNodesFromElement(element);
  return {
    type: "paragraph",
    content,
  };
};

const htmlToTipTapDoc = (html: string): Record<string, unknown> => {
  if (typeof document === "undefined") {
    return plainTextToDocJson(html.replace(/<[^>]+>/g, " "));
  }

  const container = document.createElement("div");
  container.innerHTML = html;
  const content = Array.from(container.children)
    .flatMap((child) => {
      const block = blockFromElement(child);
      return block ? [block] : [];
    });

  return {
    type: "doc",
    content: content.length ? content : [{ type: "paragraph" }],
  };
};

const NativeRichTextEditor: React.FC<RichTextEditorProps> = ({
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
  const safeInitialContent = useMemo(() => normalizeNativeContent(initialContent), [initialContent]);
  const latestContentFingerprint = useMemo(() => fingerprintContent(safeInitialContent), [safeInitialContent]);
  const latestContentFingerprintRef = useRef(latestContentFingerprint);
  const latestOnChangeRef = useRef(onChange);
  const emittedJsonFingerprintRef = useRef("");
  const appliedContentFingerprintRef = useRef(latestContentFingerprint);
  const readyEditorRef = useRef<EditorBridge | null>(null);
  const editableRef = useRef(editable);

  useEffect(() => {
    latestOnChangeRef.current = onChange;
  }, [onChange]);

  const bridgeExtensions = useMemo(
    () => [
      // TenTapStartKit already includes heading/task list/placeholder support.
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

  const jsonFingerprint = useMemo(() => {
    if (!jsonContent) return "";
    try {
      return JSON.stringify(jsonContent);
    } catch {
      return "";
    }
  }, [jsonContent]);

  useEffect(() => {
    if (readyEditorRef.current) return;
    readyEditorRef.current = editor;
    onEditorReady?.(editor);
  }, [editor, onEditorReady]);

  useEffect(() => {
    if (editableRef.current === editable) return;
    editableRef.current = editable;
    editor.setEditable(editable);
  }, [editable, editor]);

  useEffect(() => {
    if (typeof (editor as any).setPlaceholder === "function") {
      (editor as any).setPlaceholder(placeholder);
    }
  }, [editor, placeholder]);

  useEffect(() => {
    if (appliedContentFingerprintRef.current === latestContentFingerprint) return;
    if (emittedJsonFingerprintRef.current === latestContentFingerprint) {
      appliedContentFingerprintRef.current = latestContentFingerprint;
      latestContentFingerprintRef.current = latestContentFingerprint;
      return;
    }
    latestContentFingerprintRef.current = latestContentFingerprint;
    appliedContentFingerprintRef.current = latestContentFingerprint;
    editor.setContent(safeInitialContent as any);
  }, [editor, latestContentFingerprint, safeInitialContent]);

  useEffect(() => {
    if (!jsonContent || !jsonFingerprint) return;
    if (emittedJsonFingerprintRef.current === jsonFingerprint) return;
    latestContentFingerprintRef.current = jsonFingerprint;
    appliedContentFingerprintRef.current = jsonFingerprint;
    emittedJsonFingerprintRef.current = jsonFingerprint;
    latestOnChangeRef.current?.(jsonContent as Record<string, unknown>);
  }, [jsonContent, jsonFingerprint]);

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

const WebFallbackRichTextEditor: React.FC<RichTextEditorProps> = ({
  initialContent,
  onChange,
  editable = true,
  mode = "mobile",
  placeholder = "Escribe tu planeacion aqui...",
  style,
  minHeight,
}) => {
  const { colors } = useTheme();
  const safeInitialContent = normalizeContent(initialContent);
  const incomingFingerprint = fingerprintContent(safeInitialContent);
  const lastIncomingFingerprintRef = useRef(incomingFingerprint);
  const lastEmittedFingerprintRef = useRef("");
  const latestOnChangeRef = useRef(onChange);
  const editableElementRef = useRef<any>(null);
  const hasHydratedWebEditorRef = useRef(false);

  const emitCurrentHtml = useCallback(() => {
    const html = String(editableElementRef.current?.innerHTML || "");
    const jsonDoc = htmlToTipTapDoc(html);
    const serialized = JSON.stringify(jsonDoc);
    if (lastEmittedFingerprintRef.current === serialized) return;
    lastEmittedFingerprintRef.current = serialized;
    latestOnChangeRef.current?.(jsonDoc);
  }, []);

  const stopEditorEvent = useCallback((event: { stopPropagation?: () => void }) => {
    event.stopPropagation?.();
  }, []);

  const focusEditableElement = useCallback(
    (event: { stopPropagation?: () => void }) => {
      event.stopPropagation?.();
      if (!editable) return;
      editableElementRef.current?.focus?.();
    },
    [editable]
  );

  useEffect(() => {
    latestOnChangeRef.current = onChange;
  }, [onChange]);

  useLayoutEffect(() => {
    if (!editableElementRef.current || hasHydratedWebEditorRef.current) return;
    editableElementRef.current.innerHTML = tipTapToHtml(safeInitialContent);
    hasHydratedWebEditorRef.current = true;
  }, [safeInitialContent]);

  useEffect(() => {
    if (lastIncomingFingerprintRef.current === incomingFingerprint) return;
    lastIncomingFingerprintRef.current = incomingFingerprint;
    if (lastEmittedFingerprintRef.current === incomingFingerprint) return;
    const nextHtml = tipTapToHtml(safeInitialContent);
    if (editableElementRef.current && editableElementRef.current.innerHTML !== nextHtml) {
      editableElementRef.current.innerHTML = nextHtml;
    }
  }, [incomingFingerprint, safeInitialContent]);

  const computedMinHeight = minHeight ?? (mode === "standard" ? 420 : 300);
  const pageMinHeight = Math.max(computedMinHeight, mode === "standard" ? 680 : 500);

  const runCommand = (command: string, value?: string) => {
    if (!editable || typeof document === "undefined") return;
    editableElementRef.current?.focus?.();
    document.execCommand(command, false, value);
    emitCurrentHtml();
  };

  const insertTableTemplate = () => {
    runCommand(
      "insertHTML",
      '<table class="planeacion-doc-table"><tbody><tr><th>Campo 1</th><th>Campo 2</th><th>Campo 3</th></tr><tr><td><p>Valor</p></td><td><p>Valor</p></td><td><p>Valor</p></td></tr></tbody></table><p><br/></p>'
    );
  };

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
      <View
        style={[
          styles.webToolbar,
          {
            borderColor: colors.borderLight,
            backgroundColor: colors.surfaceContainerLow,
          },
        ]}
      >
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Titulo"
          onPress={() => runCommand("formatBlock", "h2")}
          style={styles.webToolbarButton}
        >
          <Text style={[styles.webToolbarButtonText, { color: colors.onSurfaceVariant }]}>Titulo</Text>
        </Pressable>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Subtitulo"
          onPress={() => runCommand("formatBlock", "h3")}
          style={styles.webToolbarButton}
        >
          <Text style={[styles.webToolbarButtonText, { color: colors.onSurfaceVariant }]}>Subtitulo</Text>
        </Pressable>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Parrafo"
          onPress={() => runCommand("formatBlock", "p")}
          style={styles.webToolbarButton}
        >
          <Text style={[styles.webToolbarButtonText, { color: colors.onSurfaceVariant }]}>Parrafo</Text>
        </Pressable>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Negrita"
          onPress={() => runCommand("bold")}
          style={styles.webToolbarButton}
        >
          <Text style={[styles.webToolbarButtonText, { color: colors.onSurfaceVariant }]}>Negrita</Text>
        </Pressable>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Cursiva"
          onPress={() => runCommand("italic")}
          style={styles.webToolbarButton}
        >
          <Text style={[styles.webToolbarButtonText, { color: colors.onSurfaceVariant }]}>Cursiva</Text>
        </Pressable>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Subrayado"
          onPress={() => runCommand("underline")}
          style={styles.webToolbarButton}
        >
          <Text style={[styles.webToolbarButtonText, { color: colors.onSurfaceVariant }]}>Subrayado</Text>
        </Pressable>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Lista"
          onPress={() => runCommand("insertUnorderedList")}
          style={styles.webToolbarButton}
        >
          <Text style={[styles.webToolbarButtonText, { color: colors.onSurfaceVariant }]}>Lista</Text>
        </Pressable>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Numerada"
          onPress={() => runCommand("insertOrderedList")}
          style={styles.webToolbarButton}
        >
          <Text style={[styles.webToolbarButtonText, { color: colors.onSurfaceVariant }]}>Numerada</Text>
        </Pressable>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Checklist"
          onPress={() => runCommand("insertHTML", '<p><input type="checkbox"/> Pendiente</p>')}
          style={styles.webToolbarButton}
        >
          <Text style={[styles.webToolbarButtonText, { color: colors.onSurfaceVariant }]}>Checklist</Text>
        </Pressable>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Tabla"
          onPress={insertTableTemplate}
          style={styles.webToolbarButton}
        >
          <Text style={[styles.webToolbarButtonText, { color: colors.onSurfaceVariant }]}>Tabla</Text>
        </Pressable>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Alinear izquierda"
          onPress={() => runCommand("justifyLeft")}
          style={styles.webToolbarButton}
        >
          <Text style={[styles.webToolbarButtonText, { color: colors.onSurfaceVariant }]}>Izq.</Text>
        </Pressable>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Centrar"
          onPress={() => runCommand("justifyCenter")}
          style={styles.webToolbarButton}
        >
          <Text style={[styles.webToolbarButtonText, { color: colors.onSurfaceVariant }]}>Centro</Text>
        </Pressable>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Alinear derecha"
          onPress={() => runCommand("justifyRight")}
          style={styles.webToolbarButton}
        >
          <Text style={[styles.webToolbarButtonText, { color: colors.onSurfaceVariant }]}>Der.</Text>
        </Pressable>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Justificar"
          onPress={() => runCommand("justifyFull")}
          style={styles.webToolbarButton}
        >
          <Text style={[styles.webToolbarButtonText, { color: colors.onSurfaceVariant }]}>Justificar</Text>
        </Pressable>
      </View>
      <View style={[styles.webPageBackdrop, { backgroundColor: colors.surfaceContainerLow }]}>
        <View
          style={[
            styles.webPage,
            {
              borderColor: colors.borderLight,
              backgroundColor: colors.surface,
              minHeight: pageMinHeight,
            },
          ]}
        >
          {React.createElement("style", {
            dangerouslySetInnerHTML: {
              __html: `
                .planeacion-doc-table {
                  border-collapse: collapse;
                  width: 100%;
                  margin: 10px 0 14px;
                }
                .planeacion-doc-table td,
                .planeacion-doc-table th {
                  border: 1px solid #222;
                  padding: 5px 7px;
                  vertical-align: top;
                }
                .planeacion-doc-table th {
                  background: #f3f5f8;
                  font-weight: 700;
                }
              `,
            },
          })}
          {React.createElement("div", {
            ref: editableElementRef,
            contentEditable: editable ? "true" : "false",
            suppressContentEditableWarning: true,
            role: "textbox",
            tabIndex: 0,
            spellCheck: true,
            "aria-label": placeholder,
            testID: "web-richtext-editor",
            "data-testid": "web-richtext-editor",
            onMouseDown: stopEditorEvent,
            onPointerDown: stopEditorEvent,
            onTouchStart: stopEditorEvent,
            onClick: focusEditableElement,
            onKeyDown: stopEditorEvent,
            onKeyUp: stopEditorEvent,
            onBeforeInput: stopEditorEvent,
            onInput: emitCurrentHtml,
            onBlur: emitCurrentHtml,
            style: {
              minHeight: pageMinHeight - 72,
              color: colors.onSurface,
              outline: "none",
              fontSize: 14,
              lineHeight: "20px",
              fontFamily: "Arial, sans-serif",
              whiteSpace: "normal",
              cursor: editable ? "text" : "default",
              userSelect: "text",
              WebkitUserSelect: "text",
              pointerEvents: "auto",
            },
          })}
        </View>
      </View>
    </View>
  );
};

export const RichTextEditor: React.FC<RichTextEditorProps> = (props) => {
  if (Platform.OS === "web") {
    return <WebFallbackRichTextEditor {...props} />;
  }
  return <NativeRichTextEditor {...props} />;
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
  webToolbar: {
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 8,
    paddingVertical: 8,
    marginBottom: 8,
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  webToolbarButton: {
    minHeight: 28,
    borderRadius: 8,
    paddingHorizontal: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  webToolbarButtonText: {
    fontSize: 12,
    fontWeight: "700",
  },
  webPageBackdrop: {
    borderRadius: 12,
    padding: 16,
  },
  webPage: {
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 28,
    paddingVertical: 28,
    shadowColor: "#000000",
    shadowOpacity: 0.08,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 8 },
    elevation: 2,
  },
});

export default RichTextEditor;
