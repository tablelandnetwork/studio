import { type Store, type schema } from "@tableland/studio-store";
import { TRPCError } from "@trpc/server";
import { z } from "zod";
import {
  teamNameAvailableSchema,
  newTeamSchema,
  updateTeamSchema,
} from "@tableland/studio-validators";
import {
  protectedProcedure,
  publicProcedure,
  createTRPCRouter,
  teamAdminProcedure,
} from "../trpc";
import { type SendInviteFunc } from "../utils/sendInvite";
import { internalError } from "../utils/internalError";
import { zeroNine } from "../utils/fourHundredError";

export function teamsRouter(store: Store, sendInvite: SendInviteFunc) {
  return createTRPCRouter({
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
      .input(teamNameAvailableSchema)
      .query(async ({ input }) => {
        return await store.teams.nameAvailable(input.name, input.teamId);
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
    userTeamsFromAddress: publicProcedure
      .input(z.object({ userAddress: z.string().trim().nonempty() }))
      .query(async ({ input, ctx }) => {
        const personalTeam = await store.users.userPersonalTeam(
          input?.userAddress,
        );

        if (!personalTeam) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: `No personal team found for ${input?.userAddress}`,
          });
        }

        return await store.teams.teamsByMemberId(personalTeam);
      }),
    newTeam: protectedProcedure
      .input(newTeamSchema)
      .mutation(async ({ ctx, input }) => {
        let team: schema.Team;
        let invites: schema.TeamInvite[];
        try {
          const nameAvailable = await store.teams.nameAvailable(input.name);

          if (!nameAvailable) {
            throw zeroNine(`the team name ${input.name} is not available`);
          }
        } catch (err: any) {
          if (err.status !== 409) {
            throw internalError("Error validating team name", err);
          }
          throw err;
        }

        try {
          const res = await store.teams.createTeamByPersonalTeam(
            input.name,
            ctx.session.auth.user.teamId,
            input.emailInvites,
          );
          team = res.team;
          invites = res.invites;
        } catch (err) {
          throw internalError("Error creating team", err);
        }

        // Intentionally swallowing any error here since the team is still
        // created and invites can be viewed and resent at any time.
        try {
          await Promise.all(
            invites.map(async (invite) => await sendInvite(invite)),
          );
        } catch (err) {
          // TODO: just noticing that if someone tries to invite 3 addresses
          //    and the first one causes an error I don't think other two
          //    addresses will be invited, which seems like incorrect behavior.
          //    i'm not sure this is the case, we should probably test this.
          console.log(
            `invalid invites: ${invites.map((i) => i.email).join(", ")}`,
          );
          console.error(err);
        }

        return team;
      }),
    updateTeam: teamAdminProcedure(store)
      .input(updateTeamSchema)
      .mutation(async ({ input: { name }, ctx }) => {
        let team: schema.Team | undefined;
        try {
          team = await store.teams.updateTeam(ctx.teamId, name);
        } catch (err) {
          throw internalError("Error updating team", err);
        }
        if (!team) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Team not found",
          });
        }
        return team;
      }),
    deleteTeam: teamAdminProcedure(store).mutation(async ({ ctx }) => {
      try {
        await store.teams.deleteTeam(ctx.teamId);
      } catch (err) {
        throw internalError("Error deleting team", err);
      }
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
  });
}
