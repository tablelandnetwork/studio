import { randomUUID } from "crypto";
import { eq } from "drizzle-orm";
import {
  Deployment,
  DeploymentTables,
  deploymentTables,
  deployments,
} from "../schema";
import { db, tbl } from "./db";

interface TableDeployment {
  id: string;
  tableId: string;
  chain: number;
  name: string;
}

// Feels like this should exist elsewhere
interface CreateDeployment {
  projectId: string;
  title: string;
  tables: TableDeployment[];
}

// export async function doDeploymentMigration({
//   deploymentId,
//   tables,
// }) {
//   const tablesPrepped = tables.map((table: TableData) => {
//     const { tableId, schema, name: tableName } = table;
//     const { sql: tableSql, params: tableParams } = db
//       .insert(deploymentTables)
//       .values({ deploymentId, tableId, schema, tableName })
//       .toSQL();
//     return tbl.prepare(tableSql).bind(tableParams);
//   });

//   await tbl.batch([...tablesPrepped]);

// };

export async function createDeployment({
  projectId,
  title,
  tables,
}: CreateDeployment) {
  const deploymentId = randomUUID();

  const deployment: Deployment = {
    projectId,
    title,
    id: deploymentId,
  };

  const { sql: deploymentSql, params: deploymentParams } = db
    .insert(deployments)
    .values(deployment)
    .toSQL();

  const tablesPrepped = tables.map((table: TableDeployment) => {
    const tableId = randomUUID();
    const { sql: tableSql, params: tableParams } = db
      .insert(deploymentTables)
      .values({
        id: tableId,
        tableId: table.id,
        tableName: "",
        tableUuName: null,
        chain: table.chain,
        deploymentId: deploymentId,
        executionId: null,
        schema: null,
      })
      .toSQL();

    return tbl.prepare(tableSql).bind(tableParams);
  });

  await tbl.batch([...tablesPrepped]);

  await tbl.prepare(deploymentSql).bind(deploymentParams).all();

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
    .orderBy(deployments.id)
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
