"use client";

import { Database, helpers } from "@tableland/sdk";
import { drizzle } from "drizzle-orm/d1";
import { integer, int, sqliteTable, text, blob } from "drizzle-orm/sqlite-core";
import { eq, and } from "drizzle-orm/expressions";
import {
  type ColumnDef,
  type DisplayColumnDef,
  type VisibilityState,
  getCoreRowModel,
  useReactTable,
  type Row,
} from "@tanstack/react-table";
import { useEffect, useMemo, useState } from "react";
import { updatedDiff } from "deep-object-diff";
import { type Schema, hasConstraint } from "@tableland/studio-store";
import { AlertTriangle, ChevronDown, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { getNetwork, getWalletClient, switchNetwork } from "wagmi/actions";
import { decodeBase64 } from "ethers";
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
import { useToast } from "./ui/use-toast";
import { objectToTableData } from "@/lib/utils";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { type ACLItem } from "@/lib/validator-queries";
import { ensureError } from "@/lib/ensure-error";
import { walletClientToSigner } from "@/lib/wagmi-ethers";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

type NonEmptyArray<T> = [T, ...T[]];

interface Updates {
  new: NewRowData[];
  edited: EditedRowData[];
  deleted: DeletedRowData[];
}

interface TableDataProps {
  chainId: number;
  tableName: string;
  schema: Schema;
  initialData: Array<Record<string, unknown>>;
  accountPermissions?: ACLItem;
}

export function TableData({
  chainId,
  tableName,
  schema,
  initialData,
  accountPermissions,
}: TableDataProps) {
  const router = useRouter();
  const { toast } = useToast();

  const initialRows: ExistingRowData[] = useMemo(
    () =>
      objectToTableData(initialData).map((row) => ({
        type: "existing",
        data: { ...row },
      })),
    [initialData],
  );

  const [data, setData] = useState<TableRowData[]>([]);

  useEffect(() => {
    setData(() => [...initialRows]);
  }, [initialRows]);

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

  const editing =
    !!updates.new.length || !!updates.edited.length || !!updates.deleted.length;

  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});

  const columns:
    | Array<ColumnDef<TableRowData> | DisplayColumnDef<TableRowData>>
    | undefined = schema.columns.map((col) => ({
    accessorFn: (row) => row.data[col.name] ?? "",
    header: col.name,
    cell: TableCell,
    meta: {
      columnName: col.name,
      type: col.type === "integer" || col.type === "int" ? "number" : "string",
    },
  }));
  columns.push({ id: "edit", cell: EditCell });

  // TODO: support composite constraints
  const uniqueColumnName =
    schema.columns.find(
      (col) =>
        hasConstraint(col, "primary key") ||
        hasConstraint(col, "primary key autoincrement"),
    )?.name ?? schema.columns.find((col) => hasConstraint(col, "unique"))?.name;

  const [pendingTxn, setPendingTxn] = useState(false);

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    state: {
      columnVisibility,
    },
    meta: {
      pkName: uniqueColumnName,
      accountPermissions,
      pendingTxn,
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

  const executeStatements = async () => {
    const drizzleSchema = schema.columns.reduce<Record<string, any>>(
      (acc, col) => {
        if (col.type === "text") {
          acc[col.name] = text(col.name);
        } else if (col.type === "integer") {
          acc[col.name] = integer(col.name);
        } else if (col.type === "int") {
          acc[col.name] = int(col.name);
        } else if (col.type === "blob") {
          acc[col.name] = blob(col.name, { mode: "buffer" });
        }
        return acc;
      },
      {},
    );
    const drizzleTable = sqliteTable(tableName, drizzleSchema);

    const currentNetwork = getNetwork();
    if (currentNetwork.chain?.id !== chainId) {
      await switchNetwork({ chainId });
    }

    const walletClient = await getWalletClient({
      chainId,
    });
    if (!walletClient) {
      throw new Error("Unable to get wallet client");
    }
    const signer = walletClientToSigner(walletClient);
    const tbl = new Database({
      signer,
      baseUrl: helpers.getBaseUrl(chainId),
      autoWait: true,
    });
    const db = drizzle(tbl, {
      schema: { [tableName]: drizzleTable },
      logger: false,
    });

    const genWhereConstraints = (row: EditedRowData | DeletedRowData) => {
      if (uniqueColumnName) {
        return eq(
          drizzleTable[uniqueColumnName],
          row.originalData.data[uniqueColumnName],
        );
      }
      const eqs = Object.entries(row.originalData.data).map(([key, value]) => {
        return eq(drizzleTable[key], value);
      });
      return and(...eqs);
    };

    const convertBlobFields = function (obj: Record<string, unknown>) {
      for (const [key, val] of Object.entries(obj)) {
        if (typeof val !== "string") continue;
        const column = schema.columns.find((c) => c.name === key);
        if (column?.type === "blob") {
          obj[key] = decodeBase64(val);
        }
      }
    };

    const sqlInsertItems = updates.new.map((row) => {
      convertBlobFields(row.data);
      return db.insert(drizzleTable).values(row.data);
    });
    const sqlUpdateItems = updates.edited
      .filter((update) => update.diff)
      .map((row) => {
        convertBlobFields(row.diff! as Record<string, unknown>);
        return db
          .update(drizzleTable)
          .set(row.diff!)
          .where(genWhereConstraints(row));
      });
    const sqlDeleteItems = updates.deleted.map((row) => {
      return db.delete(drizzleTable).where(genWhereConstraints(row));
    });
    type SQLItems =
      | (typeof sqlInsertItems)[number]
      | (typeof sqlUpdateItems)[number]
      | (typeof sqlDeleteItems)[number];
    const batch = [
      ...sqlInsertItems,
      ...sqlUpdateItems,
      ...sqlDeleteItems,
    ] as NonEmptyArray<SQLItems>;
    await db.batch(batch);
  };

  const handleSave = () => {
    setPendingTxn(true);
    executeStatements()
      .then(() => router.refresh())
      .catch((err) => {
        toast({
          title: "Error executing SQL statements",
          description: ensureError(err).message,
          variant: "destructive",
        });
      })
      .finally(() => setPendingTxn(false));
  };

  return (
    <>
      <div className="flex items-center gap-x-4">
        <div className="ml-auto flex items-center gap-x-2">
          {!uniqueColumnName && (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <AlertTriangle className="shrink-0" />
                </TooltipTrigger>
                <TooltipContent className="max-w-60">
                  Studio was unable to identify a unique column for this table.
                  This is due to the lack of a primary key or unique constraint,
                  or because the primary key or unique constraint is a composite
                  constraint (Studio will support composite constraints soon!).
                  <br />
                  <br />
                  If your table contains rows with completely duplicate data,
                  and you edit or delete one of those rows, all duplicate rows
                  will be edited or deleted. Proceed with caution.
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}
          {editing && (
            <>
              <Button onClick={handleSave} disabled={pendingTxn}>
                {pendingTxn && <Loader2 className="mr-2 size-5 animate-spin" />}
                Save
              </Button>
              <Button
                variant="secondary"
                onClick={() => table.options.meta?.revertAll()}
                disabled={pendingTxn}
              >
                Revert all
              </Button>
            </>
          )}
          {accountPermissions?.privileges.insert && (
            <Button
              variant="outline"
              onClick={() => table.options.meta?.addRow()}
              disabled={pendingTxn}
            >
              Add row
            </Button>
          )}
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
      <DataTable table={table} />
    </>
  );
}
