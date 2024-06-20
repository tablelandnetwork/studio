import { type Cell } from "@tanstack/react-table";
import { type MouseEvent } from "react";
import { Checkbox } from "./ui/checkbox";

export function EditCell({
  row,
  table,
}: ReturnType<Cell<Record<string, unknown>, unknown>["getContext"]>) {
  const meta = table.options.meta;

  const setEditedRows = (e: MouseEvent<HTMLButtonElement>) => {
    const elName = e.currentTarget.name;
    meta?.setEditedRows((old) => ({
      ...old,
      [row.id]: !old[row.id],
    }));
    if (elName !== "edit") {
      meta?.revertData(row.index, e.currentTarget.name === "cancel");
    }
  };

  const removeRow = () => {
    meta?.removeRow(row.index);
  };

  return (
    <div>
      {meta?.editedRows[row.id] ? (
        <>
          <button name="cancel" onClick={setEditedRows}>
            X
          </button>{" "}
          <button name="done" onClick={setEditedRows}>
            ✔
          </button>
        </>
      ) : (
        <>
          <button name="edit" onClick={setEditedRows}>
            ✐
          </button>
          <button onClick={removeRow} name="remove">
            🗑
          </button>
        </>
      )}
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={row.getToggleSelectedHandler()}
      />
    </div>
  );
}
