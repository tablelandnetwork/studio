export const restrictedOrgSlugs = [
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
  ...restrictedOrgSlugs,
  ...restrictedProjectSlugs,
  ...restrictedDefSlugs,
  ...restrictedEnvSlugs,
];
