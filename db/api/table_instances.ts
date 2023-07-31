import { randomUUID } from "crypto";
import { table_instances } from "../schema";
import { db, tbl } from "./db";

export async function createTableInstance({
  tableId,
  environmentId,
  chain,
  schema,
  tableUuName,
}: {
  tableId: string;
  environmentId: string;
  chain: number;
  schema: string;
  tableUuName?: string;
}) {
  const tableInstanceId = randomUUID();

  const tableInstance = {
    id: tableInstanceId,
    tableId,
    environmentId,
    chain,
    schema,
    tableUuName,
  };

  const { sql, params } = db
    .insert(table_instances)
    .values(tableInstance)
    .toSQL();

  const res = await tbl.prepare(sql).bind(params).run();
  if (res.error) {
    throw new Error(res.error);
  }

  return tableInstance;
}
