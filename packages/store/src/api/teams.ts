import { Database } from "@tableland/sdk";
import { randomUUID } from "crypto";
import { and, asc, eq } from "drizzle-orm";
import { DrizzleD1Database } from "drizzle-orm/d1";
import { sealData } from "iron-session";
import * as schema from "../schema";
import {
  NewTeamInviteSealed,
  Team,
  TeamInvite,
  projects,
  teamInvites,
  teamMemberships,
  teamProjects,
  teams,
  users,
} from "../schema";
import { slugify } from "./utils";

export function initTeams(
  db: DrizzleD1Database<typeof schema>,
  tbl: Database,
  dataSealPass: string,
) {
  return {
    createTeamByPersonalTeam: async function (
      name: string,
      personalTeamId: string,
      inviteEmails: string[],
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
                password: dataSealPass,
                ttl: 0,
              },
            ),
          })),
        );
        const { sql: invitesSql, params: invitesParams } = db
          .insert(teamInvites)
          .values(sealedInvites)
          .toSQL();
        batch.push(tbl.prepare(invitesSql).bind(invitesParams));
      }
      await tbl.batch(batch);
      return { team, invites };
    },

    teamBySlug: async function (slug: string) {
      const team = await db
        .select()
        .from(teams)
        .where(eq(teams.slug, slug))
        .get();
      return team;
    },

    teamById: async function (id: string) {
      return db.select().from(teams).where(eq(teams.id, id)).get();
    },

    teamsByMemberId: async function (memberId: string) {
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
          >(),
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
    },

    userTeamsForTeamId: async function (teamId: string) {
      const res = await db
        .select({ teams, users, teamMemberships })
        .from(users)
        .innerJoin(
          teamMemberships,
          eq(users.teamId, teamMemberships.memberTeamId),
        )
        .innerJoin(teams, eq(users.teamId, teams.id))
        .where(eq(teamMemberships.teamId, teamId))
        .orderBy(teams.name)
        .all();
      return res.map((r) => ({
        address: r.users.address,
        personalTeam: r.teams,
        membership: r.teamMemberships,
      }));
    },

    isAuthorizedForTeam: async function (memberTeamId: string, teamId: string) {
      const membership = await db
        .select()
        .from(teamMemberships)
        .where(
          and(
            eq(teamMemberships.teamId, teamId),
            eq(teamMemberships.memberTeamId, memberTeamId),
          ),
        )
        .get();
      return membership ? membership : false;
    },

    toggleAdmin: async function (teamId: string, memberId: string) {
      const res = await db
        .select({ isOwner: teamMemberships.isOwner })
        .from(teamMemberships)
        .where(
          and(
            eq(teamMemberships.teamId, teamId),
            eq(teamMemberships.memberTeamId, memberId),
          ),
        )
        .get();
      if (!res) {
        throw new Error("Team membership not found");
      }
      await db
        .update(teamMemberships)
        .set({ isOwner: res.isOwner ? 0 : 1 })
        .where(
          and(
            eq(teamMemberships.teamId, teamId),
            eq(teamMemberships.memberTeamId, memberId),
          ),
        )
        .run();
    },

    removeTeamMember: async function (teamId: string, memberId: string) {
      const { sql: membershipsSql, params: membershipsParams } = db
        .delete(teamMemberships)
        .where(
          and(
            eq(teamMemberships.teamId, teamId),
            eq(teamMemberships.memberTeamId, memberId),
          ),
        )
        .toSQL();
      const { sql: invitesSql, params: invitesParams } = db
        .delete(teamInvites)
        .where(eq(teamInvites.claimedByTeamId, memberId))
        .toSQL();
      const batch = [
        tbl.prepare(membershipsSql).bind(membershipsParams),
        tbl.prepare(invitesSql).bind(invitesParams),
      ];
      await tbl.batch(batch);
    },
  };
}
