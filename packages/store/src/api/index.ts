import { Database } from "@tableland/sdk";
import { drizzle } from "drizzle-orm/d1";
import * as schema from "../schema";
import { auth } from "./auth";
import { initDeployments } from "./deployments";
import { initEnvironments } from "./environments";
import { invites } from "./invites";
import { initProjects } from "./projects";
import { initTables } from "./tables";
import { initTeams } from "./teams";

export function init(tbl: Database, dataSealPass: string) {
  const db = drizzle(tbl, { logger: false, schema });
  return {
    auth: auth(db, tbl, dataSealPass),
    invites: invites(db, tbl, dataSealPass),
    projects: initProjects(db, tbl),
    tables: initTables(db, tbl),
    teams: initTeams(db, tbl, dataSealPass),
    environments: initEnvironments(db, tbl),
    deployments: initDeployments(db, tbl),
  };
}
