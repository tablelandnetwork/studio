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
const orgProjects = schema.orgProjects;
const orgs = schema.orgs;
const deployments = schema.deployments;

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

    updateDef: async function (
      defId: string,
      name?: string,
      description?: string,
      schema?: Schema,
    ) {
      const now = new Date().toISOString();
      const slug = name ? slugify(name) : undefined;
      await db
        .update(defs)
        .set({
          name,
          slug,
          description,
          schema,
          updatedAt: now,
        })
        .where(eq(defs.id, defId))
        .execute();
      return await db.select().from(defs).where(eq(defs.id, defId)).get();
    },

    deleteDef: async function (defId: string) {
      // projectDefs
      const { sql: projectDefsSql, params: projectDefsParams } = db
        .delete(projectDefs)
        .where(eq(projectDefs.defId, defId))
        .toSQL();

      // defs
      const { sql: defsSql, params: defsParams } = db
        .delete(defs)
        .where(eq(defs.id, defId))
        .toSQL();

      // deployments
      const { sql: deploymentsSql, params: deploymentsParams } = db
        .delete(deployments)
        .where(eq(deployments.defId, defId))
        .toSQL();

      const batch = [
        tbl.prepare(projectDefsSql).bind(projectDefsParams),
        tbl.prepare(defsSql).bind(defsParams),
        tbl.prepare(deploymentsSql).bind(deploymentsParams),
      ];

      await tbl.batch(batch);
    },

    defById: async function (defId: string) {
      const res = await db
        .select({ defs })
        .from(defs)
        .where(eq(defs.id, defId))
        .get();
      return res?.defs;
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

    defOrg: async function (defId: string) {
      const res = await db
        .select({ orgs })
        .from(defs)
        .innerJoin(projectDefs, eq(defs.id, projectDefs.defId))
        .innerJoin(
          orgProjects,
          eq(projectDefs.projectId, orgProjects.projectId),
        )
        .innerJoin(orgs, eq(orgProjects.orgId, orgs.id))
        .where(eq(defs.id, defId))
        .orderBy(defs.name)
        .get();
      return res?.orgs;
    },
  };
}
