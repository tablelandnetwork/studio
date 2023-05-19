import { InferModel } from "drizzle-orm";
import { integer, text, uniqueIndex } from "drizzle-orm/sqlite-core";

import { tablelandTable } from "@/lib/drizzle";

export const resolveUsers = tablelandTable(
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

export const resolveDeployments = tablelandTable("deployment", {
  id: text("id").primaryKey(),
  projectId: text("project_id").notNull(),
  block: text("deployed_at").notNull(),
  deployedBy: text("deployed_by").notNull(), // Address
  chain: text("deployed_to").notNull(),
  transactionHash: text("transaction_hash").notNull(),
});

export type Deployment = InferModel<ReturnType<typeof resolveDeployments>>;
export type NewDeployment = InferModel<
  ReturnType<typeof resolveDeployments>,
  "insert"
>;

export const resolveDeploymentTables = tablelandTable("deployment_tables", {
  deploymentId: text("deployment_id").notNull(),
  tableId: text("table_id").notNull(), // Table's studio ID
  tableName: text("table_name").notNull(), // Table's tableland prefix + chain + id.
  schema: text("schema").notNull(), // The schema of the table at the time of deployment.
});

export type DeploymentTables = InferModel<
  ReturnType<typeof resolveDeploymentTables>
>;
export type NewDeploymentTables = InferModel<
  ReturnType<typeof resolveDeploymentTables>,
  "insert"
>;

export const resolveTeamInvites = tablelandTable("team_invites", {
  id: text("id").primaryKey(),
  teamId: text("team_id").notNull(),
  sealed: text("sealed").notNull(),
  inviterTeamId: text("inviter_team_id").notNull(),
  createdAt: text("created_at").notNull(),
  claimedByTeamId: text("claimed_by_team_id"),
  claimedAt: text("claimed_at"),
});

export type UserSealed = InferModel<ReturnType<typeof resolveUsers>>;
export type NewUserSealed = InferModel<
  ReturnType<typeof resolveUsers>,
  "insert"
>;

export type User = Omit<UserSealed, "sealed"> & { email?: string };
export type NewUser = Omit<NewUserSealed, "sealed"> & {
  email?: string;
};

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

export type TeamInviteSealed = InferModel<
  ReturnType<typeof resolveTeamInvites>
>;
export type NewTeamInviteSealed = InferModel<
  ReturnType<typeof resolveTeamInvites>,
  "insert"
>;
export type TeamInvite = Omit<TeamInviteSealed, "sealed"> & { email: string };
export type NewTeamInvite = Omit<NewTeamInviteSealed, "sealed"> & {
  email: string;
};
