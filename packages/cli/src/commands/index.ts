import * as login from "./login.js";
import * as logout from "./logout.js";
import * as team from "./team.js";
import * as project from "./project.js";
import * as importCsv from "./import-csv.js";
import * as use from "./use.js";
import * as unuse from "./unuse.js";

export const commands = [login, logout, team, project, importCsv, unuse, use];
