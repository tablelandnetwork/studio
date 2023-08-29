import { Store } from "@tableland/studio-store";
import { TRPCError } from "@trpc/server";
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
        const team = await store.teams.teamById(input.teamId);
        if (!team) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Team not found",
          });
        }
        const project = await store.projects.createProject(
          team.id,
          input.name,
          input.description || null,
        );

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
