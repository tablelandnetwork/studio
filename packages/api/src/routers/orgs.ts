import { type Store, type schema } from "@tableland/studio-store";
import { TRPCError } from "@trpc/server";
import { z } from "zod";
import {
  orgNameAvailableSchema,
  newOrgSchema,
  updateOrgSchema,
} from "@tableland/studio-validators";
import {
  protectedProcedure,
  publicProcedure,
  createTRPCRouter,
  orgAdminProcedure,
} from "../trpc";
import { type SendInviteFunc } from "../utils/sendInvite";
import { internalError } from "../utils/internalError";
import { zeroNine } from "../utils/fourHundredError";

export function orgsRouter(store: Store, sendInvite: SendInviteFunc) {
  return createTRPCRouter({
    isAuthorized: publicProcedure
      .input(z.object({ orgId: z.string().trim() }).or(z.void()))
      .query(async ({ ctx, input }) => {
        if (!ctx.session.auth) {
          return false;
        }
        // we want to check for null, undefined, and ""
        // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
        const orgId = input?.orgId || ctx.session.auth.user.orgId;
        if (!orgId) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "Org ID must be provided as input or session context",
          });
        }
        return await store.orgs.isAuthorizedForOrg(
          ctx.session.auth.user.orgId,
          orgId,
        );
      }),
    nameAvailable: publicProcedure
      .input(orgNameAvailableSchema)
      .query(async ({ input }) => {
        return await store.orgs.nameAvailable(input.name, input.orgId);
      }),
    getOrg: publicProcedure
      .input(z.object({ orgId: z.string().trim() }).or(z.void()))
      .query(async ({ input, ctx }) => {
        // we want to check for null, undefined, and ""
        // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
        const orgId = input?.orgId || ctx.session.auth?.user.orgId;
        if (!orgId) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "Org ID must be provided as input or session context",
          });
        }
        const org = await store.orgs.orgById(orgId);
        if (!org) {
          throw new TRPCError({ code: "NOT_FOUND", message: "Org not found" });
        }
        return org;
      }),
    orgBySlug: publicProcedure
      .input(z.object({ slug: z.string().trim() }))
      .query(async ({ input }) => {
        const org = await store.orgs.orgBySlug(input.slug);
        if (!org) {
          throw new TRPCError({ code: "NOT_FOUND", message: "Org not found" });
        }
        return org;
      }),
    userOrgs: publicProcedure
      .input(z.object({ userOrgId: z.string().trim().min(1) }).or(z.void()))
      .query(async ({ input, ctx }) => {
        // we want to check for null, undefined, and ""
        // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
        const orgId = input?.userOrgId || ctx.session.auth?.user.orgId;
        if (!orgId) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "Org ID must be provided as input or session context",
          });
        }
        return await store.orgs.orgsByMemberId(orgId);
      }),
    userOrgsFromAddress: publicProcedure
      .input(z.object({ userAddress: z.string().trim().min(1) }))
      .query(async ({ input, ctx }) => {
        const personalOrg = await store.users.userPersonalOrg(
          input?.userAddress,
        );

        if (!personalOrg) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: `No personal org found for ${input?.userAddress}`,
          });
        }

        return await store.orgs.orgsByMemberId(personalOrg);
      }),
    newOrg: protectedProcedure
      .input(newOrgSchema)
      .mutation(async ({ ctx, input }) => {
        let org: schema.Org;
        let invites: schema.OrgInvite[];
        try {
          const nameAvailable = await store.orgs.nameAvailable(input.name);

          if (!nameAvailable) {
            throw zeroNine(`the org name ${input.name} is not available`);
          }
        } catch (err: any) {
          if (err.status !== 409) {
            throw internalError("Error validating org name", err);
          }
          throw err;
        }

        try {
          const res = await store.orgs.createOrgByPersonalOrg(
            input.name,
            ctx.session.auth.user.orgId,
            input.emailInvites,
          );
          org = res.org;
          invites = res.invites;
        } catch (err) {
          throw internalError("Error creating org", err);
        }

        // Intentionally swallowing any error here since the org is still
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

        return org;
      }),
    updateOrg: orgAdminProcedure(store)
      .input(updateOrgSchema)
      .mutation(async ({ input: { name }, ctx }) => {
        let org: schema.Org | undefined;
        try {
          org = await store.orgs.updateOrg(ctx.orgId, name);
        } catch (err) {
          throw internalError("Error updating org", err);
        }
        if (!org) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Org not found",
          });
        }
        return org;
      }),
    deleteOrg: orgAdminProcedure(store).mutation(async ({ ctx }) => {
      try {
        await store.orgs.deleteOrg(ctx.orgId);
      } catch (err) {
        throw internalError("Error deleting org", err);
      }
    }),
    usersForOrg: publicProcedure
      .input(z.object({ orgId: z.string().trim() }).or(z.void()))
      .query(async ({ input, ctx }) => {
        // we want to check for null, undefined, and ""
        // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
        const orgId = input?.orgId || ctx.session.auth?.user.orgId;
        if (!orgId) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "Org ID must be provided as input or session context",
          });
        }
        const people = await store.orgs.userOrgsForOrgId(orgId);
        return people;
      }),
    toggleAdmin: orgAdminProcedure(store)
      .input(z.object({ userId: z.string().trim() }))
      .mutation(async ({ input, ctx }) => {
        await store.orgs.toggleAdmin(ctx.orgId, input.userId);
      }),
    removeOrgMember: orgAdminProcedure(store)
      .input(z.object({ userId: z.string().trim() }))
      .mutation(async ({ input, ctx }) => {
        await store.orgs.removeOrgMember(ctx.orgId, input.userId);
      }),
  });
}
