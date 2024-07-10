import { eq, inArray } from "drizzle-orm";
import { type DrizzleD1Database } from "drizzle-orm/d1";
import * as schema from "../schema/index.js";

const users = schema.users;
const teams = schema.teams;

export function initUsers(db: DrizzleD1Database<typeof schema>) {
  return {
    // NOTE: the users table only has the personal team, i.e. this won't return all teams for a user
    userPersonalTeam: async function (userAddress: string) {
      const user = await db
        .select({ teamId: users.teamId })
        .from(users)
        .where(eq(users.address, userAddress))
        .get();

      return user?.teamId;
    },

    usersForAddresses: async function (addresses: string[]) {
      const res = await db
        .select({
          user: users,
          team: teams,
        })
        .from(users)
        .innerJoin(teams, eq(users.teamId, teams.id))
        .where(inArray(users.address, addresses))
        .all();
      return res;
    },
  };
}
