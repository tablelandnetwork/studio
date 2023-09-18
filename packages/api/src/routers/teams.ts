import { Store } from "@tableland/studio-store";
import { TRPCError } from "@trpc/server";
import { z } from "zod";
import {
  protectedProcedure,
  publicProcedure,
  router,
  teamAdminProcedure,
  teamProcedure,
} from "../trpc";
import { SendInviteFunc } from "../utils/sendInvite";

export function teamsRouter(store: Store, sendInvite: SendInviteFunc) {
  return router({
    teamById: publicProcedure
      .input(z.object({ teamId: z.string() }))
      .query(async ({ input }) => {
        const team = await store.teams.teamById(input.teamId);
        if (!team) {
          throw new TRPCError({ code: "NOT_FOUND", message: "Team not found" });
        }
        return team;
      }),
    teamBySlug: publicProcedure
      .input(z.object({ slug: z.string() }))
      .query(async ({ input }) => {
        const team = await store.teams.teamBySlug(input.slug);
        if (!team) {
          throw new TRPCError({ code: "NOT_FOUND", message: "Team not found" });
        }
        return team;
      }),
    userTeams: publicProcedure
      .input(z.object({ userTeamId: z.string().nonempty() }).or(z.void()))
      .query(async ({ input, ctx }) => {
        const teamId = input?.userTeamId || ctx.session.auth?.user.teamId;
        if (!teamId) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "Team ID must be provided as input or session context",
          });
        }
        return await store.teams.teamsByMemberId(teamId);
      }),
    newTeam: protectedProcedure
      .input(z.object({ name: z.string(), emailInvites: z.array(z.string()) }))
      .mutation(async ({ ctx, input }) => {
        const { team, invites } = await store.teams.createTeamByPersonalTeam(
          input.name,
          ctx.session.auth.user.teamId,
          input.emailInvites,
        );
        await Promise.all(invites.map((invite) => sendInvite(invite)));
        return team;
      }),
    usersForTeam: teamProcedure(store).query(async ({ input }) => {
      const people = await store.teams.userTeamsForTeamId(input.teamId);
      return people;
    }),
    toggleAdmin: teamAdminProcedure(store)
      .input(z.object({ userId: z.string() }))
      .mutation(async ({ input }) => {
        await store.teams.toggleAdmin(input.teamId, input.userId);
      }),
    removeTeamMember: teamAdminProcedure(store)
      .input(z.object({ userId: z.string() }))
      .mutation(async ({ input }) => {
        await store.teams.removeTeamMember(input.teamId, input.userId);
      }),
  });
}