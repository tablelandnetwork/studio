"use client";

import {
  type ColumnDef,
  type VisibilityState,
  flexRender,
  getCoreRowModel,
  getPaginationRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { useAccount, useConnect } from "wagmi";
import { ChevronDown } from "lucide-react";
import React from "react";
import { Database, Validator, helpers } from "@tableland/sdk";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface DataTableProps<TData, TValue> {
  columns: Array<ColumnDef<TData, TValue>>;
  data: TData[];
  chainId: number;
  tableId: string;
  tableName: string;
}

export function DataTable<TData, TValue>({
  columns,
  data,
  chainId,
  tableId,
  tableName,
}: DataTableProps<TData, TValue>) {
  const { isConnected, address } = useAccount();
  const [columnVisibility, setColumnVisibility] =
    React.useState<VisibilityState>({});
  const [showEdit, setShowEdit] = React.useState(false);

  const baseUrl = helpers.getBaseUrl(chainId);
  const db = new Database({ baseUrl });
  const validator = new Validator({ baseUrl });

  // Some tables are escaped with the tick mark, need to remove those from the column name
  const cols = columns.map((col: any) => {
    const formattedName = col.name.replace(/^`/, "").replace(/`$/, "");
    return { accessorKey: formattedName, header: formattedName };
  });

  const table = useReactTable({
    data,
    columns: cols,
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
  });

  const cellCount = table.getRowModel().rows[0]?.getVisibleCells().length;
  const [insertingRow, setInsertingRow] = React.useState(false);
  const [insertingValues, setInsertingValues] = React.useState({});
  const [saving, setSaving] = React.useState(false);
  const toggleInsert = function () {
    setInsertingRow(!insertingRow);
  };
  const setInputValue = function (eve: Event, cellId: string) {
    const column = cellId.split("_").pop();
    if (typeof column !== "string") throw new Error("invalid cell id");
    // @ts-ignore
    setInsertingValues({ ...insertingValues, [column]: eve.target.value });
  };
  const commitInsert = async function () {
    console.log("Saving inserted row");
    setSaving(true);
    console.log(insertingValues);

    // TODO: this is tricky... need to map columns back to values and depending on type add ticks or quotes etc...
    const entries = Object.entries(insertingValues);
    const cols = entries.map((val) => {
      const colTicks = columns.find(
        // @ts-ignore
        (col) => col.name.replace(/^`/, "").replace(/`$/, "") === val[0],
      );
      // @ts-ignore
      if (colTicks) return "`" + colTicks.name + "`";
      // @ts-ignore
      const colPlain = columns.find((col) => col.name === val[0]);
      // @ts-ignore
      if (colPlain) return colPlain.name;
    });

    const vals = entries.map((val) => {
      const col = columns.find(
        // @ts-ignore
        (col) => col.name.replace(/^`/, "").replace(/`$/, "") === val[0],
      );
      // @ts-ignore
      if (col?.type === "text") return `'${val[1]}'`;
      return val[1];
    });

    if (!vals.length || vals.length !== cols.length)
      throw new Error("cannot build insert statement");

    await db
      .prepare(
        `insert into ${tableName} (${cols.join(",")}) values (${vals.join(
          ",",
        )});`,
      )
      .all();

    // TODO: we need to refresh the data

    setInsertingRow(false);
    setSaving(false);
  };

  // TODO: we need a nice way to decide who is allowed to edit.
  //    e.g. owners can edit and addresses that have been `GRANT`ed insert perms
  const loadPermission = async function () {
    const [acl] = await validator.queryByStatement({
      statement: `select* from system_acl where chain_id=${chainId} and table_id=${tableId}`,
    });
    // @ts-ignore
    const show = isConnected && acl?.controller === address;
    setShowEdit(show);
  };

  React.useEffect(function () {
    loadPermission();
  }, []);

  return (
    <div>
      <div className="text-right">
        {showEdit &&
          (insertingRow ? (
            <>
              <Button
                variant="secondary"
                className="ml-4"
                onClick={commitInsert}
              >
                Save
              </Button>
              <Button
                variant="destructive"
                className="ml-4"
                onClick={toggleInsert}
              >
                Cancel Insert
              </Button>
            </>
          ) : (
            <Button
              // @ts-ignore
              variant={saving ? "loading" : "outline"}
              className="ml-4"
              onClick={toggleInsert}
            >
              + Insert Row
            </Button>
          ))}
        {!!data.length && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="ml-4">
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
      <div className="mt-4 rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead key={header.id}>
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext(),
                          )}
                    </TableHead>
                  );
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {insertingRow && (
              <TableRow key="insertonly" data-state="selected">
                {table.getHeaderGroups()[0].headers?.map((cell) => (
                  <TableCell key={cell.id}>
                    <div>
                      <p className="text-foreground-muted">
                        type:{" "}
                        <b>
                          {
                            // @ts-ignore
                            columns.find(
                              (col) =>
                                // @ts-ignore
                                col.name.replace(/^`/, "").replace(/`$/, "") ===
                                cell.id,
                            // @ts-ignore
                            )?.type
                          }
                        </b>
                      </p>
                      <p className="text-foreground-muted">
                        constraints:{" "}
                        <b>
                          {
                          // @ts-ignore
                          columns
                            .find(
                              (col) =>
                                // @ts-ignore
                                col.name.replace(/^`/, "").replace(/`$/, "") ===
                                cell.id,
                            )
                            // @ts-ignore
                            .constraints?.join(", ") || "none"}
                        </b>
                      </p>
                      <Input
                        name={cell.id}
                        // @ts-ignore
                        onChange={(value) => setInputValue(value, cell.id)}
                      />
                    </div>
                  </TableCell>
                ))}
              </TableRow>
            )}

            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && "selected"}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext(),
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center"
                >
                  No results.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      <div className="flex items-center justify-end space-x-2 py-4">
        <Button
          variant="outline"
          size="sm"
          onClick={() => table.previousPage()}
          disabled={!table.getCanPreviousPage()}
        >
          Previous
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => table.nextPage()}
          disabled={!table.getCanNextPage()}
        >
          Next
        </Button>
      </div>
    </div>
  );
}
