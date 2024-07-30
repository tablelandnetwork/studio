import { flexRender, type Table as TSTable } from "@tanstack/react-table";
import React, { type HTMLAttributes } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";

type DataTableProps<TData> = {
  table: TSTable<TData>;
} & HTMLAttributes<HTMLDivElement>;

export function DataTable<TData>({
  table,
  className,
  ...rest
}: DataTableProps<TData>) {
  const hasResults = !!table.getRowModel().rows.length;

  return (
    <div
      className={cn(
        "mt-4 rounded-md border",
        !hasResults && "flex flex-col items-center justify-center",
        className,
      )}
      {...rest}
    >
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
        {hasResults && (
          <TableBody>
            {table.getRowModel().rows.map((row) => (
              <TableRow
                key={row.id}
                data-state={row.getIsSelected() && "selected"}
                className={table.options.meta?.getRowClassName(row)}
              >
                {row.getVisibleCells().map((cell) => (
                  <TableCell key={cell.id}>
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        )}
      </Table>
      {!hasResults && (
        <span className="h-24 content-center text-sm opacity-40">
          No results
        </span>
      )}
    </div>
  );
}
