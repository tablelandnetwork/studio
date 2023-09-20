import { Store } from "@tableland/studio-store";
import { z } from "zod";
import { projectProcedure, publicProcedure, router } from "../trpc";

export function environmentsRouter(store: Store) {
  return router({
    projectEnvironments: publicProcedure
      .input(z.object({ projectId: z.string() }))
      .query(async ({ input }) => {
        return await store.environments.getEnvironmentsByProjectId(
          input.projectId,
        );
      }),
    newEnvironment: projectProcedure(store)
      .input(
        z.object({
          name: z.string(),
        }),
      )
      .mutation(async ({ input }) => {
        const environment = await store.environments.createEnvironment({
          projectId: input.projectId,
          name: input.name,
        });
        return environment;
      }),
  });
}
