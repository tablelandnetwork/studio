import { createHash } from "crypto";
import { type Database } from "@tableland/sdk";
import { asc, eq } from "drizzle-orm";
import { type DrizzleD1Database } from "drizzle-orm/d1";
import { alias } from "drizzle-orm/sqlite-core";
import { sealData, unsealData } from "iron-session";
import * as schema from "../schema/index.js";

type NewOrgInviteSealed = schema.NewOrgInviteSealed;
type Org = schema.Org;
type OrgInvite = schema.OrgInvite;
const orgInvites = schema.orgInvites;
const orgMemberships = schema.orgMemberships;
const orgs = schema.orgs;

export function invites(
  db: DrizzleD1Database<typeof schema>,
  tbl: Database,
  dataSealPass: string,
) {
  return {
    inviteEmailsToOrg: async function (
      orgId: string,
      inviterOrgId: string,
      emails: string[],
    ) {
      const invites: OrgInvite[] = emails.map((email) => ({
        // Assure we don't allow duplicate invites per org/email. This is necessary
        // because we don't store the email address in plaintext in the database.
        id: createHash("sha256")
          .update(orgId + email)
          .digest("hex"),
        orgId,
        inviterOrgId,
        email,
        createdAt: new Date().toISOString(),
        claimedByOrgId: null,
        claimedAt: null,
      }));
      const sealedInvites: NewOrgInviteSealed[] = await Promise.all(
        invites.map(async ({ email, ...rest }) => ({
          ...rest,
          sealed: await sealData(
            { email },
            {
              password: dataSealPass,
              ttl: 0,
            },
          ),
        })),
      );
      await db.insert(orgInvites).values(sealedInvites).run();
      return invites;
    },

    inviteById: async function (id: string) {
      const invite = await db
        .select()
        .from(orgInvites)
        .where(eq(orgInvites.id, id))
        .get();
      if (!invite) return undefined;
      const { sealed, ...rest } = invite;
      const { email } = await unsealData<{ email: string }>(sealed, {
        password: dataSealPass,
      });
      return {
        ...rest,
        email,
      };
    },

    acceptInvite: async function (invite: OrgInvite, personalOrg: Org) {
      const { sql: invitesSql, params: invitesParams } = db
        .update(orgInvites)
        .set({
          claimedByOrgId: personalOrg.id,
          claimedAt: new Date().toISOString(),
        })
        .where(eq(orgInvites.id, invite.id))
        .toSQL();
      const { sql: membershipsSql, params: membershipsParams } = db
        .insert(orgMemberships)
        .values({
          orgId: invite.orgId,
          memberOrgId: personalOrg.id,
          isOwner: 0,
          joinedAt: new Date().toISOString(),
        })
        .toSQL();
      await tbl.batch([
        tbl.prepare(invitesSql).bind(invitesParams),
        tbl.prepare(membershipsSql).bind(membershipsParams),
      ]);
    },

    deleteInvite: async function (id: string) {
      await db.delete(orgInvites).where(eq(orgInvites.id, id)).run();
    },

    invitesForOrg: async function invitesForOrg(orgId: string) {
      const claimedByOrgs = alias(orgs, "claimed_by_orgs");
      const invitesSealed = await db
        .select({
          inviter: orgs,
          invite: orgInvites,
          claimedBy: claimedByOrgs,
        })
        .from(orgInvites)
        .innerJoin(orgs, eq(orgInvites.inviterOrgId, orgs.id))
        .leftJoin(
          claimedByOrgs,
          eq(orgInvites.claimedByOrgId, claimedByOrgs.id),
        )
        .where(eq(orgInvites.orgId, orgId))
        .orderBy(asc(orgInvites.createdAt))
        .all();
      const invites = await Promise.all(
        invitesSealed.map(
          async ({ inviter, invite: { sealed, ...rest }, claimedBy }) => {
            const { email } = await unsealData<{ email: string }>(sealed, {
              password: dataSealPass,
            });
            return {
              inviter,
              invite: { ...rest, email },
              claimedBy,
            };
          },
        ),
      );
      return invites;
    },
  };
}
