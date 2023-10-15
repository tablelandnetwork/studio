import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { CheckedState } from "@radix-ui/react-checkbox";
import {
  Constraint,
  Schema,
  hasConstraint,
  setConstraint,
} from "@tableland/studio-store";
import { HelpCircle, Plus, X } from "lucide-react";
import { Dispatch, SetStateAction } from "react";
import { Button } from "./ui/button";
import { Checkbox } from "./ui/checkbox";
import { HoverCard, HoverCardContent, HoverCardTrigger } from "./ui/hover-card";
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

export default function SchemaBuilder({
  schema,
  setSchema,
}: {
  schema: Schema;
  setSchema: Dispatch<SetStateAction<Schema>>;
}) {
  return (
    <div className="flex flex-col items-start">
      <Table>
        {schema.columns.length > 0 && (
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead className="flex items-center gap-2">
                Type
                <HoverCard>
                  <HoverCardTrigger>
                    <HelpCircle className="h-5 w-5 text-gray-200 hover:text-gray-400" />
                  </HoverCardTrigger>
                  <HoverCardContent className="w-80">
                    <Table>
                      <TableCaption className="text-xs font-normal text-muted-foreground">
                        Explanation of supported column types.
                      </TableCaption>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Type</TableHead>
                          <TableHead>Description</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        <TableRow>
                          <TableCell className="font-medium">Int</TableCell>
                          <TableCell className="font-normal">
                            Signed integer values, stored in 0, 1, 2, 3, 4, 6,
                            or 8 bytes depending on the magnitude of the value.
                          </TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell className="font-medium">Integer</TableCell>
                          <TableCell className="font-normal">
                            Same as Int, except it may also be used to represent
                            an auto-incrementing primary key field.
                          </TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell className="font-medium">Text</TableCell>
                          <TableCell className="font-normal">
                            Text string, stored using the database encoding
                            (UTF-8).
                          </TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell className="font-medium">Blob</TableCell>
                          <TableCell className="font-normal">
                            A blob of data, stored exactly as it was input.
                            Useful for byte slices etc.
                          </TableCell>
                        </TableRow>
                      </TableBody>
                    </Table>
                  </HoverCardContent>
                </HoverCard>
              </TableHead>
              <TableHead>Not Null</TableHead>
              <TableHead>Primary Key</TableHead>
              <TableHead>Unique</TableHead>
              <TableHead></TableHead>
            </TableRow>
          </TableHeader>
        )}
        <TableBody>
          {schema.columns.map((column, index) => {
            return (
              <CreateColumn
                key={index}
                columnIndex={index}
                schema={schema}
                setSchema={setSchema}
              />
            );
          })}
        </TableBody>
      </Table>
      <Button
        className="my-4"
        type="button"
        variant="outline"
        size="sm"
        onClick={() => {
          setSchema((prev) => {
            return {
              ...prev,
              columns: [...prev.columns, { name: "", type: "integer" }],
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

function RemoveColumn({
  columnIndex,
  setSchema,
}: {
  columnIndex: number;
  setSchema: Dispatch<SetStateAction<Schema>>;
}) {
  return (
    <Button
      type="button"
      variant="ghost"
      size="sm"
      onClick={() => {
        setSchema((prev) => {
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

function CreateColumn({
  columnIndex,
  schema,
  setSchema,
}: {
  columnIndex: number;
  schema: Schema;
  setSchema: Dispatch<SetStateAction<Schema>>;
}) {
  const column = schema.columns[columnIndex];

  const handleConstraintChanged = (
    index: number,
    constraint: Constraint,
    state: CheckedState,
  ) => {
    if (state === "indeterminate") return;
    const newSchema = { ...schema };
    const { columns, ...rest } = newSchema;
    const col = { ...columns[index] };
    columns[index] = setConstraint(col, constraint, state);
    setSchema({ columns, ...rest });
  };

  const handleNameUpdated = (index: number, name: string) => {
    const newSchema = { ...schema };
    const { columns, ...rest } = newSchema;
    const col = { ...columns[index] };
    columns[index] = { ...col, name };
    setSchema({ columns, ...rest });
  };

  const handleTypeUpdated = (index: number, type: string) => {
    const newSchema = { ...schema };
    const { columns, ...rest } = newSchema;
    const col = { ...columns[index] };
    columns[index] = { ...col, type };
    setSchema({ columns, ...rest });
  };

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
            handleNameUpdated(columnIndex, e.target.value);
          }}
        />
      </TableCell>
      <TableCell>
        <Select
          defaultValue={column.type}
          onValueChange={(e) => {
            handleTypeUpdated(columnIndex, e);
          }}
        >
          <SelectTrigger className="gap-x-2">
            <SelectValue placeholder="Select a type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="int">Int</SelectItem>
            <SelectItem value="integer">Integer</SelectItem>
            <SelectItem value="text">Text</SelectItem>
            <SelectItem value="blob">Blob</SelectItem>
          </SelectContent>
        </Select>
      </TableCell>
      <TableCell>
        <Checkbox
          name="notNull"
          checked={hasConstraint(column, "not null")}
          onCheckedChange={(state) => {
            handleConstraintChanged(columnIndex, "not null", state);
          }}
        />
      </TableCell>
      <TableCell>
        <Checkbox
          name="primaryKey"
          checked={hasConstraint(column, "primary key")}
          onCheckedChange={(state) => {
            handleConstraintChanged(columnIndex, "primary key", state);
          }}
        />
      </TableCell>
      <TableCell>
        <Checkbox
          name="unique"
          checked={hasConstraint(column, "unique")}
          onCheckedChange={(state) => {
            handleConstraintChanged(columnIndex, "unique", state);
          }}
        />
      </TableCell>
      <TableCell>
        <RemoveColumn columnIndex={columnIndex} setSchema={setSchema} />
      </TableCell>
    </TableRow>
  );
}
