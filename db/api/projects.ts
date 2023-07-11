import { randomUUID } from "crypto";
import { and, eq } from "drizzle-orm";
import { Project } from "../schema";
import { db, projects, slugify, tbl, teamProjects, teams } from "./db";

export async function createProject(
  teamId: string,
  name: string,
  description: string | null
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
}

export async function projectsByTeamId(teamId: string) {
  const res = await db
    .select({ projects }) // TODO: Figure out why if we don't specify select key, projects key ends up as actual table name.
    .from(teamProjects)
    .innerJoin(projects, eq(teamProjects.projectId, projects.id))
    .where(and(eq(teamProjects.teamId, teamId), eq(teamProjects.isOwner, 1)))
    .orderBy(projects.name)
    .all();
  const mapped = res.map((r) => r.projects);
  return mapped;
}

export async function projectByTeamIdAndSlug(teamId: string, slug: string) {
  const res = await db
    .select({ projects })
    .from(teamProjects)
    .innerJoin(projects, eq(teamProjects.projectId, projects.id))
    .where(and(eq(teamProjects.teamId, teamId), eq(projects.slug, slug)))
    .get();
  return res.projects;
}

// TODO: Where does this belong?
export async function projectTeamByProjectId(projectId: string) {
  const res = await db
    .select({ teams })
    .from(teamProjects)
    .innerJoin(teams, eq(teamProjects.teamId, teams.id))
    .where(eq(teamProjects.projectId, projectId))
    .orderBy(teams.name)
    .get();
  return res.teams;
}

export async function isAuthorizedForProject(
  teamId: string,
  projectId: string
) {
  const authorized = await db
    .select()
    .from(teamProjects)
    .where(
      and(
        eq(teamProjects.teamId, teamId),
        eq(teamProjects.projectId, projectId)
      )
    )
    .get();
  return !!authorized;
}
