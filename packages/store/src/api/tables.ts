import { Database } from "@tableland/sdk";
import { randomUUID } from "crypto";
import { eq } from "drizzle-orm";
import { DrizzleD1Database } from "drizzle-orm/d1";
import { Schema } from "../custom-types";
import * as schema from "../schema";
import { Table, projectTables, tables, teamProjects, teams } from "../schema";
import { slugify } from "./utils";

export function initTables(
  db: DrizzleD1Database<typeof schema>,
  tbl: Database,
) {
  return {
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
