import { randomUUID } from "crypto";
import { type Database } from "@tableland/sdk";
import { eq } from "drizzle-orm";
import { type DrizzleD1Database } from "drizzle-orm/d1";
import { sealData, unsealData } from "iron-session";
import type * as schema from "../schema/index.js";
import { teamMemberships, teams, users } from "../schema/index.js";
import { slugify } from "./utils.js";

export function auth(
  db: DrizzleD1Database<typeof schema>,
  tbl: Database,
  dataSealPass: string,
) {
  async function userAndPersonalTeamByAddress(address: string) {
    const res = await db
      .select({
        user: users,
        personalTeam: teams,
      })
      .from(users)
      .innerJoin(teams, eq(users.teamId, teams.id))
      .where(eq(users.address, address))
      .get();
    if (!res) {
      return undefined;
    }
    const { sealed, ...rest } = res.user;
    const { email } = await unsealData(sealed, {
      password: dataSealPass,
    });
    return {
      user: {
        ...rest,
        email: email as string | undefined,
      },
      personalTeam: res.personalTeam,
    };
  }

  return {
    createUserAndPersonalTeam: async function (
      address: string,
      teamName: string,
      email?: string,
    ) {
      const teamId = randomUUID();
      const sealed = await sealData(
        { email },
        { password: dataSealPass, ttl: 0 },
      );
      const { sql: usersSql, params: usersParams } = db
        .insert(users)
        .values({ address, teamId, sealed })
        .toSQL();
      const { sql: teamsSql, params: teamsParams } = db
        .insert(teams)
        .values({
          id: teamId,
          personal: 1,
          name: teamName,
          slug: slugify(teamName),
        })
        .toSQL();
      const { sql: teamMembershipsSql, params: teamMembershipsParams } = db
        .insert(teamMemberships)
        .values({
          memberTeamId: teamId,
          teamId,
          isOwner: 1,
          joinedAt: new Date().toISOString(),
        })
        .toSQL();
      await tbl.batch([
        tbl.prepare(usersSql).bind(usersParams),
        tbl.prepare(teamsSql).bind(teamsParams),
        tbl.prepare(teamMembershipsSql).bind(teamMembershipsParams),
      ]);
      const info = await userAndPersonalTeamByAddress(address);
      if (!info) {
        throw new Error("Failed to create user and personal account.");
      }
      return info;
    },

    userAndPersonalTeamByAddress,
  };
}
