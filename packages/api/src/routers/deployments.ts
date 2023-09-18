import { Store } from "@tableland/studio-store";
import { z } from "zod";
import { publicProcedure, router, tableProcedure } from "../trpc";

export function deploymentsRouter(store: Store) {
  return router({
    recordDeployment: tableProcedure(store)
      .input(
        z.object({
          tableId: z.string().uuid(),
          environmentId: z.string().uuid(),
          tableName: z.string().nonempty(),
          chainId: z.number().int().nonnegative(),
          tokenId: z.string().nonempty(),
          blockNumber: z.number().int().nonnegative().optional(),
          txnHash: z.string().nonempty().optional(),
          createdAt: z.date(),
        }),
      )
      .mutation(async ({ input }) => {
        const res = await store.deployments.recordDeployment({
          tableId: input.tableId,
          environmentId: input.environmentId,
          tableName: input.tableName,
          chainId: input.chainId,
          tokenId: input.tokenId,
          blockNumber: input.blockNumber,
          txnHash: input.txnHash,
          createdAt: input.createdAt,
        });
        return res;
      }),
    projectDeployments: publicProcedure
      .input(
        z.object({
          projectId: z.string().uuid(),
        }),
      )
      .query(async ({ input }) => {
        return await store.deployments.deploymentsByProjectId(input.projectId);
      }),
  });
}
