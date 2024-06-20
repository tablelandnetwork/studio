import "@tanstack/table-core";

declare module "@tanstack/table-core" {
  interface TableMeta<TData extends RowData> {
    revertData: (rowIndex: number, revert: boolean) => void;
    updateData: (
      rowIndex: number,
      columnId: string,
      value: string | number,
    ) => void;
    addRow: () => void;
    removeRow: (rowIndex: number) => void;
    removeSelectedRows: (selectedRows: number[]) => void;
    editedRows: Record<string, boolean>;
    setEditedRows: React.Dispatch<
      React.SetStateAction<Record<string, boolean>>
    >;
  }
  interface ColumnMeta {
    type: "number" | "string";
  }
}
