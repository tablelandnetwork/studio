import { NonceManager } from "@ethersproject/experimental";
import { Database } from "@tableland/sdk";
import { randomUUID } from "crypto";
import { drizzle } from "drizzle-orm/d1";
import { and, eq } from "drizzle-orm/expressions";
import { Wallet, getDefaultProvider } from "ethers";

import {
  NewTeamMembership,
  Project,
  Table,
  Team,
  resolveProjectTables,
  resolveProjects,
  resolveTables,
  resolveTeamMemberships,
  resolveTeamProjects,
  resolveTeams,
  resolveUsers,
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
const db = drizzle(tbl, { logger: true });

const users = resolveUsers(process.env.CHAIN);
const teams = resolveTeams(process.env.CHAIN);
const teamMemberships = resolveTeamMemberships(process.env.CHAIN);
const projects = resolveProjects(process.env.CHAIN);
const teamProjects = resolveTeamProjects(process.env.CHAIN);
const tables = resolveTables(process.env.CHAIN);
const projectTables = resolveProjectTables(process.env.CHAIN);

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
  return db
    .select({
      user: users,
      personalTeam: teams,
    })
    .from(users)
    .innerJoin(teams, eq(users.teamId, teams.id))
    .get();
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
  const res = await db
    .select({ teams })
    .from(teamMemberships)
    .innerJoin(teams, eq(teamMemberships.teamId, teams.id))
    .where(eq(teamMemberships.memberTeamId, memberTeamId))
    .orderBy(teams.name)
    .all();
  return res.map((r) => r.teams);
}

export async function isAuthorizedForTeam(
  memberTeamId: string,
  teamId: string
) {
  const membership = await db
    .select()
    .from(teamMemberships)
    .where(
      and(
        eq(teamMemberships.teamId, teamId),
        eq(teamMemberships.memberTeamId, memberTeamId)
      )
    )
    .get();
  return !!membership;
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

export async function createTable(
  projectId: string,
  name: string,
  description: string | null,
  schema: string
) {
  const tableId = randomUUID();
  const tablesInsert = db
    .insert(tables)
    .values({ id: tableId, name, description, schema })
    .run();
  const projectTablesInsert = db
    .insert(projectTables)
    .values({ tableId, projectId })
    .run();
  await Promise.all([tablesInsert, projectTablesInsert]);
  const table: Table = { id: tableId, name, description, schema };
  return table;
}

export async function projectsByTeamId(teamId: string) {
  const res = await db
    .select({ projects }) // TODO: Figure out why if we don't specify select key, projects key ends up as actual table name.
    .from(teamProjects)
    .innerJoin(projects, eq(teamProjects.projectId, projects.id))
    .where(and(eq(teamProjects.teamId, teamId), eq(teamProjects.isOwner, 1)))
    .orderBy(projects.name)
    .all();
  const mapped = res.map((r) => r.projects);
  return mapped;
}

export async function tablesByProjectId(projectId: string) {
  const res = await db
    .select({ tables })
    .from(tables)
    .innerJoin(tables, eq(projectTables.tableId, tables.id))
    .where(and(eq(projectTables.projectId, projectId)))
    .orderBy(tables.name)
    .all();
  const mapped = res.map((r) => r.tables);
  return mapped;
}

export async function projectByTeamIdAndSlug(teamId: string, slug: string) {
  const res = await db
    .select({ projects })
    .from(teamProjects)
    .innerJoin(projects, eq(teamProjects.projectId, projects.id))
    .where(and(eq(teamProjects.teamId, teamId), eq(projects.slug, slug)))
    .get();
  return res.projects;
}

export async function projectTeamByProjectId(projectId: string) {
  const res = await db
    .select({ teams })
    .from(teamProjects)
    .innerJoin(teams, eq(teamProjects.teamId, teams.id))
    .where(eq(teamProjects.projectId, projectId))
    .orderBy(teams.name)
    .get();
  return res.teams.id;
}

export async function isAuthorizedForProject(
  teamId: string,
  projectId: string
) {
  const ownsProject = await db
    .select()
    .from(teamProjects)
    .where(
      and(
        eq(teamProjects.teamId, teamId),
        eq(teamProjects.projectId, projectId)
      )
    )
    .get();
  return !!ownsProject;
}

function slugify(input: string) {
  return input
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s-]+/g, "-");
  // .replace(/^-+|-+$/g, "");
}
