import { CreateTable, createTableAtom } from "@/store/createTable";
import { useAtom } from "jotai";

function createTableStatementFromObject(tableObj: CreateTable) {
  let statement = "CREATE TABLE " + tableObj.name + " (";

  let columns = tableObj.columns.map((column) => {
    let columnStatement = column.name + " " + column.type;

    if (column.notNull) {
      columnStatement += " NOT NULL";
    }
    if (column.unique) {
      columnStatement += " UNIQUE";
    }
    if (column.primaryKey) {
      columnStatement += " PRIMARY KEY";
    }
    if (column.default !== undefined) {
      let defaultValue = column.default;
      if (!column.type.toUpperCase().startsWith("INTEGER")) {
        defaultValue = "'" + defaultValue + "'";
      }
      columnStatement += " DEFAULT " + defaultValue;
    }

    return columnStatement;
  });

  statement += columns.join(", ");
  statement += ");";

  return statement;
}

export default function SchemaBuilder() {
  const [tbl, setAtom] = useAtom(createTableAtom);
  return (
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
      <button
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
        New column
      </button>
      <button
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
      </button>
      <p>{createTableStatementFromObject(tbl)}</p>
    </table>
  );
}

function CreateColumn(props: any) {
  const [tbl, setAtom] = useAtom(createTableAtom);
  const column = tbl && tbl.columns[props.columnIndex];

  return (
    <tr>
      <td key={"name"}>
        <input
          placeholder="Column Name"
          pattern="[a-zA-Z0-9_]*"
          className="form-input"
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
        <select
          name="type"
          defaultValue={column.type}
          onChange={(e) => {
            setAtom((prev) => {
              prev.columns[props.columnIndex].type = e.target.value;
              return {
                ...prev,
              };
            });
          }}
        >
          <option value="text">Text</option>
          <option value="integer">Integer</option>
        </select>
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
        <input
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
