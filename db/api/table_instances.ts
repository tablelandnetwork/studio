import { randomUUID } from "crypto";
import { eq } from "drizzle-orm";
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

export async function updateTableInstance({
  tableInstanceId,
  tableUuName,
}: {
  tableInstanceId: string;
  tableUuName?: string;
}) {
  const tableInstance = {
    tableUuName,
  };

  const { sql, params } = db
    .update(table_instances)
    .set(tableInstance)
    .where(eq(table_instances.id, tableInstanceId))
    .toSQL();

  const res = await tbl.prepare(sql).bind(params).run();
  if (res.error) {
    throw new Error(res.error);
  }

  return tableInstance;
}
