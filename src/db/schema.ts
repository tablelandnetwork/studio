import { InferModel } from "drizzle-orm";
import { integer, text, uniqueIndex } from "drizzle-orm/sqlite-core";

import { tablelandTable } from "@/lib/drizzle";

export const resolveUsers = tablelandTable(
  "users",
  {
    address: text("address").primaryKey(),
    teamId: text("team_id").notNull(),
  },
  (users) => ({
    teamIdIdx: uniqueIndex("teamIdIdx").on(users.teamId),
  })
);

export const resolveTeams = tablelandTable(
  "teams",
  {
    id: text("id").primaryKey(),
    name: text("name").notNull(),
    slug: text("slug").notNull(),
    personal: integer("personal").notNull(),
  },
  (teams) => ({
    nameIdx: uniqueIndex("nameIdx").on(teams.name),
    slugIdx: uniqueIndex("slugIdx").on(teams.slug),
  })
);

export const resolveTeamMemberships = tablelandTable(
  "team_memberships",
  {
    memberTeamId: text("member_team_id").notNull(),
    teamId: text("team_id").notNull(),
    isOwner: integer("is_owner").notNull(),
  },
  (userTeams) => {
    return {
      memberTeamIdx: uniqueIndex("memberTeamIdx").on(
        userTeams.memberTeamId,
        userTeams.teamId
      ),
    };
  }
);

export const resolveProjects = tablelandTable("projects", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  slug: text("slug").notNull(),
  description: text("description"),
});

export const resolveTeamProjects = tablelandTable(
  "team_projects",
  {
    teamId: text("team_id").notNull(),
    projectId: text("project_id").notNull(),
    isOwner: integer("is_owner").notNull(),
  },
  (teamProjects) => {
    return {
      teamProjectIdx: uniqueIndex("teamProjectIdx").on(
        teamProjects.teamId,
        teamProjects.projectId
      ),
    };
  }
);

export const resolveTables = tablelandTable("tables", {
  id: text("id").primaryKey(),
  slug: text("slug").notNull(),
  name: text("name").notNull(),
  description: text("description"),
  schema: text("schema").notNull(),
});

export const resolveProjectTables = tablelandTable(
  "project_tables",
  {
    projectId: text("project_id").notNull(),
    tableId: text("table_id").notNull(),
  },
  (projectTables) => {
    return {
      projectTablesIdx: uniqueIndex("projectTablesIdx").on(
        projectTables.projectId,
        projectTables.tableId
      ),
    };
  }
);

export type Table = InferModel<ReturnType<typeof resolveTables>>;
export type NewTable = InferModel<ReturnType<typeof resolveTables>, "insert">;

export type User = InferModel<ReturnType<typeof resolveUsers>>;
export type NewUser = InferModel<ReturnType<typeof resolveUsers>, "insert">;

export type Team = InferModel<ReturnType<typeof resolveTeams>>;
export type NewTeam = InferModel<ReturnType<typeof resolveTeams>, "insert">;

export type TeamMembership = InferModel<
  ReturnType<typeof resolveTeamMemberships>
>;
export type NewTeamMembership = InferModel<
  ReturnType<typeof resolveTeamMemberships>,
  "insert"
>;

export type Project = InferModel<ReturnType<typeof resolveProjects>>;
export type NewProject = InferModel<
  ReturnType<typeof resolveProjects>,
  "insert"
>;

export type TeamProject = InferModel<ReturnType<typeof resolveTeamProjects>>;
export type NewTeamProject = InferModel<
  ReturnType<typeof resolveTeamProjects>,
  "insert"
>;
