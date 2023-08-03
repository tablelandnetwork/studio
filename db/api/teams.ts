import { randomUUID } from "crypto";
import { and, asc, eq } from "drizzle-orm";
import { sealData } from "iron-session";
import { cache } from "react";
import { NewTeamInviteSealed, Team, TeamInvite, teamProjects } from "../schema";
import {
  db,
  projects,
  slugify,
  tbl,
  teamInvites,
  teamMemberships,
  teams,
  users,
} from "./db";

export const createTeamByPersonalTeam = cache(async function (
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
    .values({
      memberTeamId: personalTeamId,
      teamId,
      isOwner: 1,
      joinedAt: new Date().toISOString(),
    })
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
});

export const teamBySlug = cache(async function (slug: string) {
  const team = await db.select().from(teams).where(eq(teams.slug, slug)).get();
  // TODO: Figure out how drizzle handles not found even though the return type isn't optional.
  return team ? team : undefined;
});

export const teamById = cache(async function (id: string) {
  return db.select().from(teams).where(eq(teams.id, id)).get();
});

export const teamsByMemberId = cache(async function (memberId: string) {
  const res = await db
    .select()
    .from(teamMemberships)
    .innerJoin(teams, eq(teamMemberships.teamId, teams.id))
    .leftJoin(teamProjects, eq(teamProjects.teamId, teams.id))
    .leftJoin(projects, eq(teamProjects.projectId, projects.id))
    .where(eq(teamMemberships.memberTeamId, memberId))
    .orderBy(asc(teams.slug), asc(projects.slug))
    .all();

  const iter = res
    .reduce(
      (acc, r) => {
        if (!acc.has(r.teams.id)) {
          acc.set(r.teams.id, {
            id: r.teams.id,
            name: r.teams.name,
            slug: r.teams.slug,
            personal: r.teams.personal,
            projects: [],
          });
        }
        if (r.projects) {
          acc.get(r.teams.id)?.projects.push(r.projects);
        }
        return acc;
      },
      new Map<
        string,
        {
          projects: {
            name: string;
            description: string | null;
            id: string;
            slug: string;
          }[];
          name: string;
          id: string;
          slug: string;
          personal: number;
        }
      >()
    )
    .values();
  return Array.from(iter);

  // const res1 = await db.query.teamMemberships.findMany({
  //   where: (teamMemberships, { eq }) =>
  //     eq(teamMemberships.memberTeamId, memberId),
  //   with: {
  //     team: {
  //       with: {
  //         teamProjects: {
  //           // orderBy: (teamProjects, { asc }) => [asc(teamProjects.isOwner)],
  //           with: {
  //             project: true,
  //           },
  //         },
  //       },
  //     },
  //   },
  // });
  // return res1.map((teamMembership) => {
  //   const {
  //     team: { teamProjects, ...restTeam },
  //   } = teamMembership;
  //   const projects = teamProjects.map((teamProject) => teamProject.project);
  //   return {
  //     ...restTeam,
  //     projects,
  //   };
  // });
});

export const userTeamsForTeamId = cache(async function (teamId: string) {
  const res = await db
    .select({ teams, users, teamMemberships })
    .from(users)
    .innerJoin(teamMemberships, eq(users.teamId, teamMemberships.memberTeamId))
    .innerJoin(teams, eq(users.teamId, teams.id))
    .where(eq(teamMemberships.teamId, teamId))
    .orderBy(teams.name)
    .all();
  return res.map((r) => ({
    address: r.users.address,
    personalTeam: r.teams,
    membership: r.teamMemberships,
  }));
});

export const isAuthorizedForTeam = cache(async function (
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
  return membership ? membership : false;
});
