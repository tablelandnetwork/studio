import { randomUUID } from "crypto";
import { desc, eq } from "drizzle-orm";
import { alias } from "drizzle-orm/sqlite-core";
import { sealData, unsealData } from "iron-session";
import { NewTeamInviteSealed, Team, TeamInvite } from "../schema";
import { db, tbl, teamInvites, teamMemberships, teams } from "./db";

export async function inviteEmailsToTeam(
  teamId: string,
  inviterTeamId: string,
  emails: string[]
) {
  const invites: TeamInvite[] = emails.map((email) => ({
    id: randomUUID(),
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
          password: process.env.DATA_SEAL_PASS as string,
          ttl: 0,
        }
      ),
    }))
  );
  await db.insert(teamInvites).values(sealedInvites).run();
  return invites;
}

export async function inviteById(id: string) {
  const invite = await db
    .select()
    .from(teamInvites)
    .where(eq(teamInvites.id, id))
    .get();
  if (!invite) return undefined;
  const { sealed, ...rest } = invite;
  const { email } = await unsealData(sealed, {
    password: process.env.DATA_SEAL_PASS as string,
  });
  return {
    ...rest,
    email: email as string,
  };
}

export async function acceptInvite(invite: TeamInvite, personalTeam: Team) {
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
    })
    .toSQL();
  await tbl.batch([
    tbl.prepare(invitesSql).bind(invitesParams),
    tbl.prepare(membershipsSql).bind(membershipsParams),
  ]);
}

export async function deleteInvite(id: string) {
  await db.delete(teamInvites).where(eq(teamInvites.id, id)).run();
}

export async function invitesForTeam(teamId: string) {
  const claimedByTeams = alias(teams, "claimed_by_teams");
  const invitesSealed = await db
    .select({ inviter: teams, invite: teamInvites, claimedBy: claimedByTeams })
    .from(teamInvites)
    .innerJoin(teams, eq(teamInvites.inviterTeamId, teams.id))
    .leftJoin(
      claimedByTeams,
      eq(teamInvites.claimedByTeamId, claimedByTeams.id)
    )
    .where(eq(teamInvites.teamId, teamId))
    .orderBy(desc(teamInvites.createdAt))
    .all();
  const invites = await Promise.all(
    invitesSealed.map(
      async ({ inviter, invite: { sealed, ...rest }, claimedBy }) => {
        const { email } = await unsealData(sealed, {
          password: process.env.DATA_SEAL_PASS as string,
        });
        return {
          inviter,
          invite: { ...rest, email: email as string },
          claimedBy,
        };
      }
    )
  );
  return invites;
}
