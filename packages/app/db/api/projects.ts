import { randomUUID } from "crypto";
import { and, eq } from "drizzle-orm";
import { cache } from "react";
import { Project, environments } from "../schema";
import { db, projects, slugify, tbl, teamProjects, teams } from "./db";

export const createProject = cache(async function (
  teamId: string,
  name: string,
  description: string | null,
) {
  const projectId = randomUUID();
  const slug = slugify(name);
  const { sql: projectsSql, params: projectsParams } = db
    .insert(projects)
    .values({ id: projectId, name, description, slug })
    .toSQL();
  const { sql: teamProjectsSql, params: teamProjectsParams } = db
    .insert(teamProjects)
    .values({ projectId, teamId, isOwner: 1 })
    .toSQL();
  await tbl.batch([
    tbl.prepare(projectsSql).bind(projectsParams),
    tbl.prepare(teamProjectsSql).bind(teamProjectsParams),
  ]);
  const project: Project = { id: projectId, name, description, slug };
  return project;
});

export const projectsByTeamId = cache(async function (teamId: string) {
  const res = await db
    .select({ projects }) // TODO: Figure out why if we don't specify select key, projects key ends up as actual table name.
    .from(teamProjects)
    .innerJoin(projects, eq(teamProjects.projectId, projects.id))
    .where(and(eq(teamProjects.teamId, teamId), eq(teamProjects.isOwner, 1)))
    .orderBy(projects.name)
    .all();
  const mapped = res.map((r) => r.projects);
  return mapped;
});

export const projectByTeamIdAndSlug = cache(async function (
  teamId: string,
  slug: string,
) {
  const res = await db
    .select({ projects })
    .from(teamProjects)
    .innerJoin(projects, eq(teamProjects.projectId, projects.id))
    .where(and(eq(teamProjects.teamId, teamId), eq(projects.slug, slug)))
    .get();
  // TODO: Figure out how drizzle handles not found even though the return type isn't optional.
  return res.projects ? res.projects : undefined;
});

// TODO: Where does this belong?
export const projectTeamByProjectId = cache(async function (projectId: string) {
  const res = await db
    .select({ teams })
    .from(teamProjects)
    .innerJoin(teams, eq(teamProjects.teamId, teams.id))
    .where(eq(teamProjects.projectId, projectId))
    .orderBy(teams.name)
    .get();
  return res.teams;
});

export const isAuthorizedForProject = cache(async function (
  teamId: string,
  projectId: string,
) {
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
});

export const projectTeamByEnvironmentId = cache(async function (
  environmentId: string,
) {
  const projectTeam = await db
    .select({ teams })
    .from(environments)
    .innerJoin(projects, eq(environments.projectId, projects.id))
    .innerJoin(teamProjects, eq(projects.id, teamProjects.projectId))
    .innerJoin(teams, eq(teamProjects.teamId, teams.id))
    .where(eq(environments.id, environmentId))
    .get();

  return projectTeam.teams;
});
