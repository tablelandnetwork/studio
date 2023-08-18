import { randomUUID } from "crypto";
import { eq } from "drizzle-orm";
import { Environment, environments } from "../schema";
import { db, tbl } from "./db";

interface CreateEnvironment {
  projectId: string;
  title: string;
}

export async function createEnvironment({
  projectId,
  title,
}: CreateEnvironment) {
  const id = randomUUID();
  const environment = {
    id,
    projectId,
    title,
  };
  const { sql, params } = db.insert(environments).values(environment).toSQL();
  await tbl.prepare(sql).bind(params).run();
  return environment;
}

export async function getEnvironmentsByProjectId(
  projectId: string
): Promise<Environment[]> {
  const { sql, params } = db
    .select()
    .from(environments)
    .where(eq(environments.projectId, projectId))
    .toSQL();

  const res = await tbl.prepare(sql).bind(params).all();
  return res.results as Environment[];
}
