import { type InferInsertModel, type InferSelectModel } from "drizzle-orm";
import {
  integer,
  primaryKey,
  sqliteTable,
  text,
  uniqueIndex,
} from "drizzle-orm/sqlite-core";
import { schema } from "../custom-types/index.js";

export const users = sqliteTable(
  "users",
  {
    address: text("address").primaryKey(),
    teamId: text("team_id").notNull(),
    sealed: text("sealed").notNull(),
  },
  (users) => ({
    teamIdIdx: uniqueIndex("teamIdIdx").on(users.teamId),
  }),
);

export const teams = sqliteTable(
  "teams",
  {
    id: text("id").primaryKey(),
    name: text("name").notNull(),
    slug: text("slug").notNull(),
    personal: integer("personal").notNull(),
    createdAt: text("created_at"),
    updatedAt: text("updated_at"),
  },
  (teams) => ({
    nameIdx: uniqueIndex("nameIdx").on(teams.name),
    slugIdx: uniqueIndex("slugIdx").on(teams.slug),
  }),
);

export const teamMemberships = sqliteTable(
  "team_memberships",
  {
    memberTeamId: text("member_team_id").notNull(),
    teamId: text("team_id").notNull(),
    isOwner: integer("is_owner").notNull(),
    joinedAt: text("joined_at").notNull(),
  },
  (userTeams) => {
    return {
      memberTeamIdx: uniqueIndex("memberTeamIdx").on(
        userTeams.memberTeamId,
        userTeams.teamId,
      ),
    };
  },
);

export const projects = sqliteTable("projects", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  slug: text("slug").notNull(),
  description: text("description").notNull(),
  nativeMode: integer("native_mode"),
  createdAt: text("created_at"),
  updatedAt: text("updated_at"),
});

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
        teamProjects.projectId,
      ),
    };
  },
);

export const defs = sqliteTable("tables", {
  id: text("id").primaryKey(),
  slug: text("slug").notNull(),
  name: text("name").notNull(),
  description: text("description").notNull(),
  schema: schema("schema").notNull(),
  createdAt: text("created_at"),
  updatedAt: text("updated_at"),
});

export const projectDefs = sqliteTable(
  "project_tables",
  {
    projectId: text("project_id").notNull(),
    defId: text("table_id").notNull(),
  },
  (projectDefs) => {
    return {
      projectTablesIdx: uniqueIndex("projectTablesIdx").on(
        projectDefs.projectId,
        projectDefs.defId,
      ),
    };
  },
);

export const environments = sqliteTable(
  "environments",
  {
    id: text("id").primaryKey(),
    projectId: text("project_id").notNull(),
    name: text("name").notNull(),
    slug: text("slug").notNull(),
    createdAt: text("created_at"),
    updatedAt: text("updated_at"),
  },
  (environments) => {
    return {
      projectEnvIdx: uniqueIndex("projectEnvIdx").on(
        environments.projectId,
        environments.slug,
      ),
    };
  },
);

export const deployments = sqliteTable(
  "deployments",
  {
    defId: text("table_id").notNull(),
    environmentId: text("environment_id").notNull(),
    tableName: text("table_name").notNull(),
    chainId: integer("chain_id").notNull(),
    tableId: text("token_id").notNull(),
    blockNumber: integer("block_number"),
    txnHash: text("txn_hash"),
    createdAt: text("created_at").notNull(),
  },
  (deployments) => {
    return {
      pk: primaryKey(deployments.defId, deployments.environmentId),
    };
  },
);

// export const migrations = sqliteTable("migrations", {
//   id: text("id").primaryKey(),
//   environmentId: text("environment_id").notNull(),
//   timestamp: integer("timestamp").notNull(),
// });

// export const migrationLog = sqliteTable("migration_log", {
//   id: text("id").primaryKey(),
//   tableInstanceId: text("table_instance_id").notNull(),
//   migrationId: text("migration_id").notNull(),
//   block: integer("deployed_at").notNull(),
//   deployedBy: text("deployed_by").notNull(), // Address
//   transactionHash: text("transaction_hash").notNull(),
//   mutation: text("mutation").notNull()
// });

export const teamInvites = sqliteTable("team_invites", {
  id: text("id").primaryKey(),
  teamId: text("team_id").notNull(),
  sealed: text("sealed").notNull(),
  inviterTeamId: text("inviter_team_id").notNull(),
  createdAt: text("created_at").notNull(),
  claimedByTeamId: text("claimed_by_team_id"),
  claimedAt: text("claimed_at"),
});

export type Def = InferSelectModel<typeof defs>;
export type NewDef = InferInsertModel<typeof defs>;

export type UserSealed = InferSelectModel<typeof users>;
export type NewUserSealed = InferInsertModel<typeof users>;

export type User = Omit<UserSealed, "sealed"> & { email?: string };
export type NewUser = Omit<NewUserSealed, "sealed"> & {
  email?: string;
};

export type Team = InferSelectModel<typeof teams>;
export type NewTeam = InferInsertModel<typeof teams>;

export type TeamMembership = InferSelectModel<typeof teamMemberships>;
export type NewTeamMembership = InferInsertModel<typeof teamMemberships>;

export type Project = InferSelectModel<typeof projects>;
export type NewProject = InferInsertModel<typeof projects>;

export type Environment = InferSelectModel<typeof environments>;
export type NewEnvironment = InferInsertModel<typeof environments>;

export type Deployment = InferSelectModel<typeof deployments>;
export type NewDeployment = InferInsertModel<typeof deployments>;

// export type Migration = InferSelectModel<typeof migrations>;
// export type NewMigration = InferInsertModel<typeof migrations>;

// export type MigrationLog = InferSelectModel<typeof migrationLog>;
// export type NewMigrationLog = InferInsertModel<typeof migrationLog>;

export type TeamProject = InferSelectModel<typeof teamProjects>;
export type NewTeamProject = InferInsertModel<typeof teamProjects>;

export type TeamInviteSealed = InferSelectModel<typeof teamInvites>;
export type NewTeamInviteSealed = InferInsertModel<typeof teamInvites>;
export type TeamInvite = Omit<TeamInviteSealed, "sealed"> & { email: string };
export type NewTeamInvite = Omit<NewTeamInviteSealed, "sealed"> & {
  email: string;
};
