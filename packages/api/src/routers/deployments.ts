import { type Store } from "@tableland/studio-store";
import { z } from "zod";
import { publicProcedure, router, tableProcedure } from "../trpc";

export function deploymentsRouter(store: Store) {
  return router({
    recordDeployment: tableProcedure(store)
      .input(
        z.object({
          tableId: z.string().trim().uuid(),
          environmentId: z.string().trim().uuid(),
          tableName: z.string().trim().nonempty(),
          chainId: z.number().int().nonnegative(),
          tokenId: z.string().trim().nonempty(),
          blockNumber: z.number().int().nonnegative().optional(),
          txnHash: z.string().trim().nonempty().optional(),
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
    deploymentsByTableId: publicProcedure
      .input(
        z.object({
          tableId: z.string().trim().uuid(),
        }),
      )
      .query(async ({ input }) => {
        return await store.deployments.deploymentsByTableId(input.tableId);
      }),
    projectDeployments: publicProcedure
      .input(
        z.object({
          projectId: z.string().trim().uuid(),
        }),
      )
      .query(async ({ input }) => {
        return await store.deployments.deploymentsByProjectId(input.projectId);
      }),
    deploymentsByEnvironmentId: publicProcedure
      .input(z.object({ environmentId: z.string().trim().uuid() }))
      .query(async ({ input }) => {
        return await store.deployments.deploymentsByEnvironmentId(
          input.environmentId,
        );
      }),
  });
}
