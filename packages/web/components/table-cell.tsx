import { useEffect, useState } from "react";
import { type Cell } from "@tanstack/react-table";
import { Input } from "./ui/input";

export default function TableCell({
  getValue,
  row,
  column,
  table,
}: ReturnType<Cell<Record<string, unknown>, unknown>["getContext"]>) {
  const initialValue = getValue();
  const columnMeta = column.columnDef.meta;
  const tableMeta = table.options.meta;

  const [value, setValue] = useState(isValue(initialValue) ? initialValue : "");

  useEffect(() => {
    setValue(isValue(initialValue) ? initialValue : "");
  }, [initialValue]);

  const onBlur = () => {
    table.options.meta?.updateData(row.index, column.id, value);
  };

  if (tableMeta?.editedRows[row.id]) {
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
