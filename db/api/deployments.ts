import { randomUUID } from "crypto";
import { eq } from "drizzle-orm";
import { Deployment, deployments, projectTables } from "../schema";
import { db, tbl } from "./db";

export async function createDeployment({
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

export async function updateDeployment({
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

export async function deploymentsByProjectId(id: string) {
  const { sql, params } = db
    .select()
    .from(deployments)
    .leftJoin(projectTables, eq(deployments.tableId, projectTables.tableId))
    .where(eq(projectTables.projectId, id))
    .toSQL();

  const res = await tbl.prepare(sql).bind(params).all();
  return res.results as Deployment[];
}
