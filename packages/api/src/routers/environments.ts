import { type Store } from "@tableland/studio-store";
import { z } from "zod";
import { TRPCError } from "@trpc/server";
import {
  publicProcedure,
  createTRPCRouter,
  projectAdminProcedure,
  environmentAdminProcedure,
} from "../trpc";

export function environmentsRouter(store: Store) {
  return createTRPCRouter({
    nameAvailable: publicProcedure
      .input(
        z.object({
          projectId: z.string().trim().min(1),
          name: z.string().trim().min(1),
          envId: z.string().optional(),
        }),
      )
      .query(async ({ input }) => {
        return await store.environments.nameAvailable(
          input.projectId,
          input.name,
          input.envId,
        );
      }),
    newEnvironment: projectAdminProcedure(store)
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
    updateEnvironment: environmentAdminProcedure(store)
      .input(
        z.object({
          name: z.string().trim(),
        }),
      )
      .mutation(async ({ input }) => {
        const environment = await store.environments.updateEnvironment({
          id: input.envId,
          name: input.name,
        });
        return environment;
      }),
    deleteEnvironment: environmentAdminProcedure(store).mutation(
      async ({ input }) => {
        await store.environments.deleteEnvironment(input.envId);
      },
    ),
    projectEnvironments: publicProcedure
      .input(z.object({ projectId: z.string().trim() }))
      .query(async ({ input }) => {
        return await store.environments.getEnvironmentsByProjectId(
          input.projectId,
        );
      }),
    userEnvironmentForProject: publicProcedure
      .input(
        z.object({
          projectId: z.string().uuid(),
        }),
      )
      .query(async ({ input, ctx }) => {
        // TODO: Check the user session for their last used env.
        const envs = await store.environments.getEnvironmentsByProjectId(
          input.projectId,
        );
        return envs[0];
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
