import { type Schema } from "./index.js";

export type Constraint =
  | "not null"
  | "primary key"
  | "primary key autoincrement"
  | "unique";

export function hasConstraint(
  column: Schema["columns"][number],
  constraint: Constraint,
) {
  return column.constraints ? column.constraints.includes(constraint) : false;
}

export function setConstraint(
  column: Schema["columns"][number],
  constraint: Constraint,
  value: boolean,
) {
  const { constraints, ...rest } = column;
  if (value) {
    return { ...rest, constraints: [...(constraints ?? []), constraint] };
  } else {
    const res = [...(constraints ?? [])].filter((c) => c !== constraint);
    return { ...rest, constraints: res.length ? res : undefined };
  }
}

export function isPrimaryKeyAutoIncrement(column: Schema["columns"][number]) {
  return (
    hasConstraint(column, "primary key autoincrement") ||
    (hasConstraint(column, "primary key") && column.type === "integer")
  );
}

export function generateCreateTableStatement(
  tableName: string,
  schema: Schema,
) {
  if (!tableName.length) {
    return "";
  }
  const cleaned = cleanSchema(schema);
  const columnDefinitions = cleaned.columns
    .map((column) => {
      const definition = `\`${column.name}\` ${column.type}`;
      const columnConstraints = column.constraints?.length
        ? " " + column.constraints.join(" ")
        : "";
      return `${definition}${columnConstraints.toLowerCase()}`;
    })
    .join(", ");

  // TODO: When we support creating table constraints in studio,
  // be sure column names are properly escaped.
  const tableConstraints = cleaned.tableConstraints
    ? cleaned.tableConstraints.join(",")
    : "";

  return `create table [${tableName}](${columnDefinitions}${
    tableConstraints ? `, ${tableConstraints}` : ""
  });`;
}

export function cleanSchema(schema: Schema) {
  return {
    ...schema,
    columns: schema.columns.filter(
      (column) => column.name.length && column.type.length,
    ),
  };
}

// Given a SQL identifier with escape characters, return the unescaped version.
export function unescapeIdentifier(name: string) {
  return name.replace(/^[`"[]/, "").replace(/[`"\]]$/, "");
}

// TODO: Needs to deal with table constraints. They should
// be modeled in a more structured way.
export function unescapeSchema(schema: Schema): Schema {
  return {
    ...schema,
    columns: schema.columns.map((col) => ({
      ...col,
      name: unescapeIdentifier(col.name),
    })),
  };
}

export function slugify(input: string) {
  return input
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s-]+/g, "-");
  // .replace(/^-+|-+$/g, "");
}
