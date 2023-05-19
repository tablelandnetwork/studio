import { Database } from "@tableland/sdk";
import { type DrizzleD1Database } from "drizzle-orm/d1";
import { atom } from "jotai";

export const tablelandAtom = atom<Database | null>(null);

export const dbAtom = atom<DrizzleD1Database | null>(null);

export const NewDeploymentAtom = atom(null, async (get, set, deployment) => {
  const db = get(dbAtom);
  if (!db) return;
  // const newDeployment = await db.deployments.create(deployment);
  // set(tablelandAtom, newDeployment);
  return {
    slug: "",
  };
});
