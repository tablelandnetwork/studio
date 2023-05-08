import { TRPCError } from "@trpc/server";
import { z } from "zod";

import {
  acceptInvite,
  createTeamByPersonalTeam,
  deleteInvite,
  inviteById,
  teamById,
  teamBySlug,
  teamsByMemberTeamId,
} from "@/db/api";
import { Team } from "@/db/schema";
import { protectedProcedure, publicProcedure, router } from "@/server/trpc";
import { sendInvite } from "@/utils/send";
import { unsealData } from "iron-session";

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
          label: "Personal Team",
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
        emailInvites: z.array(z.string()),
      })
    )
    .mutation(async ({ ctx, input: { name, emailInvites } }) => {
      const { team, invites } = await createTeamByPersonalTeam(
        name,
        ctx.session.auth.user.teamId,
        emailInvites
      );
      await Promise.all(invites.map((invite) => sendInvite(invite)));
      return team;
    }),
  acceptInvite: protectedProcedure
    .input(z.object({ seal: z.string() }))
    .mutation(async ({ ctx, input: { seal } }) => {
      const { inviteId } = await unsealData(seal, {
        password: process.env.DATA_SEAL_PASS as string,
      });
      const invite = await inviteById(inviteId as string);
      if (!invite) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Invite not found" });
      }
      await acceptInvite(invite, ctx.session.auth.personalTeam);
    }),
  ignoreInvite: publicProcedure
    .input(z.object({ seal: z.string() }))
    .mutation(async ({ input: { seal } }) => {
      const { inviteId } = await unsealData(seal, {
        password: process.env.DATA_SEAL_PASS as string,
      });
      await deleteInvite(inviteId as string);
    }),
});

// export type definition of API
export type TeamsRouter = typeof teamsRouter;
