import { eq } from "drizzle-orm";
import { DrizzleD1Database } from "drizzle-orm/d1";
import * as schema from "../schema/index.js";
import { deployments, environments, projectTables, tables } from "../schema/index.js";

export function initDeployments(db: DrizzleD1Database<typeof schema>) {
  return {
    recordDeployment: async function ({
      tableId,
      environmentId,
      chainId,
      tableName,
      tokenId,
      blockNumber,
      txnHash,
      createdAt,
    }: Omit<schema.NewDeployment, "createdAt"> & { createdAt: Date }) {
      const deployment: schema.Deployment = {
        tableId,
        environmentId,
        chainId,
        tableName,
        tokenId,
        blockNumber: blockNumber || null,
        txnHash: txnHash || null,
        createdAt: createdAt.toISOString(),
      };
      await db.insert(deployments).values(deployment).run();
      return deployment;
    },

    deploymentsByTableId: async function (tableId: string) {
      const res = await db
        .select()
        .from(deployments)
        .innerJoin(environments, eq(deployments.environmentId, environments.id))
        .where(eq(deployments.tableId, tableId))
        .orderBy(environments.name)
        .all();
      const mapped = res.map((r) => ({
        deployment: r.deployments,
        environment: r.environments,
      }));
      return mapped;
    },

    deploymentsByProjectId: async function (
      projectId: string,
    ): Promise<schema.Deployment[]> {
      const res = await db
        .select({ deployments })
        .from(deployments)
        .leftJoin(projectTables, eq(deployments.tableId, projectTables.tableId))
        .where(eq(projectTables.projectId, projectId))
        .all();

      const mapped = res.map((r) => r.deployments);
      return mapped;
    },

    deploymentsByEnvironmentId: async function (environmentId: string) {
      const res = await db
        .select()
        .from(deployments)
        .innerJoin(tables, eq(deployments.tableId, tables.id))
        .where(eq(deployments.environmentId, environmentId))
        .all();
      const mapped = res.map((r) => ({
        deployment: r.deployments,
        table: r.tables,
      }));
      return mapped;
    },
  };
}
