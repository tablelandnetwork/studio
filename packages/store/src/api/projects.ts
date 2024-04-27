import { randomUUID } from "crypto";
import { type Database } from "@tableland/sdk";
import { and, desc, eq, inArray, isNotNull, ne } from "drizzle-orm";
import { type DrizzleD1Database } from "drizzle-orm/d1";
import * as schema from "../schema/index.js";
import { slugify } from "../helpers.js";

type Project = schema.Project;
const environments = schema.environments;
const projects = schema.projects;
const teamProjects = schema.teamProjects;
const teams = schema.teams;
const defs = schema.defs;
const deployments = schema.deployments;
const projectDefs = schema.projectDefs;

export function initProjects(
  db: DrizzleD1Database<typeof schema>,
  tbl: Database,
) {
  return {
    nameAvailable: async function (
      teamId: string,
      name: string,
      projectId?: string,
    ) {
      const res = await db
        .select()
        .from(projects)
        .innerJoin(teamProjects, eq(projects.id, teamProjects.projectId))
        .where(
          and(
            eq(teamProjects.teamId, teamId),
            eq(projects.slug, slugify(name)),
            projectId ? ne(projects.id, projectId) : undefined,
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
      const now = new Date().toISOString();
      const project: Project = {
        id: projectId,
        name,
        description,
        slug,
        createdAt: now,
        updatedAt: now,
      };
      const { sql: projectsSql, params: projectsParams } = db
        .insert(projects)
        .values(project)
        .toSQL();
      const { sql: teamProjectsSql, params: teamProjectsParams } = db
        .insert(teamProjects)
        .values({ projectId, teamId, isOwner: 1 })
        .toSQL();
      await tbl.batch([
        tbl.prepare(projectsSql).bind(projectsParams),
        tbl.prepare(teamProjectsSql).bind(teamProjectsParams),
      ]);
      return project;
    },

    updateProject: async function (
      projectId: string,
      name?: string,
      description?: string,
    ) {
      const now = new Date().toISOString();
      const slug = name ? slugify(name) : undefined;
      await db
        .update(projects)
        .set({
          name,
          slug,
          description,
          updatedAt: now,
        })
        .where(eq(projects.id, projectId))
        .execute();
      return await db
        .select()
        .from(projects)
        .where(eq(projects.id, projectId))
        .get();
    },

    deleteProject: async function (projectId: string) {
      // teamProjects
      const { sql: teamProjectsSql, params: teamProjectsParams } = db
        .delete(teamProjects)
        .where(eq(teamProjects.projectId, projectId))
        .toSQL();

      // projects
      const { sql: projectsSql, params: projectsParams } = db
        .delete(projects)
        .where(eq(projects.id, projectId))
        .toSQL();

      // environments
      const { sql: environmentsSql, params: environmentsParams } = db
        .delete(environments)
        .where(eq(environments.projectId, projectId))
        .toSQL();

      // projectDefs
      const { sql: projectDefsSql, params: projectDefsParams } = db
        .delete(projectDefs)
        .where(eq(projectDefs.projectId, projectId))
        .toSQL();

      const batch = [
        tbl.prepare(teamProjectsSql).bind(teamProjectsParams),
        tbl.prepare(projectsSql).bind(projectsParams),
        tbl.prepare(environmentsSql).bind(environmentsParams),
        tbl.prepare(projectDefsSql).bind(projectDefsParams),
      ];

      // Get an array of def IDs for all projects in the team
      const defIds = (
        await db
          .select({ defId: projectDefs.defId })
          .from(projectDefs)
          .where(eq(projectDefs.projectId, projectId))
          .all()
      ).map((r) => r.defId);

      // If the project has defs, delete them and all related data
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

      await tbl.batch(batch);
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
        .select({ project: projects }) // TODO: Figure out why if we don't specify select key, projects key ends up as actual table name.
        .from(teamProjects)
        .innerJoin(projects, eq(teamProjects.projectId, projects.id))
        .where(
          and(eq(teamProjects.teamId, teamId), eq(teamProjects.isOwner, 1)),
        )
        .orderBy(projects.name)
        .all();
      const mapped = res.map((r) => r.project);
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
