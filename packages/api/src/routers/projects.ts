import { Store } from "@tableland/studio-store";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { router, teamAdminProcedure, teamProcedure } from "../trpc";

export function projectsRouter(store: Store) {
  return router({
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
        const team = await store.teams.teamById(input.teamId);
        // TODO: See how revalidate works with tRPC actions tooling and maybe remove this and others.
        revalidatePath(`/${team.slug}`);
        return project;
      }),
    testAdmin: teamAdminProcedure(store)
      .input(z.object({}))
      .mutation(async ({ input, ctx }) => {
        return "ok";
      }),
  });
}
