import { CreateTable, createTableAtom } from "@/store/create-table";
import { useAtom } from "jotai";
import { Button } from "./ui/button";
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
  name: string
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
    <div className="schema-builder">
      <table>
        <thead>
          <tr className="text-center">
            <th className="p-2">Name</th>
            <th className="p-2">Type</th>
            <th className="p-2 leading-5">Not null</th>
            <th className="p-2 leading-5">Primary Key</th>
            <th className="p-2 leading-5">Unique</th>
            <th className="p-2 leading-5">Default value</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {tbl.columns.map((column, index) => {
            return <CreateColumn key={index} columnIndex={index} />;
          })}
        </tbody>
      </table>
      <AddRemoveColumns />
    </div>
  );
}

function AddRemoveColumns() {
  const [tbl, setAtom] = useAtom(createTableAtom);
  return (
    <div className="button-group me-0 mt-10">
      <Button
        type="button"
        onClick={() => {
          setAtom((prev) => {
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
        Add column
      </Button>
      <Button
        type="button"
        variant="outline"
        onClick={() => {
          setAtom((prev) => {
            prev.columns.pop();
            return {
              ...prev,
            };
          });
        }}
      >
        Remove column
      </Button>
    </div>
  );
}

function CreateColumn(props: any) {
  const [tbl, setCreateTable] = useAtom(createTableAtom);
  const column = tbl && tbl.columns[props.columnIndex];

  return (
    <tr>
      <td key={"name"}>
        <Input
          placeholder="Column Name"
          pattern="[a-zA-Z0-9_]*"
          className="form-input w-[200px]"
          name="name"
          title={
            "Letter, numbers, and underscores only. First character cannot be a number"
          }
          defaultValue={column.name}
          onChange={(e) => {
            setCreateTable((prev) => {
              prev.columns[props.columnIndex].name = e.target.value;
              return {
                ...prev,
              };
            });
          }}
        />
      </td>
      <td>
        <Select
          defaultValue={column.type}
          onValueChange={(e) => {
            setCreateTable((prev) => {
              prev.columns[props.columnIndex].type = e;
              return {
                ...prev,
              };
            });
          }}
        >
          <SelectTrigger className="w-[100px]">
            <SelectValue placeholder="Select a type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="text">Text</SelectItem>
            <SelectItem value="integer">Integer</SelectItem>
          </SelectContent>
        </Select>
      </td>
      <td className="text-center">
        <input
          name="notNull"
          type="checkbox"
          checked={column.notNull}
          onChange={(e) => {
            setCreateTable((prev) => {
              prev.columns[props.columnIndex].notNull = e.target.checked;
              return {
                ...prev,
              };
            });
          }}
        />
      </td>
      <td className="text-center">
        <input
          name="primaryKey"
          type="checkbox"
          checked={column.primaryKey}
          onChange={(e) => {
            setCreateTable((prev) => {
              prev.columns[props.columnIndex].primaryKey = e.target.checked;
              return {
                ...prev,
              };
            });
          }}
        />
      </td>
      <td className="text-center">
        <input
          name="unique"
          type="checkbox"
          checked={column.unique}
          onChange={(e) => {
            setCreateTable((prev) => {
              prev.columns[props.columnIndex].unique = e.target.checked;
              return {
                ...prev,
              };
            });
          }}
        />
      </td>
      <td>
        <Input
          type="text"
          className="form-input"
          name="default"
          placeholder="null"
          defaultValue={column.default}
          onChange={(e) => {
            setCreateTable((prev) => {
              prev.columns[props.columnIndex].default = e.target.value;
              return {
                ...prev,
              };
            });
          }}
        />
      </td>
      <td>
        <i
          onClick={(e) => {
            e.preventDefault();
          }}
          className="fa-solid fa-x remove-column-x"
        ></i>
      </td>
    </tr>
  );
}
