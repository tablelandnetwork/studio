import { type Schema, hasConstraint } from "@tableland/studio-store";
import { Check } from "lucide-react";
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
                {hasConstraint(column, "primary key") && <Check />}
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
