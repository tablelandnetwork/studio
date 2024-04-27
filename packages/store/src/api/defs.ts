import { randomUUID } from "crypto";
import { type Database } from "@tableland/sdk";
import { and, eq, ne } from "drizzle-orm";
import { type DrizzleD1Database } from "drizzle-orm/d1";
import { type Schema } from "../custom-types/index.js";
import * as schema from "../schema/index.js";
import { slugify } from "../helpers.js";

type Def = schema.Def;
const projectDefs = schema.projectDefs;
const defs = schema.defs;
const teamProjects = schema.teamProjects;
const teams = schema.teams;

export function initDefs(db: DrizzleD1Database<typeof schema>, tbl: Database) {
  return {
    nameAvailable: async function (
      projectId: string,
      name: string,
      defId?: string,
    ) {
      const res = await db
        .select()
        .from(projectDefs)
        .innerJoin(defs, eq(projectDefs.defId, defs.id))
        .where(
          and(
            eq(projectDefs.projectId, projectId),
            eq(defs.name, slugify(name)),
            defId ? ne(defs.id, defId) : undefined,
          ),
        )
        .get();
      return !res;
    },
    createDef: async function (
      projectId: string,
      name: string,
      description: string,
      schema: Schema,
    ) {
      const defId = randomUUID();
      const slug = slugify(name);
      const now = new Date().toISOString();
      const def: Def = {
        id: defId,
        name,
        description,
        schema,
        slug,
        createdAt: now,
        updatedAt: now,
      };
      const { sql: defSql, params: defParams } = db
        .insert(defs)
        .values(def)
        .toSQL();
      const { sql: projectDefSql, params: projectDefParams } = db
        .insert(projectDefs)
        .values({ defId, projectId })
        .toSQL();
      await tbl.batch([
        tbl.prepare(projectDefSql).bind(projectDefParams),
        tbl.prepare(defSql).bind(defParams),
      ]);
      return def;
    },

    defsByProjectId: async function (projectId: string) {
      const res = await db
        .select({ defs })
        .from(projectDefs)
        .innerJoin(defs, eq(projectDefs.defId, defs.id))
        .where(eq(projectDefs.projectId, projectId))
        .orderBy(defs.name)
        .all();
      const mapped = res.map((r) => r.defs);
      return mapped;
    },

    defByProjectIdAndSlug: async function (projectId: string, slug: string) {
      const res = await db
        .select({ defs })
        .from(projectDefs)
        .innerJoin(defs, eq(projectDefs.defId, defs.id))
        .where(and(eq(projectDefs.projectId, projectId), eq(defs.slug, slug)))
        .get();
      return res?.defs;
    },

    defTeam: async function (defId: string) {
      const res = await db
        .select({ teams })
        .from(defs)
        .innerJoin(projectDefs, eq(defs.id, projectDefs.defId))
        .innerJoin(
          teamProjects,
          eq(projectDefs.projectId, teamProjects.projectId),
        )
        .innerJoin(teams, eq(teamProjects.teamId, teams.id))
        .where(eq(defs.id, defId))
        .orderBy(defs.name)
        .get();
      return res?.teams;
    },
  };
}
