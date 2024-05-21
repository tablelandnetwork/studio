import { type Store } from "@tableland/studio-store";
import { z } from "zod";
import { publicProcedure, createTRPCRouter, defProcedure } from "../trpc";

export function deploymentsRouter(store: Store) {
  return createTRPCRouter({
    recordDeployment: defProcedure(store)
      .input(
        z.object({
          defId: z.string().trim().uuid(),
          environmentId: z.string().trim().uuid(),
          tableName: z.string().trim().min(1),
          chainId: z.number().int().nonnegative(),
          tableId: z.string().trim().min(1),
          blockNumber: z.number().int().nonnegative().optional(),
          txnHash: z.string().trim().min(1).optional(),
          createdAt: z.date(),
        }),
      )
      .mutation(async ({ input }) => {
        const res = await store.deployments.recordDeployment({
          defId: input.defId,
          environmentId: input.environmentId,
          tableName: input.tableName,
          chainId: input.chainId,
          tableId: input.tableId,
          blockNumber: input.blockNumber,
          txnHash: input.txnHash,
          createdAt: input.createdAt,
        });
        return res;
      }),
    deploymentsByDefId: publicProcedure
      .input(
        z.object({
          defId: z.string().trim().uuid(),
        }),
      )
      .query(async ({ input }) => {
        return await store.deployments.deploymentsByDefId(input.defId);
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
    deploymentReferences: publicProcedure
      .input(
        z.object({
          chainId: z.number().int().gt(0),
          tableId: z.string().trim().min(1),
        }),
      )
      .query(async ({ input }) => {
        return await store.deployments.deploymentReferences(
          input.chainId,
          input.tableId,
        );
      }),
  });
}
