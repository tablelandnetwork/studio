import { useEffect, useState } from "react";
import { type Cell } from "@tanstack/react-table";
import { Input } from "./ui/input";
import { type TableRow } from "./table-data-types";

export default function TableCell({
  getValue,
  row,
  column,
  table,
}: ReturnType<Cell<TableRow, unknown>["getContext"]>) {
  const initialValue = getValue();
  const columnMeta = column.columnDef.meta;

  const [value, setValue] = useState(isValue(initialValue) ? initialValue : "");

  useEffect(() => {
    setValue(isValue(initialValue) ? initialValue : "");
  }, [initialValue]);

  const onBlur = () => {
    table.options.meta?.updateData(row, column.id, value);
  };

  if (row.original.type === "edited" || row.original.type === "new") {
    return (
      <Input
        type={columnMeta?.type ?? "text"}
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onBlur={onBlur}
      />
    );
  }
  return <span>{value}</span>;
}

function isValue(value: unknown): value is string | number {
  return typeof value === "string" || typeof value === "number";
}
