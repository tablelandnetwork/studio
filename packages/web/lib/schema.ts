import { schema } from "@tableland/studio-store";

export type Constraint = "not null" | "primary key" | "unique";

export function hasConstraint(
  column: schema.Schema["columns"][number],
  constraint: Constraint,
) {
  return column.constraints ? column.constraints.includes(constraint) : false;
}

export function setConstraint(
  column: schema.Schema["columns"][number],
  constraint: Constraint,
  value: boolean,
) {
  const { constraints, ...rest } = column;
  if (value) {
    return { ...rest, constraints: [...(constraints || []), constraint] };
  } else {
    const res = [...(constraints || [])].filter((c) => c !== constraint);
    return { ...rest, constraints: res.length ? res : undefined };
  }
}

export function generateCreateTableStatement(
  tableName: string,
  schema: schema.Schema,
) {
  if (!tableName.length) {
    return "";
  }
  const cleaned = cleanSchema(schema);
  const columnDefinitions = cleaned.columns
    .map((column) => {
      const definition = `${column.name} ${column.type}`;
      const columnConstraints = !!column.constraints?.length
        ? " " + column.constraints.join(" ")
        : "";
      return `${definition}${columnConstraints.toLowerCase()}`;
    })
    .join(", ");

  const tableConstraints = cleaned.table_constraints
    ? cleaned.table_constraints.join(",")
    : "";

  return `create table ${tableName}(${columnDefinitions}${
    tableConstraints ? `, ${tableConstraints}` : ""
  });`;
}

export function cleanSchema(schema: schema.Schema) {
  return {
    ...schema,
    columns: schema.columns.filter(
      (column) => column.name.length && column.type.length,
    ),
  };
}
