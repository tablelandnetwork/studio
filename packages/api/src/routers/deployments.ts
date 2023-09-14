import { Store } from "@tableland/studio-store";
import { z } from "zod";
import { publicProcedure, router, tableProcedure } from "../trpc";

export function deploymentsRouter(store: Store) {
  return router({
    recordDeployment: tableProcedure(store)
      .input(
        z.object({
          schema: z.string().nonempty(),
          tableUuName: z.string().nonempty(),
          environmentId: z.string().uuid(),
          chain: z.number().int(),
          createdAt: z.date(),
        }),
      )
      .mutation(async ({ input }) => {
        const res = await store.deployments.recordDeployment({
          tableId: input.tableId,
          schema: input.schema,
          tableUuName: input.tableUuName,
          environmentId: input.environmentId,
          chain: input.chain,
          createdAt: input.createdAt.toISOString(),
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
