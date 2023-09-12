import { Store } from "@tableland/studio-store";
import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { router, teamProcedure } from "../trpc";

export function projectsRouter(store: Store) {
  return router({
    teamProjects: teamProcedure(store)
      .input(z.object({}))
      .query(async ({ input }) => {
        return await store.projects.projectsByTeamId(input.teamId);
      }),
    projectByTeamIdAndSlug: teamProcedure(store)
      .input(z.object({ slug: z.string() }))
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
    newProject: teamProcedure(store)
      .input(
        z.object({
          name: z.string(),
          description: z.string().optional(),
        }),
      )
      .mutation(async ({ input }) => {
        const project = await store.projects.createProject(
          input.teamId,
          input.name,
          input.description || null,
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
