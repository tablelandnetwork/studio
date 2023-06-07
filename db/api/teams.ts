import { randomUUID } from "crypto";
import { and, eq } from "drizzle-orm";
import { sealData } from "iron-session";
import { NewTeamInviteSealed, Team, TeamInvite } from "../schema";
import {
  db,
  slugify,
  tbl,
  teamInvites,
  teamMemberships,
  teams,
  users,
} from "./db";

export async function createTeamByPersonalTeam(
  name: string,
  personalTeamId: string,
  inviteEmails: string[]
) {
  const teamId = randomUUID();
  const slug = slugify(name);
  const team: Team = { id: teamId, personal: 0, name, slug };
  const { sql: teamsSql, params: teamsParams } = db
    .insert(teams)
    .values(team)
    .toSQL();
  const { sql: teamMembershipsSql, params: teamMembershipsParams } = db
    .insert(teamMemberships)
    .values({ memberTeamId: personalTeamId, teamId, isOwner: 1 })
    .toSQL();
  const invites: TeamInvite[] = inviteEmails.map((email) => ({
    id: randomUUID(),
    teamId,
    inviterTeamId: personalTeamId,
    email,
    createdAt: new Date().toISOString(),
    claimedByTeamId: null,
    claimedAt: null,
  }));
  const batch = [
    tbl.prepare(teamsSql).bind(teamsParams),
    tbl.prepare(teamMembershipsSql).bind(teamMembershipsParams),
  ];
  if (!!invites.length) {
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
    const { sql: invitesSql, params: invitesParams } = db
      .insert(teamInvites)
      .values(sealedInvites)
      .toSQL();
    batch.push(tbl.prepare(invitesSql).bind(invitesParams));
  }
  await tbl.batch(batch);
  return { team, invites };
}

export async function teamBySlug(slug: string) {
  return db.select().from(teams).where(eq(teams.slug, slug)).get();
}

export async function teamById(id: string) {
  return db.select().from(teams).where(eq(teams.id, id)).get();
}

export async function teamsByMemberTeamId(memberTeamId: string) {
  const res = await db
    .select({ teams })
    .from(teamMemberships)
    .innerJoin(teams, eq(teamMemberships.teamId, teams.id))
    .where(eq(teamMemberships.memberTeamId, memberTeamId))
    .orderBy(teams.name)
    .all();
  return res.map((r) => r.teams);
}

export async function userTeamsForTeamId(teamId: string) {
  const res = await db
    .select({ teams, users })
    .from(users)
    .innerJoin(teamMemberships, eq(users.teamId, teamMemberships.memberTeamId))
    .innerJoin(teams, eq(users.teamId, teams.id))
    .where(eq(teamMemberships.teamId, teamId))
    .orderBy(teams.name)
    .all();
  return res.map((r) => ({ address: r.users.address, personalTeam: r.teams }));
}

export async function isAuthorizedForTeam(
  memberTeamId: string,
  teamId: string
) {
  const membership = await db
    .select()
    .from(teamMemberships)
    .where(
      and(
        eq(teamMemberships.teamId, teamId),
        eq(teamMemberships.memberTeamId, memberTeamId)
      )
    )
    .get();
  return !!membership;
}
