import { type schema, type Store } from "@tableland/studio-store";
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
      async ({ input, ctx }) => {
        const envs = await store.environments.getEnvironmentsByProjectId(
          ctx.project.id,
        );
        if (envs.length === 1) {
          throw new TRPCError({
            code: "PRECONDITION_FAILED",
            message: "Cannot delete the last environment in a project",
          });
        }
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
    environmentPreferenceForProject: publicProcedure
      .input(
        z.object({
          projectId: z.string().uuid(),
        }),
      )
      .query(async ({ input, ctx }) => {
        let env: schema.Environment | undefined;
        const envId = ctx.session.projectEnvs?.[input.projectId];
        if (envId) {
          env = await store.environments.environmentById(envId);
        } else {
          const envs = await store.environments.getEnvironmentsByProjectId(
            input.projectId,
          );
          env = envs.length ? envs[0] : undefined;
        }
        if (!env) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "No environment preference found for this project",
          });
        }
        return env;
      }),
    setEnvironmentPreferenceForProject: publicProcedure
      .input(
        z.object({
          projectId: z.string().uuid(),
          envId: z.string().uuid(),
        }),
      )
      .mutation(async ({ input, ctx }) => {
        ctx.session.projectEnvs = {
          ...ctx.session.projectEnvs,
          [input.projectId]: input.envId,
        };
        await ctx.session.save();
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
