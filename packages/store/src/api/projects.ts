import { randomUUID } from "crypto";
import { type Database } from "@tableland/sdk";
import { and, desc, eq, isNotNull } from "drizzle-orm";
import { type DrizzleD1Database } from "drizzle-orm/d1";
import * as schema from "../schema/index.js";
import { slugify } from "../helpers.js";

type Project = schema.Project;
const environments = schema.environments;
const projects = schema.projects;
const teamProjects = schema.teamProjects;
const teams = schema.teams;

export function initProjects(
  db: DrizzleD1Database<typeof schema>,
  tbl: Database,
) {
  return {
    nameAvailable: async function (teamId: string, name: string) {
      const res = await db
        .select()
        .from(projects)
        .innerJoin(teamProjects, eq(projects.id, teamProjects.projectId))
        .where(
          and(
            eq(teamProjects.teamId, teamId),
            eq(projects.slug, slugify(name)),
          ),
        )
        .get();
      return !res;
    },

    createProject: async function (
      teamId: string,
      name: string,
      description: string,
    ) {
      const projectId = randomUUID();
      const slug = slugify(name);
      const now = new Date();
      const { sql: projectsSql, params: projectsParams } = db
        .insert(projects)
        .values({
          id: projectId,
          name,
          description,
          slug,
          createdAt: now.toISOString(),
          updatedAt: now.toISOString(),
        })
        .toSQL();
      const { sql: teamProjectsSql, params: teamProjectsParams } = db
        .insert(teamProjects)
        .values({ projectId, teamId, isOwner: 1 })
        .toSQL();
      await tbl.batch([
        tbl.prepare(projectsSql).bind(projectsParams),
        tbl.prepare(teamProjectsSql).bind(teamProjectsParams),
      ]);
      const project: Project = {
        id: projectId,
        name,
        description,
        slug,
        createdAt: now.toISOString(),
        updatedAt: now.toISOString(),
      };
      return project;
    },

    firstNProjectSlugs: async function (n: number) {
      const res = await db
        .select({ team: teams.slug, project: projects.slug })
        .from(projects)
        .innerJoin(teamProjects, eq(projects.id, teamProjects.projectId))
        .innerJoin(teams, eq(teamProjects.teamId, teams.id))
        .orderBy(projects.name)
        .limit(n)
        .all();
      return res;
    },

    projectByTeamAndProjectSlugs: async function (
      teamSlug: string,
      projectSlug: string,
    ) {
      const res = await db
        .select({ team: teams, project: projects })
        .from(projects)
        .innerJoin(teamProjects, eq(projects.id, teamProjects.projectId))
        .innerJoin(teams, eq(teamProjects.teamId, teams.id))
        .where(and(eq(teams.slug, teamSlug), eq(projects.slug, projectSlug)))
        .get();
      return res;
    },

    latestProjects: async function (offset: number, count: number) {
      const res = await db
        .select({ projects, teams })
        .from(projects)
        .innerJoin(teamProjects, eq(projects.id, teamProjects.projectId))
        .innerJoin(teams, eq(teamProjects.teamId, teams.id))
        .where(isNotNull(projects.createdAt))
        .orderBy(desc(projects.createdAt))
        .offset(offset)
        .limit(count)
        .all();
      return res.map((r) => ({ team: r.teams, project: r.projects }));
    },

    projectsByTeamId: async function (teamId: string) {
      const res = await db
        .select({ projects }) // TODO: Figure out why if we don't specify select key, projects key ends up as actual table name.
        .from(teamProjects)
        .innerJoin(projects, eq(teamProjects.projectId, projects.id))
        .where(
          and(eq(teamProjects.teamId, teamId), eq(teamProjects.isOwner, 1)),
        )
        .orderBy(projects.name)
        .all();
      const mapped = res.map((r) => r.projects);
      return mapped;
    },

    projectByTeamIdAndSlug: async function (teamId: string, slug: string) {
      const res = await db
        .select({ projects })
        .from(teamProjects)
        .innerJoin(projects, eq(teamProjects.projectId, projects.id))
        .where(and(eq(teamProjects.teamId, teamId), eq(projects.slug, slug)))
        .get();
      return res?.projects;
    },

    // TODO: Where does this belong?
    projectTeamByProjectId: async function (projectId: string) {
      const res = await db
        .select({ teams })
        .from(teamProjects)
        .innerJoin(teams, eq(teamProjects.teamId, teams.id))
        .where(eq(teamProjects.projectId, projectId))
        .orderBy(teams.name)
        .get();
      return res?.teams;
    },

    isAuthorizedForProject: async function (teamId: string, projectId: string) {
      const authorized = await db
        .select()
        .from(teamProjects)
        .where(
          and(
            eq(teamProjects.teamId, teamId),
            eq(teamProjects.projectId, projectId),
          ),
        )
        .get();
      return !!authorized;
    },

    projectTeamByEnvironmentId: async function (environmentId: string) {
      const projectTeam = await db
        .select({ teams })
        .from(environments)
        .innerJoin(projects, eq(environments.projectId, projects.id))
        .innerJoin(teamProjects, eq(projects.id, teamProjects.projectId))
        .innerJoin(teams, eq(teamProjects.teamId, teams.id))
        .where(eq(environments.id, environmentId))
        .get();

      return projectTeam?.teams;
    },
  };
}
