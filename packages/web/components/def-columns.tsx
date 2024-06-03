import { type Schema, hasConstraint } from "@tableland/studio-store";
import { ArrowUp01, Check } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "./ui/tooltip";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export default function DefColumns({
  columns,
}: {
  columns: Schema["columns"];
}) {
  return (
    <Table>
      {columns.length > 0 && (
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Type</TableHead>
            <TableHead className="text-center">Not Null</TableHead>
            <TableHead className="text-center">Primary Key</TableHead>
            <TableHead className="text-center">Unique</TableHead>
          </TableRow>
        </TableHeader>
      )}
      <TableBody>
        {columns.map((column, index) => {
          const isPkAuto = hasConstraint(column, "primary key autoincrement");
          return (
            <TableRow key={column.name}>
              <TableCell>
                <p>{column.name}</p>
              </TableCell>
              <TableCell>
                <p>{column.type}</p>
              </TableCell>
              <TableCell align="center">
                {hasConstraint(column, "not null") && <Check />}
              </TableCell>
              <TableCell align="center">
                {(hasConstraint(column, "primary key") || isPkAuto) && (
                  <div className="flex items-center justify-center gap-2">
                    <Check />
                    {isPkAuto && (
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger>
                            <ArrowUp01 className="opacity-30 hover:opacity-100" />
                          </TooltipTrigger>
                          <TooltipContent>
                            Primary key is auto-incrementing
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    )}
                  </div>
                )}
              </TableCell>
              <TableCell align="center">
                {hasConstraint(column, "unique") && <Check />}
              </TableCell>
            </TableRow>
          );
        })}
      </TableBody>
    </Table>
  );
}
