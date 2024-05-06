import { type Store } from "@tableland/studio-store";
import { z } from "zod";
import { projectProcedure, publicProcedure, createTRPCRouter } from "../trpc";
import { TRPCError } from "@trpc/server";

export function environmentsRouter(store: Store) {
  return createTRPCRouter({
    projectEnvironments: publicProcedure
      .input(z.object({ projectId: z.string().trim() }))
      .query(async ({ input }) => {
        return await store.environments.getEnvironmentsByProjectId(
          input.projectId,
        );
      }),
    newEnvironment: projectProcedure(store)
      .input(
        z.object({
          name: z.string().trim(),
        }),
      )
      .mutation(async ({ input }) => {
        const environment = await store.environments.createEnvironment({
          projectId: input.projectId,
          name: input.name,
        });
        return environment;
      }),
    environmentBySlug: publicProcedure
      .input(
        z.object({
          projectId: z.string().trim().nonempty(),
          slug: z.string().trim().nonempty(),
        }),
      )
      .query(async ({ input }) => {
        const env = await store.environments.environmentBySlug(
          input.projectId,
          input.slug,
        );
        if (!env) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Environment not found",
          });
        }
        return env;
      }),
  });
}
