import { NonceManager } from "@ethersproject/experimental";
import { Database } from "@tableland/sdk";
import { randomUUID } from "crypto";
import { drizzle } from "drizzle-orm/d1";
import { and, eq } from "drizzle-orm/expressions";
import { getDefaultProvider, Wallet } from "ethers";

import { sealData } from "iron-session";
import {
  NewTeamInvite,
  NewTeamMembership,
  Project,
  resolveProjects,
  resolveTeamInvites,
  resolveTeamMemberships,
  resolveTeamProjects,
  resolveTeams,
  resolveUsers,
  Team,
  TeamInvite,
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
const db = drizzle(tbl, { logger: false });

const users = resolveUsers(process.env.CHAIN);
const teams = resolveTeams(process.env.CHAIN);
const teamMemberships = resolveTeamMemberships(process.env.CHAIN);
const projects = resolveProjects(process.env.CHAIN);
const teamProjects = resolveTeamProjects(process.env.CHAIN);
const teamInvites = resolveTeamInvites(process.env.CHAIN);

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
    .where(eq(users.address, address))
    .get();
}

export async function userByAddress(address: string) {
  return db.select().from(users).where(eq(users.address, address)).get();
}

export async function createTeamByPersonalTeam(
  name: string,
  personalTeamId: string,
  inviteEmails: string[]
) {
  const teamId = randomUUID();
  const slug = slugify(name);
  const team: Team = { id: teamId, personal: 0, name, slug };
  const { sql: teamsSql, params: teamsParams } = db
    .insert(teams)
    .values(team)
    .toSQL();
  const { sql: teamMembershipsSql, params: teamMembershipsParams } = db
    .insert(teamMemberships)
    .values({ memberTeamId: personalTeamId, teamId, isOwner: 1 })
    .toSQL();
  const invites: TeamInvite[] = inviteEmails.map((email) => ({
    id: randomUUID(),
    teamId,
    inviterTeamId: personalTeamId,
    email,
    createdAt: new Date().toISOString(),
    claimedByTeamId: null,
    claimedAt: null,
  }));
  const batch = [
    tbl.prepare(teamsSql).bind(teamsParams),
    tbl.prepare(teamMembershipsSql).bind(teamMembershipsParams),
  ];
  if (!!invites.length) {
    const invitesEncrypted: NewTeamInvite[] = await Promise.all(
      invites.map(async (invite) => ({
        ...invite,
        email: await sealData(
          { email: invite.email },
          {
            password: process.env.DATA_SEAL_PASS as string,
            ttl: 0,
          }
        ),
      }))
    );
    const { sql: invitesSql, params: invitesParams } = db
      .insert(teamInvites)
      .values(invitesEncrypted)
      .toSQL();
    batch.push(tbl.prepare(invitesSql).bind(invitesParams));
  }
  await tbl.batch(batch);
  return { team, invites };
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
  await db.insert(teamMemberships).values(params).run();
}

export async function inviteEmailsToTeam(
  teamId: string,
  inviterTeamId: string,
  emails: string[]
) {
  const invites = await Promise.all(
    emails.map(async (email) => ({
      id: randomUUID(),
      teamId,
      inviterTeamId,
      email: await sealData(
        { email },
        {
          password: process.env.DATA_SEAL_PASS as string,
          ttl: 0,
        }
      ),
      createdAt: new Date().toISOString(),
    }))
  );
  await db.insert(teamInvites).values(invites).run();
}

export async function inviteById(id: string) {
  const invite = await db
    .select()
    .from(teamInvites)
    .where(eq(teamInvites.id, id))
    .get();
  return invite;
}

export async function acceptInvite(invite: TeamInvite, personalTeam: Team) {
  const { sql: invitesSql, params: invitesParams } = db
    .update(teamInvites)
    .set({
      claimedByTeamId: personalTeam.id,
      claimedAt: new Date().toISOString(),
    })
    .where(eq(teamInvites.id, invite.id))
    .toSQL();
  const { sql: membershipsSql, params: membershipsParams } = db
    .insert(teamMemberships)
    .values({
      teamId: invite.teamId,
      memberTeamId: personalTeam.id,
      isOwner: 0,
    })
    .toSQL();
  await tbl.batch([
    tbl.prepare(invitesSql).bind(invitesParams),
    tbl.prepare(membershipsSql).bind(membershipsParams),
  ]);
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

export async function projectByTeamIdAndSlug(teamId: string, slug: string) {
  const res = await db
    .select({ projects })
    .from(teamProjects)
    .innerJoin(projects, eq(teamProjects.projectId, projects.id))
    .where(and(eq(teamProjects.teamId, teamId), eq(projects.slug, slug)))
    .get();
  return res.projects;
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
