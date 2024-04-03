export const restrictedTeamSlugs = ["api", "invite", "sql-log", "table"];

export const restrictedProjectSlugs = ["people", "settings"];

export const restrictedTableSlugs = ["settings", "deployments"];

export const allRestrictedSlugs = [
  ...restrictedTeamSlugs,
  ...restrictedProjectSlugs,
  ...restrictedTableSlugs,
];
