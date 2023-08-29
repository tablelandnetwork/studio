import { store } from "@/lib/store";
import { Session } from "@tableland/studio-api";
import { cookies } from "next/headers";
import { notFound } from "next/navigation";

export default async function NewProject({
  params,
}: {
  params: { team: string; project: string };
}) {
  const session = await Session.fromCookies(cookies());
  if (!session.auth) {
    notFound();
  }
  const team = await store.teams.teamBySlug(params.team);
  if (!team) {
    notFound();
  }
  if (
    !(await store.teams.isAuthorizedForTeam(session.auth.user.teamId, team.id))
  ) {
    notFound();
  }
  const project = await store.projects.projectByTeamIdAndSlug(
    team.id,
    params.project,
  );
  if (!project) {
    notFound();
  }

  const deployments = await store.deployments.deploymentsByProjectId(
    project.id,
  );

  const tables = await store.tables.tablesByProjectId(project.id);

  return <div className="p-4">TBD</div>;
}
