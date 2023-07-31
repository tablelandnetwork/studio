import { randomUUID } from "crypto";
import { environments } from "../schema";
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
