import { randomUUID } from "crypto";
import { type Database } from "@tableland/sdk";
import { eq, and, ne } from "drizzle-orm";
import { type DrizzleD1Database } from "drizzle-orm/d1";
import * as schema from "../schema/index.js";
import { slugify } from "../helpers.js";

type Environment = schema.Environment;
const environments = schema.environments;
const deployments = schema.deployments;
const teamProjects = schema.teamProjects;
const teams = schema.teams;

export function initEnvironments(
  db: DrizzleD1Database<typeof schema>,
  tbl: Database,
) {
  return {
    nameAvailable: async function (
      projectId: string,
      name: string,
      envId?: string,
    ) {
      const res = await db
        .select()
        .from(environments)
        .where(
          and(
            eq(environments.projectId, projectId),
            eq(environments.slug, slugify(name)),
            envId ? ne(environments.id, envId) : undefined,
          ),
        )
        .get();
      return !res;
    },

    createEnvironment: async function ({
      projectId,
      name,
    }: {
      projectId: string;
      name: string;
    }) {
      const id = randomUUID();
      const now = new Date().toISOString();
      const environment: Environment = {
        id,
        projectId,
        name,
        slug: slugify(name),
        createdAt: now,
        updatedAt: now,
      };
      await db.insert(environments).values(environment);
      return environment;
    },

    updateEnvironment: async function ({
      id,
      name,
    }: {
      id: string;
      name: string;
    }) {
      const updatedAt = new Date().toISOString();
      await db
        .update(environments)
        .set({ name, slug: slugify(name), updatedAt })
        .where(eq(environments.id, id))
        .run();
      return await db
        .select()
        .from(environments)
        .where(eq(environments.id, id))
        .get();
    },

    deleteEnvironment: async function (id: string) {
      const { sql: envsSql, params: envsParams } = db
        .delete(environments)
        .where(eq(environments.id, id))
        .toSQL();
      const { sql: deploymentsSql, params: deploymentsParams } = db
        .delete(deployments)
        .where(eq(deployments.environmentId, id))
        .toSQL();
      const batch = [
        tbl.prepare(envsSql).bind(envsParams),
        tbl.prepare(deploymentsSql).bind(deploymentsParams),
      ];
      await tbl.batch(batch);
    },

    environmentTeam: async function (id: string) {
      const res = await db
        .select({ teams })
        .from(environments)
        .innerJoin(
          teamProjects,
          eq(environments.projectId, teamProjects.projectId),
        )
        .innerJoin(teams, eq(teamProjects.teamId, teams.id))
        .where(eq(environments.id, id))
        .get();
      return res?.teams;
    },

    getEnvironmentsByProjectId: async function (
      projectId: string,
    ): Promise<Environment[]> {
      return await db
        .select()
        .from(environments)
        .where(eq(environments.projectId, projectId))
        .all();
    },

    environmentBySlug: async function (projectId: string, slug: string) {
      return await db
        .select()
        .from(environments)
        .where(
          and(
            eq(environments.projectId, projectId),
            eq(environments.slug, slug),
          ),
        )
        .get();
    },
  };
}
