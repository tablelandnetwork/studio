import { InferModel } from "drizzle-orm";
import { integer, text, uniqueIndex } from "drizzle-orm/sqlite-core";

import { tablelandTable } from "@/lib/drizzle";

export const users = tablelandTable(
  "users",
  {
    address: text("address").primaryKey(),
    teamId: text("team_id").notNull(),
    sealed: text("sealed").notNull(),
  },
  (users) => ({
    teamIdIdx: uniqueIndex("teamIdIdx").on(users.teamId),
  })
)(process.env.CHAIN);

export const teams = tablelandTable(
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
)(process.env.CHAIN);

export const teamMemberships = tablelandTable(
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
)(process.env.CHAIN);

export const projects = tablelandTable("projects", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  slug: text("slug").notNull(),
  description: text("description"),
})(process.env.CHAIN);

export const teamProjects = tablelandTable(
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
)(process.env.CHAIN);

export const tables = tablelandTable("tables", {
  id: text("id").primaryKey(),
  slug: text("slug").notNull(),
  name: text("name").notNull(),
  description: text("description"),
  schema: text("schema").notNull(),
})(process.env.CHAIN);

export const projectTables = tablelandTable(
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
)(process.env.CHAIN);

export const environments = tablelandTable("environments", {
  id: text("id").primaryKey(),
  projectId: text("project_id").notNull(),
  title: text("title").notNull(),
})(process.env.CHAIN);

export const deployments = tablelandTable("deployments", {
  id: text("id").primaryKey(),
  tableId: text("table_id").notNull(),
  environmentId: text("environment_id").notNull(),
  tableUuName: text("table_uu_name"),
  chain: integer("chain").notNull(),
  schema: text("schema").notNull(),
})(process.env.CHAIN);

// export const migrations = tablelandTable("migrations", {
//   id: text("id").primaryKey(),
//   environmentId: text("environment_id").notNull(),
//   timestamp: integer("timestamp").notNull(),
// })(process.env.CHAIN);

// export const migrationLog = tablelandTable("migration_log", {
//   id: text("id").primaryKey(),
//   tableInstanceId: text("table_instance_id").notNull(),
//   migrationId: text("migration_id").notNull(),
//   block: integer("deployed_at").notNull(),
//   deployedBy: text("deployed_by").notNull(), // Address
//   transactionHash: text("transaction_hash").notNull(),
//   mutation: text("mutation").notNull()
// })(process.env.CHAIN);

export type Table = InferModel<typeof tables>;
export type NewTable = InferModel<typeof tables, "insert">;

export const teamInvites = tablelandTable("team_invites", {
  id: text("id").primaryKey(),
  teamId: text("team_id").notNull(),
  sealed: text("sealed").notNull(),
  inviterTeamId: text("inviter_team_id").notNull(),
  createdAt: text("created_at").notNull(),
  claimedByTeamId: text("claimed_by_team_id"),
  claimedAt: text("claimed_at"),
})(process.env.CHAIN);

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

export type Environment = InferModel<typeof environments>;
export type NewEnvironment = InferModel<typeof environments, "insert">;

export type Deployments = InferModel<typeof deployments>;
export type NewDeployments = InferModel<typeof deployments, "insert">;

// export type Migration = InferModel<typeof migrations>;
// export type NewMigration = InferModel<typeof migrations, "insert">;

// export type MigrationLog = InferModel<typeof migrationLog>;
// export type NewMigrationLog = InferModel<typeof migrationLog, "insert">;

export type TeamProject = InferModel<typeof teamProjects>;
export type NewTeamProject = InferModel<typeof teamProjects, "insert">;

export type TeamInviteSealed = InferModel<typeof teamInvites>;
export type NewTeamInviteSealed = InferModel<typeof teamInvites, "insert">;
export type TeamInvite = Omit<TeamInviteSealed, "sealed"> & { email: string };
export type NewTeamInvite = Omit<NewTeamInviteSealed, "sealed"> & {
  email: string;
};
