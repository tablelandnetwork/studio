import { randomUUID } from "crypto";
import { type Database } from "@tableland/sdk";
import { and, asc, eq, inArray } from "drizzle-orm";
import { type DrizzleD1Database } from "drizzle-orm/d1";
import { sealData } from "iron-session";
import * as schema from "../schema/index.js";
import { slugify } from "../helpers.js";

type NewTeamInviteSealed = schema.NewTeamInviteSealed;
type Team = schema.Team;
type TeamInvite = schema.TeamInvite;
const projects = schema.projects;
const teamInvites = schema.teamInvites;
const teamMemberships = schema.teamMemberships;
const teamProjects = schema.teamProjects;
const teams = schema.teams;
const users = schema.users;
const projectDefs = schema.projectDefs;
const defs = schema.defs;
const environments = schema.environments;
const deployments = schema.deployments;

export function initTeams(
  db: DrizzleD1Database<typeof schema>,
  tbl: Database,
  dataSealPass: string,
) {
  return {
    nameAvailable: async function (name: string) {
      const res = await db
        .select()
        .from(teams)
        .where(eq(teams.slug, slugify(name)))
        .get();
      return !res;
    },

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
      if (invites.length) {
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

    updateTeam: async function (teamId: string, name: string) {
      const slug = slugify(name);
      await db
        .update(teams)
        .set({ name, slug })
        .where(eq(teams.id, teamId))
        .run();
      return await db.select().from(teams).where(eq(teams.id, teamId)).get();
    },

    deleteTeam: async function (teamId: string) {
      // teams
      const { sql: teamsSql, params: teamsParams } = db
        .delete(teams)
        .where(eq(teams.id, teamId))
        .toSQL();

      // teamMemberships
      const { sql: teamMembershipsSql, params: teamMembershipsParams } = db
        .delete(teamMemberships)
        .where(eq(teamMemberships.teamId, teamId))
        .toSQL();

      // users
      const { sql: usersSql, params: usersParams } = db
        .delete(users)
        .where(eq(users.teamId, teamId))
        .toSQL();

      // teamInvites
      const { sql: teamInvitesSql, params: teamInvitesParams } = db
        .delete(teamInvites)
        .where(eq(teamInvites.teamId, teamId))
        .toSQL();

      // teamProjects
      const { sql: teamProjectsSql, params: teamProjectsParams } = db
        .delete(teamProjects)
        .where(eq(teamProjects.teamId, teamId))
        .toSQL();

      const batch = [
        tbl.prepare(teamsSql).bind(teamsParams),
        tbl.prepare(teamMembershipsSql).bind(teamMembershipsParams),
        tbl.prepare(usersSql).bind(usersParams),
        tbl.prepare(teamInvitesSql).bind(teamInvitesParams),
        tbl.prepare(teamProjectsSql).bind(teamProjectsParams),
      ];

      // Get an array of project IDs for the team
      const teamProjectIds = (
        await db
          .select({ projectId: teamProjects.projectId })
          .from(teamProjects)
          .where(eq(teamProjects.teamId, teamId))
          .all()
      ).map((r) => r.projectId);

      // If the team has projects, delete them and all realated data
      if (teamProjectIds.length) {
        // projects
        const { sql: projectsSql, params: projectsParams } = db
          .delete(projects)
          .where(inArray(projects.id, teamProjectIds))
          .toSQL();

        // environments
        const { sql: environmentsSql, params: environmentsParams } = db
          .delete(environments)
          .where(inArray(environments.projectId, teamProjectIds))
          .toSQL();

        // projectDefs
        const { sql: projectDefsSql, params: projectDefsParams } = db
          .delete(projectDefs)
          .where(inArray(projectDefs.projectId, teamProjectIds))
          .toSQL();

        batch.push(tbl.prepare(projectsSql).bind(projectsParams));
        batch.push(tbl.prepare(environmentsSql).bind(environmentsParams));
        batch.push(tbl.prepare(projectDefsSql).bind(projectDefsParams));

        // Get an array of def IDs for all projects in the team
        const defIds = (
          await db
            .select({ defId: projectDefs.defId })
            .from(projectDefs)
            .where(inArray(projectDefs.projectId, teamProjectIds))
            .all()
        ).map((r) => r.defId);

        // If the team's projects have defs, delete them and all related data
        if (defIds.length) {
          // defs
          const { sql: defsSql, params: defsParams } = db
            .delete(defs)
            .where(inArray(defs.id, defIds))
            .toSQL();

          // deployments
          const { sql: deploymentsSql, params: deploymentsParams } = db
            .delete(deployments)
            .where(inArray(deployments.defId, defIds))
            .toSQL();

          batch.push(tbl.prepare(defsSql).bind(defsParams));
          batch.push(tbl.prepare(deploymentsSql).bind(deploymentsParams));
        }
      }

      await tbl.batch(batch);
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
      return await db.select().from(teams).where(eq(teams.id, id)).get();
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
              projects: Array<{
                name: string;
                description: string;
                id: string;
                slug: string;
                createdAt: string | null;
                updatedAt: string | null;
              }>;
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
      return membership ?? false;
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
