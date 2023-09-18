import { eq } from "drizzle-orm";
import { DrizzleD1Database } from "drizzle-orm/d1";
import * as schema from "../schema";
import { deployments, projectTables } from "../schema";

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
  };
}
