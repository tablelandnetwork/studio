import { randomUUID } from "crypto";
import { Deployment } from "../schema";
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

export async function listDeployments() {
  return [];
}
