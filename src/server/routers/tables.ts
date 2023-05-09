import { TRPCError } from "@trpc/server";
import { z } from "zod";

import {
  createTable,
  isAuthorizedForTeam,
  projectTeamByProjectId,
  tablesByProjectId,
} from "@/db/api";
import { protectedProcedure, router } from "@/server/trpc";

export const tablesRouter = router({
  tablesForProject: protectedProcedure
    .input(z.object({ teamId: z.string(), projectId: z.string() }))
    .query(async ({ ctx, input: { projectId, teamId } }) => {
      // Is this person a team a member of the requested team?
      if (
        !(await isAuthorizedForTeam(ctx.session.auth.personalTeam.id, teamId))
      ) {
        throw new TRPCError({ code: "UNAUTHORIZED" });
      }
      return await tablesByProjectId(projectId);
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
        const teamId = await projectTeamByProjectId(projectId);
        if (
          !(await isAuthorizedForTeam(ctx.session.auth.personalTeam.id, teamId))
        ) {
          throw new TRPCError({ code: "UNAUTHORIZED" });
        }
        const team = await createTable(
          projectId,
          name,
          description || null,
          schema
        );
        return team;
      }
    ),
});

// export type definition of API
export type ProjectsRouter = typeof tablesRouter;
