import { type Store } from "@tableland/studio-store";
import { TRPCError } from "@trpc/server";
import { unsealData } from "iron-session";
import { z } from "zod";
import {
  protectedProcedure,
  publicProcedure,
  router,
  teamProcedure,
} from "../trpc";
import { type SendInviteFunc } from "../utils/sendInvite";

export function invitesRouter(
  store: Store,
  sendInvite: SendInviteFunc,
  dataSealPass: string,
) {
  return router({
    invitesForTeam: teamProcedure(store).query(async ({ ctx }) => {
      const invites = await store.invites.invitesForTeam(ctx.teamId);
      return { invites, teamAuthorization: ctx.teamAuthorization };
    }),
    inviteEmails: teamProcedure(store)
      .input(z.object({ emails: z.array(z.string().trim().email()) }))
      .mutation(async ({ ctx, input }) => {
        const invites = await store.invites.inviteEmailsToTeam(
          ctx.teamId,
          ctx.session.auth.user.teamId,
          input.emails,
        );
        await Promise.all(
          invites.map(async (invite) => await sendInvite(invite)),
        );
      }),
    resendInvite: teamProcedure(store)
      .input(z.object({ inviteId: z.string().trim() }))
      .mutation(async ({ input }) => {
        const invite = await store.invites.inviteById(input.inviteId);
        if (!invite) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Invite not found",
          });
        }
        return await sendInvite(invite);
      }),
    inviteFromSeal: publicProcedure
      .input(z.object({ seal: z.string().trim() }))
      .query(async ({ input }) => {
        const { inviteId } = await unsealData(input.seal, {
          password: dataSealPass,
        });
        const invite = await store.invites.inviteById(inviteId as string);
        if (!invite) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Invite not found",
          });
        }
        return invite;
      }),
    acceptInvite: protectedProcedure
      .input(z.object({ seal: z.string().trim() }))
      .mutation(async ({ input, ctx }) => {
        const { inviteId } = await unsealData(input.seal, {
          password: dataSealPass,
        });
        const invite = await store.invites.inviteById(inviteId as string);
        if (!invite) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Invite not found",
          });
        }
        // we want to make sure and check for "" since these columns are type text
        // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
        if (invite.claimedAt || invite.claimedByTeamId) {
          throw new TRPCError({
            code: "PRECONDITION_FAILED",
            message: "Invite has already been claimed",
          });
        }
        await store.invites.acceptInvite(invite, ctx.session.auth.personalTeam);
        return invite;
      }),
    ignoreInvite: publicProcedure
      .input(z.object({ seal: z.string().trim() }))
      .mutation(async ({ input }) => {
        const { inviteId } = await unsealData(input.seal, {
          password: dataSealPass,
        });
        const invite = await store.invites.inviteById(inviteId as string);
        if (!invite) {
          throw new Error("Invite not found");
        }
        // we want to make sure and check for "" since these columns are type text
        // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
        if (invite.claimedAt || invite.claimedByTeamId) {
          throw new TRPCError({
            code: "PRECONDITION_FAILED",
            message: "Invite has already been claimed",
          });
        }
        await store.invites.deleteInvite(inviteId as string);
        return invite;
      }),
    deleteInvite: teamProcedure(store)
      .input(z.object({ inviteId: z.string().trim() }))
      .mutation(async ({ input }) => {
        await store.invites.deleteInvite(input.inviteId);
      }),
  });
}
