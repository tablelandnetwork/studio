"use server";

import { store } from "@/lib/store";
import { tbl } from "@/lib/tbl";
import { api } from "@/trpc/server-invoker";
import { Validator } from "@tableland/sdk";
import { Auth, Session } from "@tableland/studio-api";
import { schema } from "@tableland/studio-store";
import { TRPCError } from "@trpc/server";
import { unsealData } from "iron-session";
import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import { SiweMessage, generateNonce } from "siwe";

const validator = new Validator(tbl.config);

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
  signature: string,
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
    let info = await store.auth.userAndPersonalTeamByAddress(
      fields.data.address,
    );
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
  email?: string,
): Promise<{ auth?: Auth; error?: string }> {
  const session = await Session.fromCookies(cookies());
  if (!session.siweFields) {
    return { error: "No SIWE fields found in session" };
  }
  const auth = await store.auth.createUserAndPersonalTeam(
    session.siweFields.address,
    username,
    email,
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
  description?: string,
) {
  const session = await Session.fromCookies(cookies());
  if (!session.auth) {
    // TODO: Proper error return.
    throw new Error("Not authenticated");
  }
  if (
    !(await store.teams.isAuthorizedForTeam(
      session.auth.personalTeam.id,
      teamId,
    ))
  ) {
    // TODO: Proper error return.
    throw new Error("Not authorized");
  }
  const team = await store.teams.teamById(teamId);
  if (!team) {
    throw new TRPCError({
      code: "NOT_FOUND",
      message: "Team not found",
    });
  }
  const project = await store.projects.createProject(
    teamId,
    name,
    description || null,
  );

  revalidatePath(`/${team.slug}`);
  return project;
}

export async function newEnvironment(
  projectId: string,
  title: string,
): Promise<{ id: string }> {
  const session = await Session.fromCookies(cookies());
  if (!session.auth) {
    throw new Error("Not authenticated");
  }
  const team = await store.projects.projectTeamByProjectId(projectId);
  if (!team) {
    throw new Error("Team not found");
  }
  if (
    !(await store.teams.isAuthorizedForTeam(
      session.auth.personalTeam.id,
      team.id,
    ))
  ) {
    throw new Error("Not authorized");
  }
  const environment = await store.environments.createEnvironment({
    projectId,
    title,
  });

  revalidatePath(`/${team.slug}/${projectId}`);
  return environment;
}

export async function newDeployment(
  tableId: string,
  environmentId: string,
  chain: number,
  schema: string,
  tableUuName?: string,
) {
  const session = await Session.fromCookies(cookies());
  if (!session.auth) {
    throw new Error("Not authenticated");
  }
  const team = await store.projects.projectTeamByEnvironmentId(environmentId);
  if (!team) {
    throw new Error("Team not found");
  }
  if (
    !(await store.teams.isAuthorizedForTeam(
      session.auth.personalTeam.id,
      team.id,
    ))
  ) {
    throw new Error("Not authorized");
  }
  const deployment = await store.deployments.createDeployment({
    tableId,
    environmentId,
    chain,
    schema,
    tableUuName,
    createdAt: new Date(), // TODO: Use the created attribute from the table.
  });

  return deployment;
}

export async function newTable(
  project: schema.Project,
  name: string,
  schema: string,
  description?: string,
) {
  const session = await Session.fromCookies(cookies());
  if (!session.auth) {
    // TODO: Proper error return.
    throw new Error("Not authenticated");
  }
  const team = await store.projects.projectTeamByProjectId(project.id);
  if (!team) {
    throw new Error("Team not found");
  }
  if (
    !(await store.teams.isAuthorizedForTeam(
      session.auth.personalTeam.id,
      team.id,
    ))
  ) {
    // TODO: Proper error return.
    throw new Error("Not authorized");
  }
  const table = await store.tables.createTable(
    project.id,
    name,
    description || null,
    schema,
  );
  revalidatePath(`/${team.slug}/${project.slug}`);
  return table;
}

export async function importTable(
  project: schema.Project,
  chainId: number,
  tableId: string,
  name: string,
  environmentId: string,
  description?: string,
) {
  const session = await Session.fromCookies(cookies());
  if (!session.auth) {
    throw new Error("Not authenticated");
  }
  const team = await store.projects.projectTeamByProjectId(project.id);
  if (!team) {
    throw new Error("Team not found");
  }
  if (
    !(await store.teams.isAuthorizedForTeam(
      session.auth.personalTeam.id,
      team.id,
    ))
  ) {
    // TODO: Proper error return.
    throw new Error("Not authorized");
  }

  const tablelandTable = await validator.getTableById({ chainId, tableId });

  // TODO: Figure out a standard way of encoding schema for both Tables created in Studio and imported tables.
  const table = await newTable(
    project,
    name,
    JSON.stringify(tablelandTable.schema),
    description,
  );

  const createdAttr = tablelandTable.attributes?.find(
    (attr) => attr.traitType === "created",
  );
  if (!createdAttr) {
    throw new Error("No created attribute found");
  }

  const deployment = await store.deployments.createDeployment({
    tableId: table.id,
    chain: chainId,
    environmentId,
    schema: JSON.stringify(tablelandTable.schema),
    tableUuName: tablelandTable.name,
    createdAt: new Date(createdAttr.value * 1000),
  });

  revalidatePath(`/${team.slug}/${project.slug}/deployments`);
  return { table, deployment };
}

export async function newTeam(name: string, emailInvites: string[]) {
  const team = await api.teams.newTeam.mutate({ name, emailInvites });
  await api.teams.userTeams.revalidate();
  return team;
}

export async function inviteEmails(teamId: string, emails: string[]) {
  await api.invites.inviteEmails.mutate({ teamId, emails });
  await api.invites.invitesForTeam.revalidate({
    teamId: teamId,
  });
}

export async function resendInvite(invite: schema.TeamInvite) {
  await api.invites.resendInvite.mutate({
    teamId: invite.teamId,
    inviteId: invite.id,
  });
}

export async function deleteInvite(invite: schema.TeamInvite) {
  await api.invites.deleteInvite.mutate({
    inviteId: invite.id,
    teamId: invite.teamId,
  });
  await api.invites.invitesForTeam.revalidate({ teamId: invite.teamId });
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
  const invite = await store.invites.inviteById(inviteId as string);
  if (!invite) {
    throw new Error("Invite not found");
  }
  if (invite.claimedAt || invite.claimedByTeamId) {
    throw new Error("Invite has already been claimed");
  }
  await store.invites.acceptInvite(invite, session.auth.personalTeam);
}

export async function ignoreInvite(seal: string) {
  const { inviteId } = await unsealData(seal, {
    password: process.env.DATA_SEAL_PASS as string,
  });
  const invite = await store.invites.inviteById(inviteId as string);
  if (!invite) {
    throw new Error("Invite not found");
  }
  if (invite.claimedAt || invite.claimedByTeamId) {
    throw new Error("Invite has already been claimed");
  }
  await store.invites.deleteInvite(inviteId as string);
}

export async function toggleAdmin(team: schema.Team, member: schema.Team) {
  const session = await Session.fromCookies(cookies());
  if (!session.auth) {
    throw new Error("Not authenticated");
  }
  await store.teams.toggleAdmin(team.id, member.id);
  revalidatePath(`/${team.slug}/people`);
}

export async function removeTeamMember(
  team: schema.Team,
  member: schema.Team,
  claimedInviteId?: string,
) {
  const session = await Session.fromCookies(cookies());
  if (!session.auth) {
    throw new Error("Not authenticated");
  }
  await store.teams.removeTeamMember(team.id, member.id);
  if (claimedInviteId) {
    await store.invites.deleteInvite(claimedInviteId);
  }
  revalidatePath(`/${team.slug}/people`);
}
