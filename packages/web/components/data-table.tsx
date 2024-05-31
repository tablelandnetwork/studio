"use client";

import {
  type VisibilityState,
  flexRender,
  getCoreRowModel,
  getPaginationRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { useAccount } from "wagmi";
import { ChevronDown, Loader2 } from "lucide-react";
import React from "react";
import { Database, Validator, helpers } from "@tableland/sdk";
import { objectToTableData, formatIdentifierName } from "@/lib/utils";
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

type PartialRequired<T, S extends keyof T> = Omit<Required<T>, S> &
  Partial<Pick<T, S>>;

interface DataTableProps {
  columns: Array<
    PartialRequired<
      {
        readonly name?: string | undefined;
        readonly type?: string | undefined;
        readonly constraints?: readonly string[] | undefined;
      },
      "constraints"
    >
  >;
  chainId: number;
  tableId: string;
  tableName: string;
}

export function DataTable({
  columns,
  chainId,
  tableId,
  tableName,
}: DataTableProps) {
  const { isConnected, address } = useAccount();
  const [columnVisibility, setColumnVisibility] =
    React.useState<VisibilityState>({});
  const [canInsert, setCanInsert] = React.useState(false);
  const [data, setData] = React.useState([]);

  const baseUrl = helpers.getBaseUrl(chainId);
  const db = new Database({ baseUrl, autoWait: true });
  const validator = new Validator({ baseUrl });

  // Some tables are escaped with the tick mark, need to remove those from the column name
  const cols = columns.map((col: any) => {
    const formattedName = formatIdentifierName(col.name);
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

  const [insertingRow, setInsertingRow] = React.useState(false);
  const [insertingValues, setInsertingValues] = React.useState({});
  const [saving, setSaving] = React.useState(false);
  const toggleInsert = function () {
    setInsertingRow(!insertingRow);
  };
  const setInputValue = function (
    eve: React.FormEvent<HTMLInputElement>,
    cellId: string,
  ) {
    const column = cellId; //.split("_").slice(1).join("_");
    if (typeof column !== "string") throw new Error("invalid cell id");

    // TODO: Not sure why I have to type cast here.
    setInsertingValues({
      ...insertingValues,
      [column]: (eve.target as HTMLInputElement).value,
    });
  };
  const commitInsert = async function () {
    setSaving(true);

    // this is tricky... need to map columns back to values and depending on
    // column name and data type add ticks or quotes etc...
    const entries = Object.entries(insertingValues);
    const cols = entries
      .map((val) => {
        const colTicks = columns.find(
          (col) => col.name.replace(/^`/, "").replace(/`$/, "") === val[0],
        );
        if (colTicks) return "`" + colTicks.name + "`";

        const colQuotes = columns.find(
          (col) => col.name.replace(/^"/, "").replace(/"$/, "") === val[0],
        );
        if (colQuotes) return colQuotes.name;

        const colPlain = columns.find((col) => col.name === val[0]);
        if (colPlain) return colPlain.name;

        return "";
      })
      .filter((v) => v);

    const vals = entries.map((val) => {
      const col = columns.find(
        (col) => formatIdentifierName(col.name) === val[0],
      );

      // casting to ignore @typescript-eslint/restrict-template-expressions lint rule
      if (col?.type === "text") return `'${val[1] as string}'`;
      return val[1];
    });

    if (!vals.length || vals.length !== cols.length) {
      console.log("cannot build insert statement");
      setSaving(false);
      throw new Error("cannot build insert statement");
    }

    try {
      // TODO: need to confirm the wallet is connected to the right chain

      await db
        .prepare(
          `insert into ${tableName} (${cols.join(",")}) values (${vals.join(
            ",",
          )});`,
        )
        .all();

      await refreshData();
      setInsertingRow(false);
      setSaving(false);
    } catch (err: any) {
      console.log(err);
      setInsertingRow(false);
      setSaving(false);

      throw err;
    }
  };

  // privileges greater than or equal 4 means the address can insert
  const loadPermission = async function () {
    const [acl] = await validator.queryByStatement<{
      chain_id: number;
      controller: string;
      created_at: number;
      privileges: number;
      table_id: number;
      updated_at: number | null;
    }>({
      statement: `select * from system_acl
        where chain_id = ${chainId}
          and table_id = ${tableId}
          and controller = '${address?.toString() ?? ""}'
          and privileges >= 4`,
    });

    if (!isConnected) return setCanInsert(false);
    if (typeof acl.controller !== "string") setCanInsert(false);
    if (acl.controller !== address) setCanInsert(false);

    setCanInsert(true);
  };
  React.useEffect(function () {
    loadPermission().catch((e) => console.log(e));
    // pass an empty array so this only runs on the inital loading
  }, []);
  const refreshData = async function () {
    const data = await db.prepare(`SELECT * FROM ${tableName};`).all();
    setData(objectToTableData(data.results));
  };
  React.useEffect(function () {
    refreshData().catch((e) => console.log(e));
    // pass an empty array so this only runs on the inital loading
  }, []);

  return (
    <div>
      <div className="text-right">
        {canInsert && insertingRow && !saving && (
          <Button variant="secondary" className="ml-4" onClick={toggleInsert}>
            Cancel Insert
          </Button>
        )}
        {canInsert && insertingRow && (
          <Button
            className="ml-4"
            disabled={saving}
            onClick={() => {
              commitInsert().catch((err) => {
                throw err;
              });
            }}
          >
            {saving && <Loader2 className="h-5 w-5 animate-spin" />}
            Save
          </Button>
        )}
        {canInsert && !insertingRow && (
          <Button variant="outline" className="ml-4" onClick={toggleInsert}>
            + Insert Row
          </Button>
        )}

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
                            columns.find(
                              (col) =>
                                formatIdentifierName(col.name) ===
                                cell.id,
                            )?.type
                          }
                        </b>
                      </p>
                      <p className="text-foreground-muted">
                        constraints:{" "}
                        <b>
                          {typeof columns !== "undefined" &&
                            columns
                              .find((col: any) => {
                                return (
                                  formatIdentifierName(col.name) === cell.id
                                );
                              })
                              ?.constraints?.join(", ")}
                        </b>
                      </p>
                      <Input
                        name={cell.id}
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
