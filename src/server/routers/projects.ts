import { TRPCError } from "@trpc/server";
import { z } from "zod";

import db from "@/db/api";
import { protectedProcedure, router } from "@/server/trpc";

export const projectsRouter = router({
  projectsForTeam: protectedProcedure
    .input(z.object({ teamId: z.string() }))
    .query(async ({ ctx, input: { teamId } }) => {
      // Is this personal team a member of the requested team?
      if (
        !(await db.teams.isAuthorizedForTeam(
          ctx.session.auth.personalTeam.id,
          teamId
        ))
      ) {
        throw new TRPCError({ code: "UNAUTHORIZED" });
      }
      return await db.projects.projectsByTeamId(teamId);
    }),
  newProject: protectedProcedure
    .input(
      z.object({
        teamId: z.string(),
        name: z.string(),
        description: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input: { teamId, name, description } }) => {
      if (
        !(await db.teams.isAuthorizedForTeam(
          ctx.session.auth.personalTeam.id,
          teamId
        ))
      ) {
        throw new TRPCError({ code: "UNAUTHORIZED" });
      }
      const team = await db.projects.createProject(
        teamId,
        name,
        description || null
      );
      return team;
    }),
});

// export type definition of API
export type ProjectsRouter = typeof projectsRouter;
