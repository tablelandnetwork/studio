import { type Store, type schema } from "@tableland/studio-store";
import { TRPCError } from "@trpc/server";
import { z } from "zod";
import {
  protectedProcedure,
  publicProcedure,
  router,
  teamAdminProcedure,
} from "../trpc";
import { type SendInviteFunc } from "../utils/sendInvite";

export function teamsRouter(store: Store, sendInvite: SendInviteFunc) {
  return router({
    isAuthorized: publicProcedure
      .input(z.object({ teamId: z.string().trim() }).or(z.void()))
      .query(async ({ ctx, input }) => {
        if (!ctx.session.auth) {
          return false;
        }
        // we want to check for null, undefined, and ""
        // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
        const teamId = input?.teamId || ctx.session.auth.user.teamId;
        if (!teamId) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "Team ID must be provided as input or session context",
          });
        }
        return await store.teams.isAuthorizedForTeam(
          ctx.session.auth.user.teamId,
          teamId,
        );
      }),
    nameAvailable: publicProcedure
      .input(z.object({ name: z.string().trim() }))
      .query(async ({ input }) => {
        return await store.teams.nameAvailable(input.name);
      }),
    getTeam: publicProcedure
      .input(z.object({ teamId: z.string().trim() }).or(z.void()))
      .query(async ({ input, ctx }) => {
        // we want to check for null, undefined, and ""
        // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
        const teamId = input?.teamId || ctx.session.auth?.user.teamId;
        if (!teamId) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "Team ID must be provided as input or session context",
          });
        }
        const team = await store.teams.teamById(teamId);
        if (!team) {
          throw new TRPCError({ code: "NOT_FOUND", message: "Team not found" });
        }
        return team;
      }),
    teamBySlug: publicProcedure
      .input(z.object({ slug: z.string().trim() }))
      .query(async ({ input }) => {
        const team = await store.teams.teamBySlug(input.slug);
        if (!team) {
          throw new TRPCError({ code: "NOT_FOUND", message: "Team not found" });
        }
        return team;
      }),
    userTeams: publicProcedure
      .input(
        z.object({ userTeamId: z.string().trim().nonempty() }).or(z.void()),
      )
      .query(async ({ input, ctx }) => {
        // we want to check for null, undefined, and ""
        // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
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
      .input(
        z.object({
          name: z.string().trim(),
          emailInvites: z.array(z.string().trim()),
        }),
      )
      .mutation(async ({ ctx, input }) => {
        let team: schema.Team;
        let invites: schema.TeamInvite[];
        try {
          const res = await store.teams.createTeamByPersonalTeam(
            input.name,
            ctx.session.auth.user.teamId,
            input.emailInvites,
          );
          team = res.team;
          invites = res.invites;
        } catch (e) {
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Error creating team",
            cause: e,
          });
        }

        // Intentionally swallowing any error here since the team is still
        // created and invites can be viewed and resent at any time.
        try {
          await Promise.all(
            invites.map(async (invite) => await sendInvite(invite)),
          );
        } catch (e) {}

        return team;
      }),
    usersForTeam: publicProcedure
      .input(z.object({ teamId: z.string().trim() }).or(z.void()))
      .query(async ({ input, ctx }) => {
        // we want to check for null, undefined, and ""
        // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
        const teamId = input?.teamId || ctx.session.auth?.user.teamId;
        if (!teamId) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "Team ID must be provided as input or session context",
          });
        }
        const people = await store.teams.userTeamsForTeamId(teamId);
        return people;
      }),
    toggleAdmin: teamAdminProcedure(store)
      .input(z.object({ userId: z.string().trim() }))
      .mutation(async ({ input, ctx }) => {
        await store.teams.toggleAdmin(ctx.teamId, input.userId);
      }),
    removeTeamMember: teamAdminProcedure(store)
      .input(z.object({ userId: z.string().trim() }))
      .mutation(async ({ input, ctx }) => {
        await store.teams.removeTeamMember(ctx.teamId, input.userId);
      }),
    updateTeamName: teamAdminProcedure(store)
      .input(z.object({ name: z.string().trim() }))
      .mutation(async ({ input, ctx }) => {
        const res = await store.teams.updateTeamName(ctx.teamId, input.name);
        return res;
      }),
  });
}
