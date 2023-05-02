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

export const resolveTeamInvites = tablelandTable("team_invites", {
  id: text("id").primaryKey(),
  teamId: text("team_id").notNull(),
  createdAt: text("created_at").notNull(),
  claimed: integer("claimed").notNull(),
});

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

export type TeamInvite = InferModel<ReturnType<typeof resolveTeamInvites>>;
export type NewTeamInvite = InferModel<
  ReturnType<typeof resolveTeamInvites>,
  "insert"
>;
