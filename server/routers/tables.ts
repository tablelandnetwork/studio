import { TRPCError } from "@trpc/server";
import { z } from "zod";

import db from "@/db/api";
import { protectedProcedure, router } from "@/server/trpc";

export const tablesRouter = router({
  tablesForProject: protectedProcedure
    .input(z.object({ teamId: z.string(), projectId: z.string() }))
    .query(async ({ ctx, input: { projectId, teamId } }) => {
      // Is this person a team a member of the requested team?
      if (
        !(await db.teams.isAuthorizedForTeam(
          ctx.session.auth.personalTeam.id,
          teamId
        ))
      ) {
        throw new TRPCError({ code: "UNAUTHORIZED" });
      }
      return await db.tables.tablesByProjectId(projectId);
    }),
  newTable: protectedProcedure
    .input(
      z.object({
        projectId: z.string(),
        name: z.string(),
        description: z.string().optional(),
        schema: z.string(),
      })
    )
    .mutation(
      async ({ ctx, input: { projectId, name, description, schema } }) => {
        const team = await db.projects.projectTeamByProjectId(projectId);
        if (
          !(await db.teams.isAuthorizedForTeam(
            ctx.session.auth.personalTeam.id,
            team.id
          ))
        ) {
          throw new TRPCError({ code: "UNAUTHORIZED" });
        }
        const table = await db.tables.createTable(
          projectId,
          name,
          description || null,
          schema
        );
        return table;
      }
    ),
});

// export type definition of API
export type ProjectsRouter = typeof tablesRouter;
