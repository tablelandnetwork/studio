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

export function createTableStatementFromObject(tableObj: CreateTable) {
  let statement = "CREATE TABLE " + tableObj.name + " (";

  let columns = tableObj.columns.map((column) => {
    if (isValidColumnName(column.name)) {
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

  return statement;
}

export default function SchemaBuilder() {
  const [tbl, setAtom] = useAtom(createTableAtom);
  return (
    <div className="schema-builder">
      <table>
        <thead>
          <tr>
            <th>Name</th>
            <th>Type</th>
            <th>Not null</th>
            <th>Primary Key</th>
            <th>Unique</th>
            <th>Default value</th>
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
    <div className="button-group">
      <Button
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
  const [tbl, setAtom] = useAtom(createTableAtom);
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
            setAtom((prev) => {
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
            setAtom((prev) => {
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
      <td>
        <input
          name="notNull"
          type="checkbox"
          checked={column.notNull}
          onChange={(e) => {
            setAtom((prev) => {
              prev.columns[props.columnIndex].notNull = e.target.checked;
              return {
                ...prev,
              };
            });
          }}
        />
      </td>
      <td>
        <input
          name="primaryKey"
          type="checkbox"
          checked={column.primaryKey}
          onChange={(e) => {
            setAtom((prev) => {
              prev.columns[props.columnIndex].primaryKey = e.target.checked;
              return {
                ...prev,
              };
            });
          }}
        />
      </td>
      <td>
        <input
          name="unique"
          type="checkbox"
          checked={column.unique}
          onChange={(e) => {
            setAtom((prev) => {
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
            setAtom((prev) => {
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
