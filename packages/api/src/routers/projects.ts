import { Store } from "@tableland/studio-store";
import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { publicProcedure, router, teamProcedure } from "../trpc";

export function projectsRouter(store: Store) {
  return router({
    teamProjects: publicProcedure
      .input(z.object({ teamId: z.string().trim().nonempty() }).or(z.void()))
      .query(async ({ ctx, input }) => {
        const teamId = input?.teamId || ctx.session.auth?.user.teamId;
        if (!teamId) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "Team ID must be provided as input or session context",
          });
        }
        return await store.projects.projectsByTeamId(teamId);
      }),
    projectByTeamIdAndSlug: publicProcedure
      .input(z.object({ teamId: z.string().trim(), slug: z.string().trim() }))
      .query(async ({ input }) => {
        const project = await store.projects.projectByTeamIdAndSlug(
          input.teamId,
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
      .input(z.object({ teamId: z.string().trim(), name: z.string().trim() }))
      .query(async ({ input }) => {
        return await store.projects.nameAvailable(input.teamId, input.name);
      }),
    newProject: teamProcedure(store)
      .input(
        z.object({
          name: z.string().trim(),
          description: z.string().trim().nonempty(),
        }),
      )
      .mutation(async ({ input }) => {
        const project = await store.projects.createProject(
          input.teamId,
          input.name,
          input.description,
        );
        // TODO: This is temporary to make sure all projects have a default environment.
        await store.environments.createEnvironment({
          projectId: project.id,
          name: "default",
        });
        return project;
      }),
  });
}
