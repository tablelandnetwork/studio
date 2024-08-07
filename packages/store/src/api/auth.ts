import { randomUUID } from "crypto";
import { type Database } from "@tableland/sdk";
import { eq } from "drizzle-orm";
import { type DrizzleD1Database } from "drizzle-orm/d1";
import { sealData, unsealData } from "iron-session";
import type * as schema from "../schema/index.js";
import { orgMemberships, orgs, users } from "../schema/index.js";
import { slugify } from "../helpers.js";

export function auth(
  db: DrizzleD1Database<typeof schema>,
  tbl: Database,
  dataSealPass: string,
) {
  async function userAndPersonalOrgByAddress(address: string) {
    const res = await db
      .select({
        user: users,
        personalOrg: orgs,
      })
      .from(users)
      .innerJoin(orgs, eq(users.orgId, orgs.id))
      .where(eq(users.address, address))
      .get();
    if (!res) {
      return undefined;
    }
    const { sealed, ...rest } = res.user;
    const { email } = await unsealData<{ email?: string }>(sealed, {
      password: dataSealPass,
    });
    return {
      user: {
        ...rest,
        email,
      },
      personalOrg: res.personalOrg,
    };
  }

  return {
    createUserAndPersonalOrg: async function (
      address: string,
      orgName: string,
      email?: string,
    ) {
      const now = new Date().toISOString();
      const orgId = randomUUID();
      const sealed = await sealData(
        { email },
        { password: dataSealPass, ttl: 0 },
      );
      const { sql: usersSql, params: usersParams } = db
        .insert(users)
        .values({ address, orgId, sealed })
        .toSQL();
      const { sql: orgsSql, params: orgsParams } = db
        .insert(orgs)
        .values({
          id: orgId,
          personal: 1,
          name: orgName,
          slug: slugify(orgName),
          createdAt: now,
          updatedAt: now,
        })
        .toSQL();
      const { sql: orgMembershipsSql, params: orgMembershipsParams } = db
        .insert(orgMemberships)
        .values({
          memberOrgId: orgId,
          orgId,
          isOwner: 1,
          joinedAt: now,
        })
        .toSQL();
      await tbl.batch([
        tbl.prepare(usersSql).bind(usersParams),
        tbl.prepare(orgsSql).bind(orgsParams),
        tbl.prepare(orgMembershipsSql).bind(orgMembershipsParams),
      ]);
      const info = await userAndPersonalOrgByAddress(address);
      if (!info) {
        throw new Error("Failed to create user and personal org.");
      }
      return info;
    },

    userAndPersonalOrgByAddress,
  };
}
