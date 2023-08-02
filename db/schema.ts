import { InferModel } from "drizzle-orm";
import {
  integer,
  sqliteTable,
  text,
  uniqueIndex,
} from "drizzle-orm/sqlite-core";

export const users = sqliteTable(
  "users",
  {
    address: text("address").primaryKey(),
    teamId: text("team_id").notNull(),
    sealed: text("sealed").notNull(),
  },
  (users) => ({
    teamIdIdx: uniqueIndex("teamIdIdx").on(users.teamId),
  })
);

// export const usersRelations = relations(users, ({ one }) => ({
//   personalTeam: one(teams, {
//     fields: [users.teamId],
//     references: [teams.id],
//   }),
// }));

export const teams = sqliteTable(
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

// export const teamsRelations = relations(teams, ({ many }) => ({
//   teamProjects: many(teamProjects),
//   teamMemberships: many(teamMemberships),
// }));

export const teamMemberships = sqliteTable(
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

// export const teamMembershipsRelations = relations(
//   teamMemberships,
//   ({ one }) => ({
//     team: one(teams, {
//       fields: [teamMemberships.teamId],
//       references: [teams.id],
//     }),
//     memberTeam: one(teams, {
//       fields: [teamMemberships.memberTeamId],
//       references: [teams.id],
//     }),
//   })
// );

export const projects = sqliteTable("projects", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  slug: text("slug").notNull(),
  description: text("description"),
});

// export const projectsRelations = relations(projects, ({ many }) => ({
//   teamProjects: many(teamProjects),
// }));

export const teamProjects = sqliteTable(
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

// export const teamProjectsRelations = relations(teamProjects, ({ one }) => ({
//   project: one(projects, {
//     fields: [teamProjects.projectId],
//     references: [projects.id],
//   }),
//   team: one(teams, {
//     fields: [teamProjects.teamId],
//     references: [teams.id],
//   }),
// }));

export const tables = sqliteTable("tables", {
  id: text("id").primaryKey(),
  slug: text("slug").notNull(),
  name: text("name").notNull(),
  description: text("description"),
  schema: text("schema").notNull(),
});

export const projectTables = sqliteTable(
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

export type Table = InferModel<typeof tables>;
export type NewTable = InferModel<typeof tables, "insert">;

export const teamInvites = sqliteTable("team_invites", {
  id: text("id").primaryKey(),
  teamId: text("team_id").notNull(),
  sealed: text("sealed").notNull(),
  inviterTeamId: text("inviter_team_id").notNull(),
  createdAt: text("created_at").notNull(),
  claimedByTeamId: text("claimed_by_team_id"),
  claimedAt: text("claimed_at"),
});

export type UserSealed = InferModel<typeof users>;
export type NewUserSealed = InferModel<typeof users, "insert">;

export type User = Omit<UserSealed, "sealed"> & { email?: string };
export type NewUser = Omit<NewUserSealed, "sealed"> & {
  email?: string;
};

export type Team = InferModel<typeof teams>;
export type NewTeam = InferModel<typeof teams, "insert">;

export type TeamMembership = InferModel<typeof teamMemberships>;
export type NewTeamMembership = InferModel<typeof teamMemberships, "insert">;

export type Project = InferModel<typeof projects>;
export type NewProject = InferModel<typeof projects, "insert">;

export type TeamProject = InferModel<typeof teamProjects>;
export type NewTeamProject = InferModel<typeof teamProjects, "insert">;

export type TeamInviteSealed = InferModel<typeof teamInvites>;
export type NewTeamInviteSealed = InferModel<typeof teamInvites, "insert">;
export type TeamInvite = Omit<TeamInviteSealed, "sealed"> & { email: string };
export type NewTeamInvite = Omit<NewTeamInviteSealed, "sealed"> & {
  email: string;
};
