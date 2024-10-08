import { type Database } from "@tableland/sdk";
import { drizzle } from "drizzle-orm/d1";
import * as schema from "../schema/index.js";
import { auth } from "./auth.js";
import { initDeployments } from "./deployments.js";
import { initEnvironments } from "./environments.js";
import { invites } from "./invites.js";
import { initProjects } from "./projects.js";
import { initDefs } from "./defs.js";
import { initOrgs } from "./orgs.js";
import { initUsers } from "./users.js";

export function init(tbl: Database, dataSealPass: string) {
  const db = drizzle(tbl, { logger: false, schema });
  return {
    auth: auth(db, tbl, dataSealPass),
    invites: invites(db, tbl, dataSealPass),
    projects: initProjects(db, tbl),
    defs: initDefs(db, tbl),
    orgs: initOrgs(db, tbl, dataSealPass),
    environments: initEnvironments(db, tbl),
    deployments: initDeployments(db),
    users: initUsers(db),
  };
}
