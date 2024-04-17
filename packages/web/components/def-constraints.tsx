import { type Schema } from "@tableland/studio-store";
import { Table, TableBody, TableCell, TableRow } from "@/components/ui/table";

export default function DefConstraints({
  tableConstraints,
}: {
  tableConstraints: Schema["tableConstraints"];
}) {
  return (
    <Table>
      <TableBody>
        {tableConstraints?.map((constraint, index) => {
          return (
            <TableRow key={constraint}>
              <TableCell>{constraint}</TableCell>
            </TableRow>
          );
        })}
      </TableBody>
    </Table>
  );
}
