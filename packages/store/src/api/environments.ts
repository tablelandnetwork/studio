import { Database } from "@tableland/sdk";
import { randomUUID } from "crypto";
import { eq } from "drizzle-orm";
import { DrizzleD1Database } from "drizzle-orm/d1";
import * as schema from "../schema";
import { Environment, environments } from "../schema";

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
      const environment = {
        id,
        projectId,
        name,
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
