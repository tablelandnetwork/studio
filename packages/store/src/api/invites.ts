import { createHash } from "crypto";
import { type Database } from "@tableland/sdk";
import { asc, eq } from "drizzle-orm";
import { type DrizzleD1Database } from "drizzle-orm/d1";
import { alias } from "drizzle-orm/sqlite-core";
import { sealData, unsealData } from "iron-session";
import * as schema from "../schema/index.js";

type NewTeamInviteSealed = schema.NewTeamInviteSealed;
type Team = schema.Team;
type TeamInvite = schema.TeamInvite;
const teamInvites = schema.teamInvites;
const teamMemberships = schema.teamMemberships;
const teams = schema.teams;

export function invites(
  db: DrizzleD1Database<typeof schema>,
  tbl: Database,
  dataSealPass: string,
) {
  return {
    inviteEmailsToTeam: async function (
      teamId: string,
      inviterTeamId: string,
      emails: string[],
    ) {
      const invites: TeamInvite[] = emails.map((email) => ({
        // Assure we don't allow duplicate invites per team/email. This is necessary
        // because we don't store the email address in plaintext in the database.
        id: createHash("sha256")
          .update(teamId + email)
          .digest("hex"),
        teamId,
        inviterTeamId,
        email,
        createdAt: new Date().toISOString(),
        claimedByTeamId: null,
        claimedAt: null,
      }));
      const sealedInvites: NewTeamInviteSealed[] = await Promise.all(
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
      await db.insert(teamInvites).values(sealedInvites).run();
      return invites;
    },

    inviteById: async function (id: string) {
      const invite = await db
        .select()
        .from(teamInvites)
        .where(eq(teamInvites.id, id))
        .get();
      if (!invite) return undefined;
      const { sealed, ...rest } = invite;
      const { email } = await unsealData(sealed, {
        password: dataSealPass,
      });
      return {
        ...rest,
        email: email as string,
      };
    },

    acceptInvite: async function (invite: TeamInvite, personalTeam: Team) {
      const { sql: invitesSql, params: invitesParams } = db
        .update(teamInvites)
        .set({
          claimedByTeamId: personalTeam.id,
          claimedAt: new Date().toISOString(),
        })
        .where(eq(teamInvites.id, invite.id))
        .toSQL();
      const { sql: membershipsSql, params: membershipsParams } = db
        .insert(teamMemberships)
        .values({
          teamId: invite.teamId,
          memberTeamId: personalTeam.id,
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
      await db.delete(teamInvites).where(eq(teamInvites.id, id)).run();
    },

    invitesForTeam: async function invitesForTeam(teamId: string) {
      const claimedByTeams = alias(teams, "claimed_by_teams");
      const invitesSealed = await db
        .select({
          inviter: teams,
          invite: teamInvites,
          claimedBy: claimedByTeams,
        })
        .from(teamInvites)
        .innerJoin(teams, eq(teamInvites.inviterTeamId, teams.id))
        .leftJoin(
          claimedByTeams,
          eq(teamInvites.claimedByTeamId, claimedByTeams.id),
        )
        .where(eq(teamInvites.teamId, teamId))
        .orderBy(asc(teamInvites.createdAt))
        .all();
      const invites = await Promise.all(
        invitesSealed.map(
          async ({ inviter, invite: { sealed, ...rest }, claimedBy }) => {
            const { email } = await unsealData(sealed, {
              password: dataSealPass,
            });
            return {
              inviter,
              invite: { ...rest, email: email as string },
              claimedBy,
            };
          },
        ),
      );
      return invites;
    },
  };
}
