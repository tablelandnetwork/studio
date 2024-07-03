export const restrictedTeamSlugs = [
  "api",
  "invite",
  "sql-log",
  "table",
  "def",
  "dash",
  "dashboard",
];

export const restrictedProjectSlugs = ["people", "settings"];

export const restrictedDefSlugs = ["settings", "tables", "console"];

export const restrictedEnvSlugs = ["settings"];

export const allRestrictedSlugs = [
  ...restrictedTeamSlugs,
  ...restrictedProjectSlugs,
  ...restrictedDefSlugs,
  ...restrictedEnvSlugs,
];
