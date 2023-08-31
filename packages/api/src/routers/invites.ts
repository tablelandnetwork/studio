import { Store } from "@tableland/studio-store";
import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { router, teamProcedure } from "../trpc";
import { SendInviteFunc } from "../utils/sendInvite";

export function invitesRouter(store: Store, sendInvite: SendInviteFunc) {
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
    deleteInvite: teamProcedure(store)
      .input(z.object({ inviteId: z.string() }))
      .mutation(async ({ input }) => {
        await store.invites.deleteInvite(input.inviteId);
      }),
  });
}
