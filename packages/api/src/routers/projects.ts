import { slugify, type Store } from "@tableland/studio-store";
import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { publicProcedure, createTRPCRouter, teamProcedure } from "../trpc";
import { internalError } from "../utils/internalError";
import { restrictedProjectSlugs } from "../restricted-slugs";

export function projectsRouter(store: Store) {
  return createTRPCRouter({
    teamProjects: publicProcedure
      .input(z.object({ teamId: z.string().trim().nonempty() }).or(z.void()))
      .query(async ({ ctx, input }) => {
        // we want to check for null, undefined, and ""
        // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
        const teamId = input?.teamId || ctx.session.auth?.user.teamId;
        if (!teamId) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "Team ID must be provided as input or session context",
          });
        }
        return await store.projects.projectsByTeamId(teamId);
      }),
    projectBySlug: publicProcedure
      .input(
        z.object({
          teamId: z.string().trim().optional(),
          slug: z.string().trim(),
        }),
      )
      .query(async ({ input, ctx }) => {
        // we want to check for null, undefined, and ""
        // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
        const teamId = input?.teamId || ctx.session.auth?.user.teamId;
        if (!teamId) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "Team ID must be provided as input or session context",
          });
        }
        const project = await store.projects.projectByTeamIdAndSlug(
          teamId,
          input.slug,
        );
        if (!project) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Project not found",
          });
        }
        return project;
      }),
    nameAvailable: publicProcedure
      .input(
        z.object({
          teamId: z.string().trim().optional(),
          name: z
            .string()
            .trim()
            .min(3)
            .refine((name) => !restrictedProjectSlugs.includes(slugify(name)), {
              message: "You can't use a restricted word as a project name.",
            }),
        }),
      )
      .query(async ({ input, ctx }) => {
        // we want to check for null, undefined, and ""
        // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
        const teamId = input?.teamId || ctx.session.auth?.user.teamId;
        if (!teamId) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "Team ID must be provided as input or session context",
          });
        }
        return await store.projects.nameAvailable(teamId, input.name);
      }),
    newProject: teamProcedure(store)
      .input(
        z.object({
          name: z
            .string()
            .trim()
            .min(3)
            .refine((name) => !restrictedProjectSlugs.includes(slugify(name)), {
              message: "You can't use a restricted word as a project name.",
            }),
          description: z.string().trim().nonempty(),
        }),
      )
      .mutation(async ({ input, ctx }) => {
        try {
          const project = await store.projects.createProject(
            ctx.teamId,
            input.name,
            input.description,
          );
          // TODO: This is temporary to make sure all projects have a default environment.
          await store.environments.createEnvironment({
            projectId: project.id,
            name: "default",
          });
          return project;
        } catch (err) {
          throw internalError("Error creating project", err);
        }
      }),
  });
}
