import { Store } from "@tableland/studio-store";
import { z } from "zod";
import { router, teamProcedure } from "../trpc";

export function projectsRouter(store: Store) {
  return router({
    teamProjects: teamProcedure(store)
      .input(z.object({}))
      .query(async ({ input }) => {
        return await store.projects.projectsByTeamId(input.teamId);
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
        return project;
      }),
  });
}
