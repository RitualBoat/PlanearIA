import { BridgeExtension } from "@10play/tentap-editor";
import { Table, TableCell, TableHeader, TableRow } from "@tiptap/extension-table";

export interface InsertTablePayload {
  rows?: number;
  cols?: number;
  withHeaderRow?: boolean;
}

export interface TableBridgeState {
  isTableActive: boolean;
  canInsertTable: boolean;
  canAddRowAfter: boolean;
  canAddColumnAfter: boolean;
  canDeleteTable: boolean;
}

export interface TableBridgeInstance {
  insertTable: (payload?: InsertTablePayload) => void;
  addRowAfter: () => void;
  addColumnAfter: () => void;
  deleteTable: () => void;
}

export enum TableEditorActionType {
  InsertTable = "insert-table",
  AddRowAfter = "add-row-after",
  AddColumnAfter = "add-column-after",
  DeleteTable = "delete-table",
}

type TableBridgeMessage =
  | {
      type: TableEditorActionType.InsertTable;
      payload?: InsertTablePayload;
    }
  | {
      type:
        | TableEditorActionType.AddRowAfter
        | TableEditorActionType.AddColumnAfter
        | TableEditorActionType.DeleteTable;
      payload?: undefined;
    };

const DEFAULT_TABLE: Required<InsertTablePayload> = {
  rows: 3,
  cols: 3,
  withHeaderRow: true,
};

export const TableBridge = new BridgeExtension<
  TableBridgeState,
  TableBridgeInstance,
  TableBridgeMessage
>({
  tiptapExtension: Table.configure({
    resizable: true,
    allowTableNodeSelection: true,
    HTMLAttributes: {
      class: "planeacion-table",
    },
  }),
  tiptapExtensionDeps: [TableRow, TableHeader, TableCell],
  onBridgeMessage: (editor, message) => {
    if (message.type === TableEditorActionType.InsertTable) {
      const payload = {
        ...DEFAULT_TABLE,
        ...(message.payload || {}),
      };
      editor.chain().focus().insertTable(payload).run();
      return false;
    }

    if (message.type === TableEditorActionType.AddRowAfter) {
      editor.chain().focus().addRowAfter().run();
      return false;
    }

    if (message.type === TableEditorActionType.AddColumnAfter) {
      editor.chain().focus().addColumnAfter().run();
      return false;
    }

    if (message.type === TableEditorActionType.DeleteTable) {
      editor.chain().focus().deleteTable().run();
      return false;
    }

    return false;
  },
  extendEditorInstance: (sendBridgeMessage) => {
    return {
      insertTable: (payload) =>
        sendBridgeMessage({
          type: TableEditorActionType.InsertTable,
          payload,
        }),
      addRowAfter: () =>
        sendBridgeMessage({
          type: TableEditorActionType.AddRowAfter,
        }),
      addColumnAfter: () =>
        sendBridgeMessage({
          type: TableEditorActionType.AddColumnAfter,
        }),
      deleteTable: () =>
        sendBridgeMessage({
          type: TableEditorActionType.DeleteTable,
        }),
    };
  },
  extendEditorState: (editor) => {
    return {
      isTableActive: editor.isActive("table"),
      canInsertTable: editor.can().insertTable(DEFAULT_TABLE),
      canAddRowAfter: editor.can().addRowAfter(),
      canAddColumnAfter: editor.can().addColumnAfter(),
      canDeleteTable: editor.can().deleteTable(),
    };
  },
  extendCSS: `
    .planeacion-table {
      border-collapse: collapse;
      margin: 0.5rem 0;
      width: 100%;
      min-width: 300px;
    }

    .planeacion-table td,
    .planeacion-table th {
      border: 1px solid #d0d7de;
      padding: 0.5rem;
      vertical-align: top;
    }

    .planeacion-table th {
      background: #f6f8fa;
      font-weight: 600;
    }
  `,
});
