import { randomUUID } from "crypto";
import { and, eq } from "drizzle-orm";
import { Table } from "../schema";
import { db, projectTables, slugify, tables, tbl } from "./db";

export async function createTable(
  projectId: string,
  name: string,
  description: string | null,
  schema: string
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
}

export async function tablesByProjectId(projectId: string) {
  const res = await db
    .select({ tables })
    .from(projectTables)
    .innerJoin(tables, eq(projectTables.tableId, tables.id))
    .where(and(eq(projectTables.projectId, projectId)))
    .orderBy(tables.name)
    .all();
  const mapped = res.map((r) => r.tables);
  return mapped;
}
