import { Store } from "@tableland/studio-store";
import { TRPCError } from "@trpc/server";
import { unsealData } from "iron-session";
import { z } from "zod";
import {
  protectedProcedure,
  publicProcedure,
  router,
  teamProcedure,
} from "../trpc";
import { SendInviteFunc } from "../utils/sendInvite";

export function invitesRouter(
  store: Store,
  sendInvite: SendInviteFunc,
  dataSealPass: string,
) {
  return router({
    invitesForTeam: teamProcedure(store).query(async ({ ctx, input }) => {
      const invites = await store.invites.invitesForTeam(input.teamId);
      return { invites, teamAuthorization: ctx.teamAuthorization };
    }),
    inviteEmails: teamProcedure(store)
      .input(z.object({ emails: z.array(z.string().email()) }))
      .mutation(async ({ ctx, input }) => {
        const invites = await store.invites.inviteEmailsToTeam(
          input.teamId,
          ctx.session.auth.user.teamId,
          input.emails,
        );
        await Promise.all(invites.map((invite) => sendInvite(invite)));
      }),
    resendInvite: teamProcedure(store)
      .input(z.object({ inviteId: z.string() }))
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
    acceptInvite: protectedProcedure
      .input(z.object({ seal: z.string() }))
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
      .input(z.object({ seal: z.string() }))
      .mutation(async ({ input }) => {
        const { inviteId } = await unsealData(input.seal, {
          password: dataSealPass,
        });
        const invite = await store.invites.inviteById(inviteId as string);
        if (!invite) {
          throw new Error("Invite not found");
        }
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
      .input(z.object({ inviteId: z.string() }))
      .mutation(async ({ input }) => {
        await store.invites.deleteInvite(input.inviteId);
      }),
  });
}
