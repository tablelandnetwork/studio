"use server";

import { signer } from "@/lib/wallet";
import { api } from "@/trpc/server-invoker";
import { Auth, Session } from "@tableland/studio-api";
import { Schema, schema } from "@tableland/studio-store";
import { cookies } from "next/headers";

export async function authenticated() {
  const session = await Session.fromCookies(cookies());
  return await api.auth.authenticated.query(
    session.auth ? { userTeamId: session.auth.user.teamId } : undefined,
  );
}

export async function nonce() {
  return await api.auth.nonce.mutate();
}

export async function login(
  message: string,
  signature: string,
): Promise<{ auth?: Auth; error?: string }> {
  try {
    const auth = await api.auth.login.mutate({ message, signature });
    await api.auth.authenticated.revalidate({ userTeamId: auth?.user.teamId });
    return { auth };
  } catch (e: any) {
    return { error: e.message };
  }
}

export async function register(
  username: string,
  email?: string,
): Promise<{ auth?: Auth; error?: string }> {
  try {
    const auth = await api.auth.register.mutate({ username, email });
    await api.auth.authenticated.revalidate({ userTeamId: auth.user.teamId });
    return { auth };
  } catch (e: any) {
    return { error: e.message };
  }
}

export async function logout() {
  const session = await Session.fromCookies(cookies());
  await api.auth.logout.mutate();
  await api.auth.authenticated.revalidate({
    userTeamId: session.auth?.user.teamId,
  });
}

export async function teamNameAvailable(name: string) {
  return await api.teams.nameAvailable.query({ name });
}

export async function teamBySlug(slug: string) {
  return await api.teams.teamBySlug.query({ slug });
}

export async function projectByTeamIdAndSlug(teamId: string, slug: string) {
  return await api.projects.projectByTeamIdAndSlug.query({ teamId, slug });
}

export async function tableByProjectIdAndSlug(projectId: string, slug: string) {
  return await api.tables.tableByProjectIdAndSlug.query({ projectId, slug });
}

export async function projectNameAvailable(teamId: string, name: string) {
  return await api.projects.nameAvailable.query({ teamId, name });
}

export async function newProject(
  teamId: string,
  name: string,
  description: string,
) {
  const project = await api.projects.newProject.mutate({
    teamId,
    name,
    description,
  });
  await api.projects.teamProjects.revalidate({ teamId });
  await api.projects.nameAvailable.revalidate({ teamId, name });
  return project;
}

export async function newEnvironment(
  projectId: string,
  name: string,
): Promise<{ id: string }> {
  const environment = await api.environments.newEnvironment.mutate({
    projectId,
    name,
  });
  await api.environments.projectEnvironments.revalidate({ projectId });
  return environment;
}

export async function tableNameAvailable(projectId: string, name: string) {
  return await api.tables.nameAvailable.query({ projectId, name });
}

export async function newTable(
  project: schema.Project,
  name: string,
  description: string,
  schema: Schema,
) {
  const table = api.tables.newTable.mutate({
    projectId: project.id,
    name,
    schema,
    description,
  });
  await api.tables.projectTables.revalidate({ projectId: project.id });
  await api.tables.nameAvailable.revalidate({ projectId: project.id, name });
  return table;
}

export async function recordDeployment(
  projectId: string,
  tableId: string,
  environmentId: string,
  tableName: string,
  chainId: number,
  tokenId: string,
  createdAt: Date,
  blockNumber?: number,
  txnHash?: string,
) {
  await api.deployments.recordDeployment.mutate({
    tableId: tableId,
    environmentId,
    tableName,
    chainId,
    tokenId,
    blockNumber,
    txnHash,
    createdAt,
  });
  await api.deployments.projectDeployments.revalidate({
    projectId: projectId,
  });
}

export async function importTable(
  project: schema.Project,
  chainId: number,
  tableId: string,
  name: string,
  environmentId: string,
  description: string,
) {
  const nonce = await signer.getTransactionCount();
  console.log("Transaction count in importTable:", nonce);
  const res = await api.tables.importTable.mutate({
    projectId: project.id,
    chainId,
    tableId,
    name,
    environmentId,
    description,
  });

  await api.tables.projectTables.revalidate({ projectId: project.id });
  await api.deployments.projectDeployments.revalidate({
    projectId: project.id,
  });
  return res;
}

export async function newTeam(name: string, emailInvites: string[]) {
  const team = await api.teams.newTeam.mutate({ name, emailInvites });
  const session = await Session.fromCookies(cookies());
  await api.teams.userTeams.revalidate({
    userTeamId: session.auth!.user.teamId,
  });
  await api.teams.nameAvailable.revalidate({ name });
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
  const invite = await api.invites.acceptInvite.mutate({ seal });
  await api.invites.invitesForTeam.revalidate({ teamId: invite.teamId });
  await api.teams.usersForTeam.revalidate({ teamId: invite.teamId });
}

export async function ignoreInvite(seal: string) {
  const invite = await api.invites.ignoreInvite.mutate({ seal });
  await api.invites.invitesForTeam.revalidate({ teamId: invite.teamId });
}

export async function toggleAdmin(team: schema.Team, member: schema.Team) {
  await api.teams.toggleAdmin.mutate({ teamId: team.id, userId: member.id });
  await api.teams.usersForTeam.revalidate({ teamId: team.id });
}

export async function removeTeamMember(team: schema.Team, member: schema.Team) {
  await api.teams.removeTeamMember.mutate({
    teamId: team.id,
    userId: member.id,
  });
  await api.teams.usersForTeam.revalidate({ teamId: team.id });
}
