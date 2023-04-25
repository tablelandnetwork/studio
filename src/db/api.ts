import { drizzle } from "drizzle-orm/d1";
import { eq, inArray } from "drizzle-orm/expressions";
import { Database } from "@tableland/sdk";
import { getDefaultProvider, Wallet } from "ethers";
import { NonceManager } from "@ethersproject/experimental";

import {
  resolveUsers,
  resolveTeams,
  resolveUserTeams,
  User,
  Team,
  NewUserTeam,
} from "./schema";
import { randomUUID } from "crypto";

if (!process.env.PRIVATE_KEY) {
  throw new Error("Must provide PRIVATE_KEY env var.");
}

if (!process.env.CHAIN) {
  throw new Error("Must provide CHAIN env var.");
}

const wallet = new Wallet(process.env.PRIVATE_KEY);
const provider = getDefaultProvider(process.env.PROVIDER_URL);
const baseSigner = wallet.connect(provider);
const signer = new NonceManager(baseSigner);

const tbl = new Database({ signer, autoWait: true });
const db = drizzle(tbl);

const users = resolveUsers(process.env.CHAIN);
const teams = resolveTeams(process.env.CHAIN);
const userTeams = resolveUserTeams(process.env.CHAIN);

export async function createUserAndPersonalTeam(address: string) {
  const userId = randomUUID();
  const teamId = randomUUID();
  const usersInsert = db.insert(users).values({ id: userId, address }).run();
  const teamsInsert = db
    .insert(teams)
    .values({ id: teamId, personal: 1 })
    .run();
  const userTeamsInsert = db
    .insert(userTeams)
    .values({ userId, teamId, isOwner: 1 })
    .run();
  await Promise.all([usersInsert, teamsInsert, userTeamsInsert]);
  const info = await userAndPersonalTeamByAddress(address);
  if (!info) {
    throw new Error("Failed to create user and personal team.");
  }
  return info;
}

export async function userAndPersonalTeamByAddress(address: string) {
  // TODO: Reenable this when we can do joins.
  // return db
  //   .select({
  //     userId: usersTable.id,
  //     address: usersTable.address,
  //     teamId: teamsTable.id,
  //     teamName: teamsTable.name,
  //   })
  //   .from(usersTable)
  //   .innerJoin(userTeamsTable, eq(usersTable.id, userTeamsTable.userId))
  //   .innerJoin(teamsTable, eq(userTeamsTable.teamId, teamsTable.id))
  //   .where(and(eq(usersTable.address, address), eq(teamsTable.personal, 1)))
  //   .get();
  const user = await db
    .select()
    .from(users)
    .where(eq(users.address, address))
    .get();
  if (!user) {
    return undefined;
  }
  const join = await db
    .select({ teamId: userTeams.teamId })
    .from(userTeams)
    .where(eq(userTeams.userId, user.id))
    .get();
  const personalTeam = await db
    .select()
    .from(teams)
    .where(eq(teams.id, join.teamId))
    .get();
  return { user, personalTeam };
}

export async function userByAddress(address: string) {
  return db.select().from(users).where(eq(users.address, address)).get();
}

export async function createTeamByUser(name: string, userId: string) {
  const teamId = randomUUID();
  const slug = slugify(name);
  await db.insert(teams).values({ id: teamId, personal: 0, name, slug }).run();
  await db.insert(userTeams).values({ userId, teamId, isOwner: 1 }).run();
  const team: Team = { id: teamId, personal: 0, name, slug };
  return team;
}

export async function teamBySlug(slug: string) {
  return db.select().from(teams).where(eq(teams.slug, slug)).get();
}

export async function teamById(id: string) {
  return db.select().from(teams).where(eq(teams.id, id)).get();
}

export async function teamsByUserId(userId: string) {
  const joins = await db
    .select({ teamId: userTeams.teamId })
    .from(userTeams)
    .where(eq(userTeams.userId, userId))
    .all();
  const teamIds = joins.map((j) => j.teamId);
  const list = await db
    .select()
    .from(teams)
    .where(inArray(teams.id, teamIds))
    .orderBy(teams.name)
    .all();
  return list;
}

export async function addUserToTeam(params: NewUserTeam) {
  return db.insert(userTeams).values(params).run();
}

export async function getUsers(): Promise<User[]> {
  return db.select().from(users).all();
}

function slugify(input: string) {
  return input
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "");
}
