"use server";

import db from "@/db/api";
import { Project, Team } from "@/db/schema";
import Session, { Auth } from "@/lib/session";
import { sendInvite } from "@/utils/send";
import { unsealData } from "iron-session";
import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import { SiweMessage, generateNonce } from "siwe";

export async function authenticated() {
  const session = await Session.fromCookies(cookies());
  return session.auth;
}

export async function nonce() {
  const session = await Session.fromCookies(cookies());
  session.nonce = generateNonce();
  await session.persist(cookies());
  return session.nonce;
}

// TODO: Add Zod validation and error return everywhere.

export async function login(
  message: string,
  signature: string
): Promise<{ auth?: Auth; error?: string }> {
  const session = await Session.fromCookies(cookies());
  try {
    const siweMessage = new SiweMessage(message);
    const fields = await siweMessage.verify({
      signature,
      nonce: session.nonce,
      // TODO: do we want to verify domain and time here?
    });
    session.siweFields = fields.data;
    let info = await db.auth.userAndPersonalTeamByAddress(fields.data.address);
    if (info) {
      session.auth = info;
    }
    return { auth: session.auth };
  } catch (e: any) {
    session.auth = undefined;
    session.nonce = undefined;
    return { error: e.message };
  } finally {
    await session.persist(cookies());
  }
}

export async function register(
  username: string,
  email?: string
): Promise<{ auth?: Auth; error?: string }> {
  const session = await Session.fromCookies(cookies());
  if (!session.siweFields) {
    return { error: "No SIWE fields found in session" };
  }
  const auth = await db.auth.createUserAndPersonalTeam(
    session.siweFields.address,
    username,
    email
  );
  session.auth = auth;
  await session.persist(cookies());
  return { auth };
}

export async function logout() {
  const session = await Session.fromCookies(cookies());
  await session.clear(cookies());
  revalidatePath("/");
}

export async function newProject(
  teamId: string,
  name: string,
  description?: string
) {
  const session = await Session.fromCookies(cookies());
  if (!session.auth) {
    // TODO: Proper error return.
    throw new Error("Not authenticated");
  }
  if (
    !(await db.teams.isAuthorizedForTeam(session.auth.personalTeam.id, teamId))
  ) {
    // TODO: Proper error return.
    throw new Error("Not authorized");
  }
  const project = await db.projects.createProject(
    teamId,
    name,
    description || null
  );
  const team = await db.teams.teamById(teamId);
  revalidatePath(`/${team.slug}`);
  return project;
}

export async function newTable(
  project: Project,
  name: string,
  schema: string,
  description?: string
) {
  const session = await Session.fromCookies(cookies());
  if (!session.auth) {
    // TODO: Proper error return.
    throw new Error("Not authenticated");
  }
  const team = await db.projects.projectTeamByProjectId(project.id);
  if (
    !(await db.teams.isAuthorizedForTeam(session.auth.personalTeam.id, team.id))
  ) {
    // TODO: Proper error return.
    throw new Error("Not authorized");
  }
  const table = await db.tables.createTable(
    project.id,
    name,
    description || null,
    schema
  );
  revalidatePath(`/${team.slug}/${project.slug}`);
  return table;
}

export async function newTeam(name: string, emailInvites: string[]) {
  const session = await Session.fromCookies(cookies());
  if (!session.auth) {
    throw new Error("Not authenticated");
  }
  const { team, invites } = await db.teams.createTeamByPersonalTeam(
    name,
    session.auth.user.teamId,
    emailInvites
  );
  await Promise.all(invites.map((invite) => sendInvite(invite)));
  revalidatePath(`/${team.slug}`);
  return team;
}

export async function inviteEmails(team: Team, emails: string[]) {
  const session = await Session.fromCookies(cookies());
  if (!session.auth) {
    // TODO: Proper error return.
    throw new Error("Not authenticated");
  }
  if (
    !(await db.teams.isAuthorizedForTeam(session.auth.user.teamId, team.id))
  ) {
    throw new Error("You are not authorized for this team");
  }
  const invites = await db.invites.inviteEmailsToTeam(
    team.id,
    session.auth.user.teamId,
    emails
  );
  await Promise.all(invites.map((invite) => sendInvite(invite)));
  revalidatePath(`/${team.slug}/people`);
}

export async function acceptInvite(seal: string) {
  const session = await Session.fromCookies(cookies());
  if (!session.auth) {
    // TODO: Proper error return.
    throw new Error("Not authenticated");
  }
  const { inviteId } = await unsealData(seal, {
    password: process.env.DATA_SEAL_PASS as string,
  });
  const invite = await db.invites.inviteById(inviteId as string);
  if (!invite) {
    throw new Error("Invite not found");
  }
  if (invite.claimedAt || invite.claimedByTeamId) {
    throw new Error("Invite has already been claimed");
  }
  await db.invites.acceptInvite(invite, session.auth.personalTeam);
}

export async function ignoreInvite(seal: string) {
  const { inviteId } = await unsealData(seal, {
    password: process.env.DATA_SEAL_PASS as string,
  });
  const invite = await db.invites.inviteById(inviteId as string);
  if (!invite) {
    throw new Error("Invite not found");
  }
  if (invite.claimedAt || invite.claimedByTeamId) {
    throw new Error("Invite has already been claimed");
  }
  await db.invites.deleteInvite(inviteId as string);
}
