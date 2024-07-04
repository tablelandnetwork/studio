import { type Cell } from "@tanstack/react-table";
import { Undo2, Trash2, Pencil } from "lucide-react";
import { type TableRowData } from "./table-data-types";
import { Button } from "./ui/button";

export function EditCell({
  row,
  table,
}: ReturnType<Cell<TableRowData, unknown>["getContext"]>) {
  const meta = table.options.meta;

  const editRow = () => {
    meta?.editRow(row);
  };

  const revertRow = () => {
    meta?.revertRow(row);
  };

  const deleteRow = () => {
    meta?.deleteRow(row);
  };

  const type = row.original.type;

  return (
    <div className="flex items-center justify-end gap-x-1">
      {/* Edit */}
      {type === "existing" && (
        <Button variant="ghost" size="icon" title="Edit row" onClick={editRow}>
          <Pencil className="size-5" />
        </Button>
      )}
      {/* Revert */}
      {(type === "edited" || type === "deleted") && (
        <Button
          variant="ghost"
          size="icon"
          title="Revert row changes"
          onClick={revertRow}
        >
          <Undo2 className="size-5" />
        </Button>
      )}
      {/* Delete */}
      {(type === "existing" || type === "edited" || type === "new") && (
        <Button
          variant="ghost"
          size="icon"
          title="Delete row"
          onClick={deleteRow}
        >
          <Trash2 className="size-5" />
        </Button>
      )}
    </div>
  );
}
