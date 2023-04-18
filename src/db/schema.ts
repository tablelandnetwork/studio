import { integer, text, uniqueIndex } from "drizzle-orm/sqlite-core";
import { InferModel } from "drizzle-orm";
import { tablelandTable } from "@/lib/drizzle";

export const resolveUsers = tablelandTable(
  "users",
  {
    id: text("id").primaryKey(),
    address: text("address").notNull(),
  },
  (users) => ({
    addressIdx: uniqueIndex("addressIdx").on(users.address),
  })
);

export const resolveTeams = tablelandTable(
  "teams",
  {
    id: text("id").primaryKey(),
    name: text("name"),
    personal: integer("personal").notNull(),
  },
  (teams) => ({
    nameIdx: uniqueIndex("nameIdx").on(teams.name),
  })
);

export const resolveUserTeams = tablelandTable(
  "user_teams",
  {
    userId: text("user_id").notNull(),
    teamId: text("team_id").notNull(),
  },
  (userTeams) => {
    return {
      userTeamIdx: uniqueIndex("userTeamIdx").on(
        userTeams.userId,
        userTeams.teamId
      ),
    };
  }
);

export const resolveProjects = tablelandTable("projects", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
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

export type User = InferModel<ReturnType<typeof resolveUsers>>;
export type NewUser = InferModel<ReturnType<typeof resolveUsers>, "insert">;

export type Team = InferModel<ReturnType<typeof resolveTeams>>;
export type NewTeam = InferModel<ReturnType<typeof resolveTeams>, "insert">;

export type UserTeam = InferModel<ReturnType<typeof resolveUserTeams>>;
export type NewUserTeam = InferModel<
  ReturnType<typeof resolveUserTeams>,
  "insert"
>;
