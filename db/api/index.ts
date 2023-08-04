import * as auth from "./auth";
import * as deployments from "./deployments";
import * as environments from "./environments";
import * as invites from "./invites";
import * as projects from "./projects";
import * as tables from "./tables";
import * as teams from "./teams";

const api = {
  auth,
  invites,
  projects,
  tables,
  teams,
  environments,
  deployments,
};

export default api;
