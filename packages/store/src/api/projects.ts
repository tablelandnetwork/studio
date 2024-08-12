import { randomUUID } from "crypto";
import { type Database } from "@tableland/sdk";
import { and, desc, eq, inArray, isNotNull, ne } from "drizzle-orm";
import { type DrizzleD1Database } from "drizzle-orm/d1";
import * as schema from "../schema/index.js";
import { slugify } from "../helpers.js";

type Project = schema.Project;
const environments = schema.environments;
const projects = schema.projects;
const orgProjects = schema.orgProjects;
const orgs = schema.orgs;
const defs = schema.defs;
const deployments = schema.deployments;
const projectDefs = schema.projectDefs;

export function initProjects(
  db: DrizzleD1Database<typeof schema>,
  tbl: Database,
) {
  return {
    nameAvailable: async function (
      orgId: string,
      name: string,
      projectId?: string,
    ) {
      const res = await db
        .select()
        .from(projects)
        .innerJoin(orgProjects, eq(projects.id, orgProjects.projectId))
        .where(
          and(
            eq(orgProjects.orgId, orgId),
            eq(projects.slug, slugify(name)),
            projectId ? ne(projects.id, projectId) : undefined,
          ),
        )
        .get();
      return !res;
    },

    createProject: async function (
      orgId: string,
      name: string,
      description: string,
      nativeMode: boolean,
      envNames: string[],
    ) {
      const projectId = randomUUID();
      const slug = slugify(name);
      const now = new Date().toISOString();
      const project: Project = {
        id: projectId,
        name,
        description,
        slug,
        nativeMode: nativeMode ? 1 : 0,
        createdAt: now,
        updatedAt: now,
      };
      const { sql: projectsSql, params: projectsParams } = db
        .insert(projects)
        .values(project)
        .toSQL();
      const { sql: orgProjectsSql, params: orgProjectsParams } = db
        .insert(orgProjects)
        .values({ projectId, orgId, isOwner: 1 })
        .toSQL();
      const envs: schema.Environment[] = envNames.map((name) => ({
        id: randomUUID(),
        projectId,
        name,
        slug: slugify(name),
        createdAt: now,
        updatedAt: now,
      }));
      const { sql: envsSql, params: envsParams } = db
        .insert(environments)
        .values(envs)
        .toSQL();
      await tbl.batch([
        tbl.prepare(projectsSql).bind(projectsParams),
        tbl.prepare(orgProjectsSql).bind(orgProjectsParams),
        tbl.prepare(envsSql).bind(envsParams),
      ]);
      return project;
    },

    updateProject: async function (
      projectId: string,
      name?: string,
      description?: string,
      nativeMode?: boolean,
    ) {
      const now = new Date().toISOString();
      const slug = name ? slugify(name) : undefined;
      await db
        .update(projects)
        .set({
          name,
          slug,
          description,
          nativeMode: nativeMode === undefined ? undefined : nativeMode ? 1 : 0,
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
      // orgProjects
      const { sql: orgProjectsSql, params: orgProjectsParams } = db
        .delete(orgProjects)
        .where(eq(orgProjects.projectId, projectId))
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
        tbl.prepare(orgProjectsSql).bind(orgProjectsParams),
        tbl.prepare(projectsSql).bind(projectsParams),
        tbl.prepare(environmentsSql).bind(environmentsParams),
        tbl.prepare(projectDefsSql).bind(projectDefsParams),
      ];

      // Get an array of def IDs for all projects in the org
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
        .select({ org: orgs.slug, project: projects.slug })
        .from(projects)
        .innerJoin(orgProjects, eq(projects.id, orgProjects.projectId))
        .innerJoin(orgs, eq(orgProjects.orgId, orgs.id))
        .orderBy(projects.name)
        .limit(n)
        .all();
      return res;
    },

    projectByOrgAndProjectSlugs: async function (
      orgSlug: string,
      projectSlug: string,
    ) {
      const res = await db
        .select({ org: orgs, project: projects })
        .from(projects)
        .innerJoin(orgProjects, eq(projects.id, orgProjects.projectId))
        .innerJoin(orgs, eq(orgProjects.orgId, orgs.id))
        .where(and(eq(orgs.slug, orgSlug), eq(projects.slug, projectSlug)))
        .get();
      return res;
    },

    latestProjects: async function (offset: number, count: number) {
      const res = await db
        .select({ projects, orgs })
        .from(projects)
        .innerJoin(orgProjects, eq(projects.id, orgProjects.projectId))
        .innerJoin(orgs, eq(orgProjects.orgId, orgs.id))
        .where(isNotNull(projects.createdAt))
        .orderBy(desc(projects.createdAt))
        .offset(offset)
        .limit(count)
        .all();
      return res.map((r) => ({ org: r.orgs, project: r.projects }));
    },

    projectsByOrgId: async function (orgId: string) {
      const res = await db
        .select({ project: projects }) // TODO: Figure out why if we don't specify select key, projects key ends up as actual table name.
        .from(orgProjects)
        .innerJoin(projects, eq(orgProjects.projectId, projects.id))
        .where(and(eq(orgProjects.orgId, orgId), eq(orgProjects.isOwner, 1)))
        .orderBy(projects.slug)
        .all();
      const mapped = res.map((r) => r.project);
      return mapped;
    },

    projectByOrgIdAndSlug: async function (orgId: string, slug: string) {
      const res = await db
        .select({ projects })
        .from(orgProjects)
        .innerJoin(projects, eq(orgProjects.projectId, projects.id))
        .where(and(eq(orgProjects.orgId, orgId), eq(projects.slug, slug)))
        .get();
      return res?.projects;
    },

    // TODO: Where does this belong?
    projectOrgByProjectId: async function (projectId: string) {
      const res = await db
        .select({ orgs })
        .from(orgProjects)
        .innerJoin(orgs, eq(orgProjects.orgId, orgs.id))
        .where(eq(orgProjects.projectId, projectId))
        .orderBy(orgs.name)
        .get();
      return res?.orgs;
    },

    isAuthorizedForProject: async function (orgId: string, projectId: string) {
      const authorized = await db
        .select()
        .from(orgProjects)
        .where(
          and(
            eq(orgProjects.orgId, orgId),
            eq(orgProjects.projectId, projectId),
          ),
        )
        .get();
      return !!authorized;
    },

    projectOrgByEnvironmentId: async function (environmentId: string) {
      const projectOrg = await db
        .select({ orgs })
        .from(environments)
        .innerJoin(projects, eq(environments.projectId, projects.id))
        .innerJoin(orgProjects, eq(projects.id, orgProjects.projectId))
        .innerJoin(orgs, eq(orgProjects.orgId, orgs.id))
        .where(eq(environments.id, environmentId))
        .get();

      return projectOrg?.orgs;
    },
  };
}
