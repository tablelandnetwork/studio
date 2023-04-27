import { number, z } from "zod";
import { TRPCError } from "@trpc/server";
import { protectedProcedure, publicProcedure, router } from "@/server/trpc";
import {
  teamBySlug,
  teamById,
  teamsByUserId,
  createTeamByUser,
} from "@/db/api";
import { Team } from "@/db/schema";

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
  teamsForUser: protectedProcedure
    .input(z.object({ userId: z.string() }))
    .query(async ({ ctx, input: { userId } }) => {
      const teams = await teamsByUserId(userId);
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
          team.name = team.name || "Personal Team";
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
      const team = await createTeamByUser(name, ctx.session.auth.user.id);
      return team;
    }),
});

// export type definition of API
export type TeamsRouter = typeof teamsRouter;
