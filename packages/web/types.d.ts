import "@tanstack/table-core";
import { Row, RowData } from "@tanstack/react-table";

declare module "@tanstack/table-core" {
  interface TableMeta<TData extends RowData> {
    getRowClassName: (row: Row<TData>) => string;
    pkName: string | undefined;
    editRow: (row: Row<TData>) => void;
    revertAll: () => void;
    revertRow: (row: Row<TData>) => void;
    updateData: (
      row: Row<TData>,
      columnId: string,
      value: string | number,
    ) => void;
    addRow: () => void;
    deleteRow: (row: Row<TData>) => void;
  }
  interface ColumnMeta {
    type: "number" | "string";
  }
}
