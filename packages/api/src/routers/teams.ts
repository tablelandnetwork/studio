import { Store } from "@tableland/studio-store";
import { TRPCError } from "@trpc/server";
import { z } from "zod";
import {
  protectedProcedure,
  publicProcedure,
  router,
  teamAdminProcedure,
} from "../trpc";
import { SendInviteFunc } from "../utils/sendInvite";

export function teamsRouter(store: Store, sendInvite: SendInviteFunc) {
  return router({
    isAuthorized: publicProcedure
      .input(z.object({ teamId: z.string().trim() }))
      .query(async ({ ctx, input }) => {
        if (!ctx.session.auth) {
          return false;
        }
        return await store.teams.isAuthorizedForTeam(
          ctx.session.auth.user.teamId,
          input.teamId,
        );
      }),
    nameAvailable: publicProcedure
      .input(z.object({ name: z.string().trim() }))
      .query(async ({ input }) => {
        return await store.teams.nameAvailable(input.name);
      }),
    teamById: publicProcedure
      .input(z.object({ teamId: z.string().trim() }))
      .query(async ({ input }) => {
        const team = await store.teams.teamById(input.teamId);
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
        const { team, invites } = await store.teams.createTeamByPersonalTeam(
          input.name,
          ctx.session.auth.user.teamId,
          input.emailInvites,
        );
        await Promise.all(invites.map((invite) => sendInvite(invite)));
        return team;
      }),
    usersForTeam: publicProcedure
      .input(z.object({ teamId: z.string().trim() }))
      .query(async ({ input }) => {
        const people = await store.teams.userTeamsForTeamId(input.teamId);
        return people;
      }),
    toggleAdmin: teamAdminProcedure(store)
      .input(z.object({ userId: z.string().trim() }))
      .mutation(async ({ input }) => {
        await store.teams.toggleAdmin(input.teamId, input.userId);
      }),
    removeTeamMember: teamAdminProcedure(store)
      .input(z.object({ userId: z.string().trim() }))
      .mutation(async ({ input }) => {
        await store.teams.removeTeamMember(input.teamId, input.userId);
      }),
  });
}
