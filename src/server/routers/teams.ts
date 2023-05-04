import { TRPCError } from "@trpc/server";
import { z } from "zod";

import {
  createTeamByPersonalTeam,
  teamById,
  teamBySlug,
  teamsByMemberTeamId,
} from "@/db/api";
import { Team } from "@/db/schema";
import { protectedProcedure, router } from "@/server/trpc";

export const teamsRouter = router({
  teamByName: protectedProcedure
    .input(z.object({ name: z.string() }))
    .query(async ({ ctx, input: { name } }) => {
      const team = await teamBySlug(name);
      if (!team) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Team not found",
        });
      }
      return team;
    }),
  teamById: protectedProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input: { id } }) => {
      const team = await teamById(id);
      if (!team) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Team not found",
        });
      }
      return team;
    }),
  teamsForPersonalTeam: protectedProcedure
    .input(z.object({ personalTeamId: z.string() }))
    .query(async ({ ctx, input: { personalTeamId } }) => {
      const teams = await teamsByMemberTeamId(personalTeamId);
      const res: { label: string; teams: Team[] }[] = [
        {
          label: "Personal Account",
          teams: [],
        },
        {
          label: "Teams",
          teams: [],
        },
      ];
      teams.forEach((team) => {
        if (team.personal) {
          res[0].teams.push(team);
        } else {
          res[1].teams.push(team);
        }
      });
      return res;
    }),
  newTeam: protectedProcedure
    .input(
      z.object({
        name: z
          .string()
          .regex(
            new RegExp("[A-Za-z]"),
            "Team name must include at least one letter"
          ),
      })
    )
    .mutation(async ({ ctx, input: { name } }) => {
      const team = await createTeamByPersonalTeam(
        name,
        ctx.session.auth.personalTeam.id
      );
      return team;
    }),
});

// export type definition of API
export type TeamsRouter = typeof teamsRouter;
