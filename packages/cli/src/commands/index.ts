import * as deployment from "./deployment.js";
import * as importData from "./import-data.js";
import * as importTable from "./import-table.js";
import * as importTables from "./import-tables.js";
import * as init from "./init.js";
import * as login from "./login.js";
import * as logout from "./logout.js";
import * as project from "./project.js";
import * as query from "./query.js";
import * as status from "./status.js";
import * as team from "./team.js";
import * as use from "./use.js";
import * as unuse from "./unuse.js";

export const commands = [
  deployment,
  init,
  importData,
  importTable,
  importTables,
  login,
  logout,
  project,
  query,
  status,
  team,
  use,
  unuse,
];
