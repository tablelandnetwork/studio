import { revalidatePath } from "next/cache";
import { z } from "zod";
import db from "../../db/api";
import { router, teamAdminProcedure, teamProcedure } from "../trpc";

export const projectsRouter = router({
  newProject: teamProcedure
    .input(
      z.object({
        name: z.string(),
        description: z.string().optional(),
      }),
    )
    .mutation(async ({ input }) => {
      const project = await db.projects.createProject(
        input.teamId,
        input.name,
        input.description || null,
      );
      const team = await db.teams.teamById(input.teamId);
      // TODO: See how revalidate works with tRPC actions tooling and maybe remove this and others.
      revalidatePath(`/${team.slug}`);
      return project;
    }),
  testAdmin: teamAdminProcedure
    .input(z.object({}))
    .mutation(async ({ input, ctx }) => {
      return "ok";
    }),
});
