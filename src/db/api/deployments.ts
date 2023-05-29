import { randomUUID } from "crypto";
import { eq } from "drizzle-orm";
import { Deployment, DeploymentTables } from "../schema";
import { db, deploymentTables, deployments, tbl } from "./db";

// Feels like this should exist elsewhere
interface TableData {
  tableId: string;
  name: string;
  schema: string;
}

// Feels like this should exist elsewhere
interface CreateDeployment {
  projectId: string;
  chain: string;
  transactionHash: string;
  deployedBy: string;
  block: string;
  tables: TableData[];
}

export async function createDeployment({
  projectId,
  chain,
  tables,
  block,
  deployedBy,
  transactionHash,
}: CreateDeployment) {
  const deploymentId = randomUUID();
  const { sql: deploymentSql, params: deploymentParams } = db
    .insert(deployments)
    .values({
      id: deploymentId,
      chain,
      block,
      projectId,
      deployedBy,
      transactionHash,
    })
    .toSQL();

  const deploymentPrepped = tbl.prepare(deploymentSql).bind(deploymentParams);

  const tablesPrepped = tables.map((table) => {
    const { tableId, schema, name: tableName } = table;
    const { sql: tableSql, params: tableParams } = db
      .insert(deploymentTables)
      .values({ deploymentId, tableId, schema, tableName })
      .toSQL();
    return tbl.prepare(tableSql).bind(tableParams);
  });

  await tbl.batch([deploymentPrepped, ...tablesPrepped]);

  const deployment: Deployment = {
    projectId,
    chain,
    block,
    deployedBy,
    transactionHash,
    id: deploymentId,
  };
  return deployment;
}

export interface DeploymentsWithTables extends Deployment {
  tables: DeploymentTables[];
}

export async function deploymentsByProjectId(projectId: string) {
  const res = await db
    .select({ deployments, deploymentTables })
    .from(deployments)
    .where(eq(deployments.projectId, projectId))
    .fullJoin(
      deploymentTables,
      eq(deployments.id, deploymentTables.deploymentId)
    )
    .orderBy(deployments.block)
    .all();

  function formatDeployments(data: any): DeploymentsWithTables[] {
    const result: any = {};

    data.forEach((item: any) => {
      const deploymentId = item.deployments.id;

      // If this deployment hasn't been seen before, add it to the result
      if (!result[deploymentId]) {
        result[deploymentId] = { ...item.deployments, tables: [] };
      }

      // Add this table to the deployment
      result[deploymentId].tables.push(item.deploymentTables);
    });

    // Convert the result object back into an array
    return Object.values(result);
  }

  return formatDeployments(res);
}

export async function deploymentTablesByDeploymentId(deploymentId: string) {
  const res = await db
    .select({ deployments, deploymentTables })
    .from(deploymentTables)
    .where(eq(deploymentTables.deploymentId, deploymentId))
    .all();

  return res.map((deploymentTable) => deploymentTable.deploymentTables);
}
