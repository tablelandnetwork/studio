"use client";

import {
  type ColumnDef,
  type DisplayColumnDef,
  type VisibilityState,
  getCoreRowModel,
  getPaginationRowModel,
  useReactTable,
  type Row,
} from "@tanstack/react-table";
import React, { useMemo, useState } from "react";
import { type Schema } from "@tableland/sdk";
// import {
//   diff,
//   addedDiff,
//   deletedDiff,
//   updatedDiff,
//   detailedDiff,
// } from "deep-object-diff";
import { hasConstraint } from "@tableland/studio-store";
import { ChevronDown } from "lucide-react";
import { DataTable } from "./data-table";
import TableCell from "./table-cell";
import { EditCell } from "./edit-cell";
import { Button } from "./ui/button";
import {
  type TableRow,
  type ExistingRow,
  type NewRow,
  type EditedRow,
  type DeletedRow,
} from "./table-data-types";
import { objectToTableData } from "@/lib/utils";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface Updates {
  new: NewRow[];
  edited: EditedRow[];
  deleted: DeletedRow[];
}

interface TableDataProps {
  columns: Schema["columns"];
  initialData: Array<Record<string, unknown>>;
}

export function TableData({
  columns: sdkColumns,
  initialData,
}: TableDataProps) {
  initialData = objectToTableData(initialData);

  const initialRows: ExistingRow[] = initialData.map((row) => ({
    type: "existing",
    ...row,
  }));

  const [data, setData] = useState<TableRow[]>(() => [...initialRows]);

  const updates = useMemo(() => {
    const res = data.reduce<Updates>(
      (acc, row) => {
        if (row.type === "new") {
          acc.new.push(row);
        } else if (row.type === "edited") {
          acc.edited.push(row);
        } else if (row.type === "deleted") {
          acc.deleted.push(row);
        }
        return acc;
      },
      {
        new: [],
        edited: [],
        deleted: [],
      },
    );
    return res;
  }, [data]);

  const pkName = sdkColumns.find(
    (col) =>
      hasConstraint(col, "primary key") ||
      hasConstraint(col, "primary key autoincrement"),
  )?.name;

  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});

  const editing =
    !!updates.new.length || !!updates.edited.length || !!updates.deleted.length;

  const columns:
    | Array<ColumnDef<TableRow> | DisplayColumnDef<TableRow>>
    | undefined = sdkColumns.map((col) => ({
    accessorKey: col.name,
    header: col.name,
    cell: TableCell,
    meta: {
      type: col.type === "integer" || col.type === "int" ? "number" : "string",
    },
  }));
  if (pkName) {
    columns.push({ id: "edit", cell: EditCell });
  }

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    initialState: {
      pagination: {
        pageSize: 15,
      },
    },
    state: {
      columnVisibility,
    },
    meta: {
      pkName,
      editRow: (rowToEdit: Row<TableRow>) => {
        const tableRow = rowToEdit.original;
        switch (tableRow.type) {
          case "existing":
            setData((old) =>
              old.map((row, index) =>
                index === rowToEdit.index
                  ? {
                      ...row,
                      type: "edited",
                      originalData: tableRow,
                    }
                  : row,
              ),
            );
            break;
        }
      },
      revertAll: () => {
        setData(() => [...initialRows]);
      },
      revertRow: (rowToRevert: Row<TableRow>) => {
        const tableRow = rowToRevert.original;
        switch (tableRow.type) {
          case "edited":
            setData((old) =>
              old.map((row, index) =>
                index === rowToRevert.index ? tableRow.originalData : row,
              ),
            );
            break;
          case "new":
            setData((old) =>
              old.filter((_, index) => index !== rowToRevert.index),
            );
            break;
          case "deleted":
            setData((old) =>
              old.map((row, index) =>
                index === rowToRevert.index ? tableRow.originalData : row,
              ),
            );
            break;
        }
      },
      updateData: (
        rowToUpdate: Row<TableRow>,
        columnId: string,
        value: string | number,
      ) => {
        const tableRow = rowToUpdate.original;
        switch (tableRow.type) {
          case "edited":
          case "new":
            setData((old) =>
              old.map((row, index) => {
                if (rowToUpdate.index === index) {
                  return {
                    ...old[index],
                    [columnId]: value,
                  };
                }
                return row;
              }),
            );
            break;
        }
      },
      addRow: () => {
        setData((old) => [{ type: "new" }, ...old]);
      },
      deleteRow: (rowToDelete: Row<TableRow>) => {
        const tableRow = rowToDelete.original;
        switch (tableRow.type) {
          case "existing":
            setData((old) =>
              old.map((row, index) =>
                index === rowToDelete.index
                  ? { ...row, type: "deleted", originalData: tableRow }
                  : row,
              ),
            );
            break;
          case "edited":
            setData((old) =>
              old.map((row, index) =>
                index === rowToDelete.index
                  ? {
                      ...row,
                      type: "deleted",
                      originalData: tableRow.originalData,
                    }
                  : row,
              ),
            );
            break;
          case "new":
            setData((old) =>
              old.filter((_, index) => index !== rowToDelete.index),
            );
            break;
        }
      },
      getRowClassName: (row) => {
        return row.original.type === "deleted"
          ? "bg-destructive text-destructive-foreground"
          : "";
      },
    },
  });

  return (
    <>
      <div className="flex items-center gap-x-4">
        <div className="ml-auto flex items-center gap-x-2">
          {editing && (
            <>
              <Button>Save</Button>
              <Button
                variant="secondary"
                onClick={() => table.options.meta?.revertAll()}
              >
                Revert all
              </Button>
            </>
          )}
          <Button
            variant="outline"
            onClick={() => table.options.meta?.addRow()}
          >
            Add row
          </Button>
        </div>
        {!!columns.length && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline">
                Columns
                <ChevronDown className="ml-2 h-4 w-4 opacity-50" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {table
                .getAllColumns()
                .filter((column) => column.getCanHide())
                .map((column) => {
                  return (
                    <DropdownMenuCheckboxItem
                      key={column.id}
                      checked={column.getIsVisible()}
                      onCheckedChange={(value) =>
                        column.toggleVisibility(!!value)
                      }
                    >
                      {column.id}
                    </DropdownMenuCheckboxItem>
                  );
                })}
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>
      <DataTable columns={columns} data={data} table={table} />
      <Button onClick={() => table.options.meta?.addRow()}>Add Row</Button>
      <pre>{JSON.stringify(updates, null, "\t")}</pre>
    </>
  );
}
