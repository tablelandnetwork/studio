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
    orgId: text("team_id").notNull(),
    sealed: text("sealed").notNull(),
  },
  (users) => ({
    orgIdIdx: uniqueIndex("teamIdIdx").on(users.orgId),
  }),
);

export const orgs = sqliteTable(
  "teams",
  {
    id: text("id").primaryKey(),
    name: text("name").notNull(),
    slug: text("slug").notNull(),
    personal: integer("personal").notNull(),
    createdAt: text("created_at"),
    updatedAt: text("updated_at"),
  },
  (orgs) => ({
    nameIdx: uniqueIndex("nameIdx").on(orgs.name),
    slugIdx: uniqueIndex("slugIdx").on(orgs.slug),
  }),
);

export const orgMemberships = sqliteTable(
  "team_memberships",
  {
    memberOrgId: text("member_team_id").notNull(),
    orgId: text("team_id").notNull(),
    isOwner: integer("is_owner").notNull(),
    joinedAt: text("joined_at").notNull(),
  },
  (orgMemberships) => {
    return {
      memberOrgIdx: uniqueIndex("memberTeamIdx").on(
        orgMemberships.memberOrgId,
        orgMemberships.orgId,
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

export const orgProjects = sqliteTable(
  "team_projects",
  {
    orgId: text("team_id").notNull(),
    projectId: text("project_id").notNull(),
    isOwner: integer("is_owner").notNull(),
  },
  (orgProjects) => {
    return {
      orgProjectIdx: uniqueIndex("teamProjectIdx").on(
        orgProjects.orgId,
        orgProjects.projectId,
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

export const orgInvites = sqliteTable("team_invites", {
  id: text("id").primaryKey(),
  orgId: text("team_id").notNull(),
  sealed: text("sealed").notNull(),
  inviterOrgId: text("inviter_team_id").notNull(),
  createdAt: text("created_at").notNull(),
  claimedByOrgId: text("claimed_by_team_id"),
  claimedAt: text("claimed_at"),
});

export type Def = InferSelectModel<typeof defs>;
export type NewDef = InferInsertModel<typeof defs>;

export type UserSealed = InferSelectModel<typeof users>;
export type NewUserSealed = InferInsertModel<typeof users>;

export type User = Omit<UserSealed, "sealed"> & {
  email?: string;
  teamId?: string; // TODO: remove this after running the migration for a while.
};
export type NewUser = Omit<NewUserSealed, "sealed"> & {
  email?: string;
};

export type Org = InferSelectModel<typeof orgs>;
export type NewOrg = InferInsertModel<typeof orgs>;

export type OrgMembership = InferSelectModel<typeof orgMemberships>;
export type NewOrgMembership = InferInsertModel<typeof orgMemberships>;

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

export type OrgProject = InferSelectModel<typeof orgProjects>;
export type NewOrgProject = InferInsertModel<typeof orgProjects>;

export type OrgInviteSealed = InferSelectModel<typeof orgInvites>;
export type NewOrgInviteSealed = InferInsertModel<typeof orgInvites>;
export type OrgInvite = Omit<OrgInviteSealed, "sealed"> & { email: string };
export type NewOrgInvite = Omit<NewOrgInviteSealed, "sealed"> & {
  email: string;
};
