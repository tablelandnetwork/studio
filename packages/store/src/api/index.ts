import { Database } from "@tableland/sdk";
import { drizzle } from "drizzle-orm/d1";
import * as schema from "../schema/index.js";
import { auth } from "./auth.js";
import { initDeployments } from "./deployments.js";
import { initEnvironments } from "./environments.js";
import { invites } from "./invites.js";
import { initProjects } from "./projects.js";
import { initTables } from "./tables.js";
import { initTeams } from "./teams.js";

export function init(tbl: Database, dataSealPass: string) {
  const db = drizzle(tbl, { logger: false, schema });
  return {
    auth: auth(db, tbl, dataSealPass),
    invites: invites(db, tbl, dataSealPass),
    projects: initProjects(db, tbl),
    tables: initTables(db, tbl),
    teams: initTeams(db, tbl, dataSealPass),
    environments: initEnvironments(db, tbl),
    deployments: initDeployments(db),
  };
}
