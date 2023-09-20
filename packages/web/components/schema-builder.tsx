import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { CreateTable, createTableAtom } from "@/store/create-table";
import { useAtom } from "jotai";
import { Plus, X } from "lucide-react";
import { Button } from "./ui/button";
import { Checkbox } from "./ui/checkbox";
import { Input } from "./ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";

function isValidColumnName(variable: string) {
  var columnNameRegex = /^[a-zA-Z_][a-zA-Z0-9_]*$/;
  return columnNameRegex.test(variable);
}

export function createTableStatementFromObject(
  tableObj: CreateTable,
  name: string,
) {
  if (!name) return false;
  let statement = "CREATE TABLE " + name + " (";
  let invalid = false;

  let columns = tableObj.columns
    .filter((column) => column.name !== "")
    .map((column) => {
      if (!isValidColumnName(column.name)) {
        invalid = true;
        return false;
      }
      let columnStatement = "\n     " + column.name + " " + column.type;

      if (column.notNull) {
        columnStatement += " NOT NULL";
      }
      if (column.unique) {
        columnStatement += " UNIQUE";
      }
      if (column.primaryKey) {
        columnStatement += " PRIMARY KEY";
      }
      if (column.default) {
        let defaultValue = column.default;
        if (!column.type.toUpperCase().startsWith("INTEGER")) {
          defaultValue = "'" + defaultValue + "'";
        }
        columnStatement += " DEFAULT " + defaultValue;
      }

      return columnStatement;
    });

  statement += columns.join(", ");
  statement += "\n);";

  if (invalid) {
    return false;
  }

  return statement;
}

export default function SchemaBuilder() {
  const [tbl, setCreateTable] = useAtom(createTableAtom);
  return (
    <div className="flex flex-col items-start">
      <Table>
        {tbl.columns.length > 0 && (
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Not Null</TableHead>
              <TableHead>Primary Key</TableHead>
              <TableHead>Unique</TableHead>
              <TableHead>Default Value</TableHead>
              <TableHead></TableHead>
            </TableRow>
          </TableHeader>
        )}
        <TableBody>
          {tbl.columns.map((column, index) => {
            return <CreateColumn key={index} columnIndex={index} />;
          })}
        </TableBody>
      </Table>
      <Button
        className="my-4"
        type="button"
        variant="outline"
        size="sm"
        onClick={() => {
          setCreateTable((prev) => {
            const newColumn = {
              name: "",
              type: "text",
              notNull: false,
              primaryKey: false,
              unique: false,
              default: null,
            };
            return {
              ...prev,
              columns: [...prev.columns, newColumn],
            };
          });
        }}
      >
        <Plus className="mr-2" />
        Add Column
      </Button>
    </div>
  );
}

function RemoveColumn({ columnIndex }: { columnIndex: number }) {
  const [tbl, setAtom] = useAtom(createTableAtom);
  return (
    <Button
      type="button"
      variant="ghost"
      size="sm"
      onClick={() => {
        setAtom((prev) => {
          prev.columns.splice(columnIndex, 1);
          return {
            ...prev,
          };
        });
      }}
    >
      <X />
    </Button>
  );
}

function CreateColumn({ columnIndex }: { columnIndex: number }) {
  const [tbl, setCreateTable] = useAtom(createTableAtom);
  const column = tbl && tbl.columns[columnIndex];

  return (
    <TableRow>
      <TableCell>
        <Input
          className="w-28"
          placeholder="column_name"
          pattern="[a-zA-Z0-9_]*"
          name="name"
          title={
            "Letter, numbers, and underscores only. First character cannot be a number"
          }
          value={column.name}
          onChange={(e) => {
            setCreateTable((prev) => {
              prev.columns[columnIndex].name = e.target.value;
              return {
                ...prev,
              };
            });
          }}
        />
      </TableCell>
      <TableCell>
        <Select
          defaultValue={column.type}
          onValueChange={(e) => {
            setCreateTable((prev) => {
              prev.columns[columnIndex].type = e;
              return {
                ...prev,
              };
            });
          }}
        >
          <SelectTrigger className="gap-x-2">
            <SelectValue placeholder="Select a type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="text">Text</SelectItem>
            <SelectItem value="integer">Integer</SelectItem>
            <SelectItem value="int">Int</SelectItem>
            <SelectItem value="blob">Blob</SelectItem>
          </SelectContent>
        </Select>
      </TableCell>
      <TableCell>
        <Checkbox
          name="notNull"
          checked={column.notNull}
          onCheckedChange={(state) => {
            setCreateTable((prev) => {
              prev.columns[columnIndex].notNull = !!state;
              return {
                ...prev,
              };
            });
          }}
        />
      </TableCell>
      <TableCell>
        <Checkbox
          name="primaryKey"
          checked={column.primaryKey}
          onCheckedChange={(state) => {
            setCreateTable((prev) => {
              prev.columns[columnIndex].primaryKey = !!state;
              return {
                ...prev,
              };
            });
          }}
        />
      </TableCell>
      <TableCell>
        <Checkbox
          name="unique"
          checked={column.unique}
          onCheckedChange={(state) => {
            setCreateTable((prev) => {
              prev.columns[columnIndex].unique = !!state;
              return {
                ...prev,
              };
            });
          }}
        />
      </TableCell>
      <TableCell>
        <Input
          className="w-20"
          type="text"
          name="default"
          placeholder="null"
          defaultValue={column.default}
          onChange={(e) => {
            setCreateTable((prev) => {
              prev.columns[columnIndex].default = e.target.value;
              return {
                ...prev,
              };
            });
          }}
        />
      </TableCell>
      <TableCell>
        <RemoveColumn columnIndex={columnIndex} />
      </TableCell>
    </TableRow>
  );
}
