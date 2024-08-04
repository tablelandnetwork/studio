import { eq, inArray } from "drizzle-orm";
import { type DrizzleD1Database } from "drizzle-orm/d1";
import * as schema from "../schema/index.js";

const users = schema.users;
const orgs = schema.orgs;

export function initUsers(db: DrizzleD1Database<typeof schema>) {
  return {
    // NOTE: the users table only has the personal org, i.e. this won't return all orgs for a user
    userPersonalOrg: async function (userAddress: string) {
      const user = await db
        .select({ orgId: users.orgId })
        .from(users)
        .where(eq(users.address, userAddress))
        .get();

      return user?.orgId;
    },

    usersForAddresses: async function (addresses: string[]) {
      const res = await db
        .select({
          user: users,
          org: orgs,
        })
        .from(users)
        .innerJoin(orgs, eq(users.orgId, orgs.id))
        .where(inArray(users.address, addresses))
        .all();
      return res;
    },

    userForAddress: async function (address: string) {
      const res = await db
        .select({
          user: users,
          org: orgs,
        })
        .from(users)
        .innerJoin(orgs, eq(users.orgId, orgs.id))
        .where(eq(users.address, address))
        .get();
      return res;
    },
  };
}
