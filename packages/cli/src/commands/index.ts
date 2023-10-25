import * as login from "./login.js";
import * as logout from "./logout.js";
import * as team from "./team.js";
import * as project from "./project.js";
import * as deployment from "./deployment.js";
import * as importData from "./import-data.js";
import * as read from "./read.js";
import * as importTable from "./import-table.js";
import * as use from "./use.js";
import * as unuse from "./unuse.js";

export const commands = [
  login,
  logout,
  team,
  project,
  deployment,
  importData,
  read,
  importTable,
  use,
  unuse
];
