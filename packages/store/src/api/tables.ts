import { randomUUID } from "crypto";
import { type Database } from "@tableland/sdk";
import { and, eq } from "drizzle-orm";
import { type DrizzleD1Database } from "drizzle-orm/d1";
import { type Schema } from "../custom-types/index.js";
import * as schema from "../schema/index.js";
import { slugify } from "../helpers.js";

type Table = schema.Table;
const projectTables = schema.projectTables;
const tables = schema.tables;
const teamProjects = schema.teamProjects;
const teams = schema.teams;

export function initTables(
  db: DrizzleD1Database<typeof schema>,
  tbl: Database,
) {
  return {
    nameAvailable: async function (projectId: string, name: string) {
      const res = await db
        .select()
        .from(projectTables)
        .innerJoin(tables, eq(projectTables.tableId, tables.id))
        .where(
          and(
            eq(projectTables.projectId, projectId),
            eq(tables.name, slugify(name)),
          ),
        )
        .get();
      return !res;
    },
    createTable: async function (
      projectId: string,
      name: string,
      description: string,
      schema: Schema,
    ) {
      const tableId = randomUUID();
      const slug = slugify(name);
      const { sql: tableSql, params: tableParams } = db
        .insert(tables)
        .values({ id: tableId, name, description, schema, slug })
        .toSQL();
      const { sql: projectTableSql, params: projectTableParams } = db
        .insert(projectTables)
        .values({ tableId, projectId })
        .toSQL();
      await tbl.batch([
        tbl.prepare(projectTableSql).bind(projectTableParams),
        tbl.prepare(tableSql).bind(tableParams),
      ]);
      const table: Table = { id: tableId, name, description, schema, slug };
      return table;
    },

    tablesByProjectId: async function (projectId: string) {
      const res = await db
        .select({ tables })
        .from(projectTables)
        .innerJoin(tables, eq(projectTables.tableId, tables.id))
        .where(eq(projectTables.projectId, projectId))
        .orderBy(tables.name)
        .all();
      const mapped = res.map((r) => r.tables);
      return mapped;
    },

    tableByProjectIdAndSlug: async function (projectId: string, slug: string) {
      const res = await db
        .select({ tables })
        .from(projectTables)
        .innerJoin(tables, eq(projectTables.tableId, tables.id))
        .where(
          and(eq(projectTables.projectId, projectId), eq(tables.slug, slug)),
        )
        .get();
      return res?.tables;
    },

    tableTeam: async function (tableId: string) {
      const res = await db
        .select({ teams })
        .from(tables)
        .innerJoin(projectTables, eq(tables.id, projectTables.tableId))
        .innerJoin(
          teamProjects,
          eq(projectTables.projectId, teamProjects.projectId),
        )
        .innerJoin(teams, eq(teamProjects.teamId, teams.id))
        .where(eq(tables.id, tableId))
        .orderBy(tables.name)
        .get();
      return res?.teams;
    },
  };
}
