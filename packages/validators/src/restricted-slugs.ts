export const restrictedTeamSlugs = ["api", "invite", "sql-log", "table", "def"];

export const restrictedProjectSlugs = ["people", "settings"];

export const restrictedDefSlugs = ["settings", "tables"];

export const allRestrictedSlugs = [
  ...restrictedTeamSlugs,
  ...restrictedProjectSlugs,
  ...restrictedDefSlugs,
];
