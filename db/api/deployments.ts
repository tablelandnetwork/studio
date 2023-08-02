import { randomUUID } from "crypto";
import { eq } from "drizzle-orm";
import { deployments } from "../schema";
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

  const { sql, params } = db.insert(deployments).values(tableInstance).toSQL();

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
    .update(deployments)
    .set(tableInstance)
    .where(eq(deployments.id, tableInstanceId))
    .toSQL();

  const res = await tbl.prepare(sql).bind(params).run();
  if (res.error) {
    throw new Error(res.error);
  }

  return tableInstance;
}
