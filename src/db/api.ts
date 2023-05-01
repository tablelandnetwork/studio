import { NonceManager } from "@ethersproject/experimental";
import { Database } from "@tableland/sdk";
import { randomUUID } from "crypto";
import { drizzle } from "drizzle-orm/d1";
import { and, eq, inArray } from "drizzle-orm/expressions";
import { getDefaultProvider, Wallet } from "ethers";

import {
  NewTeamMembership,
  Project,
  resolveProjects,
  resolveTeamMemberships,
  resolveTeamProjects,
  resolveTeams,
  resolveUsers,
  Team,
  User,
} from "./schema";

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
const teamMemberships = resolveTeamMemberships(process.env.CHAIN);
const projects = resolveProjects(process.env.CHAIN);
const teamProjects = resolveTeamProjects(process.env.CHAIN);

export async function createUserAndPersonalTeam(
  address: string,
  teamName: string,
  email?: string
) {
  // TODO: Store email encrypted.
  const teamId = randomUUID();
  const usersInsert = db.insert(users).values({ address, teamId }).run();
  const teamsInsert = db
    .insert(teams)
    .values({
      id: teamId,
      personal: 1,
      name: teamName,
      slug: slugify(teamName),
    })
    .run();
  const teamMembershipInsert = db
    .insert(teamMemberships)
    .values({ memberTeamId: teamId, teamId, isOwner: 1 })
    .run();
  await Promise.all([usersInsert, teamsInsert, teamMembershipInsert]);
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
  const personalTeam = await db
    .select()
    .from(teams)
    .where(eq(teams.id, user.teamId))
    .get();
  return { user, personalTeam };
}

export async function userByAddress(address: string) {
  return db.select().from(users).where(eq(users.address, address)).get();
}

export async function createTeamByPersonalTeam(
  name: string,
  personalTeamId: string
) {
  const teamId = randomUUID();
  const slug = slugify(name);
  await db.insert(teams).values({ id: teamId, personal: 0, name, slug }).run();
  await db
    .insert(teamMemberships)
    .values({ memberTeamId: personalTeamId, teamId, isOwner: 1 })
    .run();
  const team: Team = { id: teamId, personal: 0, name, slug };
  return team;
}

export async function teamBySlug(slug: string) {
  return db.select().from(teams).where(eq(teams.slug, slug)).get();
}

export async function teamById(id: string) {
  return db.select().from(teams).where(eq(teams.id, id)).get();
}

export async function teamsByMemberTeamId(memberTeamId: string) {
  const joins = await db
    .select({ teamId: teamMemberships.teamId })
    .from(teamMemberships)
    .where(eq(teamMemberships.memberTeamId, memberTeamId))
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

export async function isAuthorizedForTeam(
  memberTeamId: string,
  teamId: string
) {
  const join = await db
    .select()
    .from(teamMemberships)
    .where(
      and(
        eq(teamMemberships.teamId, teamId),
        eq(teamMemberships.memberTeamId, memberTeamId)
      )
    )
    .get();
  return !!join;
}

export async function addUserToTeam(params: NewTeamMembership) {
  return db.insert(teamMemberships).values(params).run();
}

export async function createProject(
  teamId: string,
  name: string,
  description: string | null
) {
  const projectId = randomUUID();
  const slug = slugify(name);
  const projectsInsert = db
    .insert(projects)
    .values({ id: projectId, name, description, slug })
    .run();
  const teamProjectsInsert = db
    .insert(teamProjects)
    .values({ projectId, teamId, isOwner: 1 })
    .run();
  await Promise.all([projectsInsert, teamProjectsInsert]);
  const project: Project = { id: projectId, name, description, slug };
  return project;
}

export async function projectsByTeamId(teamId: string) {
  const joins = await db
    .select({ projectId: teamProjects.projectId })
    .from(teamProjects)
    .where(and(eq(teamProjects.teamId, teamId), eq(teamProjects.isOwner, 1)))
    .all();
  const projectIds = joins.map((j) => j.projectId);
  if (projectIds.length === 0) {
    return [];
  }
  const list = await db
    .select()
    .from(projects)
    .where(inArray(projects.id, projectIds))
    .orderBy(projects.name)
    .all();
  return list;
}

export async function projectByTeamIdAndSlug(teamId: string, slug: string) {
  const joins = await db
    .select()
    .from(teamProjects)
    .where(and(eq(teamProjects.teamId, teamId), eq(teamProjects.isOwner, 1)))
    .all();
  if (!joins.length) {
    return undefined;
  }
  const projectIds = joins.map((j) => j.projectId);
  const project = await db
    .select()
    .from(projects)
    .where(and(inArray(projects.id, projectIds), eq(projects.slug, slug)))
    .get();
  return project;
}

export async function isAuthorizedForProject(
  teamId: string,
  projectId: string
) {
  const join = await db
    .select()
    .from(teamProjects)
    .where(
      and(
        eq(teamProjects.teamId, teamId),
        eq(teamProjects.projectId, projectId)
      )
    )
    .get();
  return !!join;
}

function slugify(input: string) {
  return input
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s-]+/g, "-");
  // .replace(/^-+|-+$/g, "");
}
