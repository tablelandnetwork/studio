"use client";

import {
  type ColumnDef,
  type DisplayColumnDef,
  type VisibilityState,
  getCoreRowModel,
  getPaginationRowModel,
  useReactTable,
} from "@tanstack/react-table";
import React, { useState } from "react";
import { type Schema } from "@tableland/sdk";
import { DataTable } from "./data-table";
import TableCell from "./table-cell";
import { EditCell } from "./edit-cell";
import { objectToTableData } from "@/lib/utils";

interface TableDataProps {
  // columns: Array<ColumnDef<Record<string, unknown>>>;
  columns: Schema["columns"];
  initialData: Array<Record<string, unknown>>;
}

export function TableData({
  columns: sdkColumns,
  initialData,
}: TableDataProps) {
  const [data, setData] = useState(objectToTableData(initialData));
  const [originalData, setOriginalData] = useState(() => [...initialData]);
  const [editedRows, setEditedRows] = useState<Record<string, boolean>>({});

  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});

  const columns:
    | Array<
        | ColumnDef<Record<string, unknown>>
        | DisplayColumnDef<Record<string, unknown>>
      >
    | undefined = sdkColumns.map((col) => ({
    accessorKey: col.name,
    header: col.name,
    cell: TableCell,
    meta: {
      type: col.type === "integer" || col.type === "int" ? "number" : "string",
    },
  }));
  columns.push({ id: "edit", cell: EditCell });

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
      editedRows,
      setEditedRows,
      revertData: (rowIndex: number, revert: boolean) => {
        if (revert) {
          setData((old) =>
            old.map((row, index) =>
              index === rowIndex ? originalData[rowIndex] : row,
            ),
          );
        } else {
          setOriginalData((old) =>
            old.map((row, index) =>
              index === rowIndex ? data[rowIndex] : row,
            ),
          );
        }
      },
      updateData: (
        rowIndex: number,
        columnId: string,
        value: string | number,
      ) => {
        setData((old) =>
          old.map((row, index) => {
            if (index === rowIndex) {
              return {
                ...old[rowIndex],
                [columnId]: value,
              };
            }
            return row;
          }),
        );
      },
    },
  });

  return (
    <>
      <DataTable columns={columns} data={data} table={table} />
      <pre>{JSON.stringify(data, null, "\t")}</pre>
    </>
  );
}
