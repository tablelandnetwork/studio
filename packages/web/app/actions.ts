"use server";

import { tbl } from "@/lib/tbl";
import { api } from "@/trpc/server-invoker";
import { Validator } from "@tableland/sdk";
import { Auth } from "@tableland/studio-api";
import { schema } from "@tableland/studio-store";
import { revalidatePath } from "next/cache";

const validator = new Validator(tbl.config);

export async function authenticated() {
  return await api.auth.authenticated.query();
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
    return { auth };
  } catch (e: any) {
    return { error: e.message };
  }
}

export async function logout() {
  await api.auth.logout.mutate();
  revalidatePath("/");
}

export async function newProject(
  teamId: string,
  name: string,
  description?: string,
) {
  const project = await api.projects.newProject.mutate({
    teamId,
    name,
    description,
  });
  await api.projects.teamProjects.revalidate({ teamId });
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

export async function newTable(
  project: schema.Project,
  name: string,
  schema: string,
  description?: string,
) {
  const table = api.tables.newTable.mutate({
    projectId: project.id,
    name,
    schema,
    description,
  });
  await api.tables.projectTables.revalidate({ projectId: project.id });
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
  const res = await api.tables.importTable.mutate({
    projectId: project.id,
    chainId,
    tableId,
    name,
    environmentId,
    description,
  });

  await api.tables.projectTables.revalidate({ projectId: project.id });
  // TODO: Revalidate whatever API function provides list of deployments.
  return res;
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
