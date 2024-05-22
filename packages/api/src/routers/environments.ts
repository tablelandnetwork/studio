import { type Store } from "@tableland/studio-store";
import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { projectProcedure, publicProcedure, createTRPCRouter } from "../trpc";

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
          projectId: z.string().trim().min(1),
          slug: z.string().trim().min(1),
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
