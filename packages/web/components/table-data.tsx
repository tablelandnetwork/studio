"use client";

import { Database, type Table } from "@tableland/sdk";
import { drizzle } from "drizzle-orm/d1";
import { integer, int, sqliteTable, text, blob } from "drizzle-orm/sqlite-core";
import { eq } from "drizzle-orm/expressions";
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
import { updatedDiff } from "deep-object-diff";
import { hasConstraint } from "@tableland/studio-store";
import { ChevronDown } from "lucide-react";
import { useRouter } from "next/navigation";
import { DataTable } from "./data-table";
import TableCell from "./table-cell";
import { EditCell } from "./edit-cell";
import { Button } from "./ui/button";
import {
  type TableRowData,
  type ExistingRowData,
  type NewRowData,
  type EditedRowData,
  type DeletedRowData,
} from "./table-data-types";
import { objectToTableData } from "@/lib/utils";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

type NonEmptyArray<T> = [T, ...T[]];

interface Updates {
  new: NewRowData[];
  edited: EditedRowData[];
  deleted: DeletedRowData[];
}

interface TableDataProps {
  table: Table;
  initialData: Array<Record<string, unknown>>;
}

const tbl = new Database({
  autoWait: true,
});

export function TableData({ table: tblTable, initialData }: TableDataProps) {
  const router = useRouter();

  const pkName = tblTable.schema.columns.find(
    (col) =>
      hasConstraint(col, "primary key") ||
      hasConstraint(col, "primary key autoincrement"),
  )?.name;

  const tableSchema = useMemo(
    () =>
      tblTable.schema.columns.reduce<Record<string, any>>((acc, col) => {
        if (col.type === "text") {
          acc[col.name] = text(col.name);
        } else if (col.type === "integer") {
          acc[col.name] = integer(col.name);
        } else if (col.type === "int") {
          acc[col.name] = int(col.name);
        } else if (col.type === "blob") {
          acc[col.name] = blob(col.name);
        }
        return acc;
      }, {}),
    [tblTable],
  );
  const drizzleTable = useMemo(
    () => sqliteTable(tblTable.name, tableSchema),
    [tblTable, tableSchema],
  );
  const db = useMemo(
    () => drizzle(tbl, { schema: drizzleTable, logger: false }),
    [drizzleTable],
  );

  // const { params: ps, sql } = db
  //   .update(drizzleTable)
  //   .set({ table_name: "foo", chain_id: "1" })
  //   .where(eq(drizzleTable.table_id, "abcdef"))
  //   .toSQL();

  // console.log("SQL HERE:", sql);

  // console.log("bound:", tbl.prepare(sql).bind(ps).toString());

  initialData = objectToTableData(initialData);

  const initialRows: ExistingRowData[] = initialData.map((row) => ({
    type: "existing",
    data: { ...row },
  }));

  const [data, setData] = useState<TableRowData[]>(() => [...initialRows]);

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

  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});

  const editing =
    !!updates.new.length || !!updates.edited.length || !!updates.deleted.length;

  const columns:
    | Array<ColumnDef<TableRowData> | DisplayColumnDef<TableRowData>>
    | undefined = tblTable.schema.columns.map((col) => ({
    accessorKey: `data.${col.name}`,
    header: col.name,
    cell: TableCell,
    meta: {
      columnName: col.name,
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
      editRow: (rowToEdit: Row<TableRowData>) => {
        const tableRowData = rowToEdit.original;
        switch (tableRowData.type) {
          case "existing":
            setData((old) =>
              old.map((row, index) =>
                index === rowToEdit.index
                  ? {
                      type: "edited",
                      data: { ...row.data },
                      originalData: tableRowData,
                    }
                  : row,
              ),
            );
            break;
        }
      },
      updateRowColumn: (
        rowToUpdate: Row<TableRowData>,
        columnName: string,
        value: string | number,
      ) => {
        const tableRowData = rowToUpdate.original;
        switch (tableRowData.type) {
          case "edited":
            setData((old) =>
              old.map((row, index) => {
                if (rowToUpdate.index === index) {
                  const data = {
                    ...tableRowData.data,
                    [columnName]: value,
                  };
                  const diff = updatedDiff(
                    tableRowData.originalData.data,
                    data,
                  );
                  console.log("DIFF", diff);
                  return {
                    ...tableRowData,
                    data,
                    diff: Object.keys(diff).length ? diff : undefined,
                  };
                }
                return row;
              }),
            );
            break;
          case "new":
            setData((old) =>
              old.map((row, index) => {
                if (rowToUpdate.index === index) {
                  return {
                    ...tableRowData,
                    data: {
                      ...tableRowData.data,
                      [columnName]: value,
                    },
                  };
                }
                return row;
              }),
            );
            break;
        }
      },
      addRow: () => {
        setData((old) => [{ type: "new", data: {} }, ...old]);
      },
      deleteRow: (rowToDelete: Row<TableRowData>) => {
        const tableRowData = rowToDelete.original;
        switch (tableRowData.type) {
          case "existing":
            setData((old) =>
              old.map((row, index) =>
                index === rowToDelete.index
                  ? {
                      data: { ...row.data },
                      type: "deleted",
                      originalData: tableRowData,
                    }
                  : row,
              ),
            );
            break;
          case "edited":
            setData((old) =>
              old.map((row, index) =>
                index === rowToDelete.index
                  ? {
                      data: { ...row.data },
                      type: "deleted",
                      originalData: tableRowData.originalData,
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
      revertRow: (rowToRevert: Row<TableRowData>) => {
        const tableRowData = rowToRevert.original;
        switch (tableRowData.type) {
          case "edited":
            setData((old) =>
              old.map((row, index) =>
                index === rowToRevert.index ? tableRowData.originalData : row,
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
                index === rowToRevert.index ? tableRowData.originalData : row,
              ),
            );
            break;
        }
      },
      revertAll: () => {
        setData(() => [...initialRows]);
      },
      getRowClassName: (row) => {
        return row.original.type === "deleted"
          ? "bg-destructive/50 text-destructive-foreground hover:bg-destructive/70"
          : "";
      },
    },
  });

  const executeStatements = () => {
    const sqlInsertItems = updates.new.map((row) => {
      return db.insert(drizzleTable).values(row.data);
    });
    const sqlUpdateItems = updates.edited
      .filter((update) => update.diff)
      .map((row) => {
        return db
          .update(drizzleTable)
          .set(row.diff!)
          .where(eq(drizzleTable[pkName!], row.originalData.data[pkName!]));
      });
    const sqlDeleteItems = updates.deleted.map((row) => {
      return db
        .delete(drizzleTable)
        .where(eq(drizzleTable[pkName!], row.originalData.data[pkName!]));
    });
    type Hmm =
      | (typeof sqlInsertItems)[number]
      | (typeof sqlUpdateItems)[number]
      | (typeof sqlDeleteItems)[number];
    const ugh = [
      ...sqlInsertItems,
      ...sqlUpdateItems,
      ...sqlDeleteItems,
    ] as NonEmptyArray<Hmm>;
    db.batch(ugh)
      .then((res) => {
        router.refresh();
      })
      .catch((err) => {
        console.log("ERR", err);
      });
  };

  return (
    <>
      <div className="flex items-center gap-x-4">
        <div className="ml-auto flex items-center gap-x-2">
          {editing && (
            <>
              <Button onClick={executeStatements}>Save</Button>
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
      <pre>{JSON.stringify(updates, null, "\t")}</pre>
    </>
  );
}
