import { randomUUID } from "crypto";
import { type Database } from "@tableland/sdk";
import { eq } from "drizzle-orm";
import { type DrizzleD1Database } from "drizzle-orm/d1";
import * as schema from "../schema/index.js";
import { slugify } from "../helpers.js";

type Environment = schema.Environment;
const environments = schema.environments;

export function initEnvironments(
  db: DrizzleD1Database<typeof schema>,
  tbl: Database,
) {
  return {
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
      const { sql, params } = db
        .insert(environments)
        .values(environment)
        .toSQL();
      await tbl.prepare(sql).bind(params).run();
      return environment;
    },

    getEnvironmentsByProjectId: async function (
      projectId: string,
    ): Promise<Environment[]> {
      const { sql, params } = db
        .select()
        .from(environments)
        .where(eq(environments.projectId, projectId))
        .toSQL();

      const res = await tbl.prepare(sql).bind(params).all();
      return res.results as Environment[];
    },
  };
}
