import db from "@/db/api";
import Session from "@/lib/session";
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
  const team = await db.teams.teamBySlug(params.team);
  if (!team) {
    notFound();
  }
  if (
    !(await db.teams.isAuthorizedForTeam(session.auth.user.teamId, team.id))
  ) {
    notFound();
  }
  const project = await db.projects.projectByTeamIdAndSlug(
    team.id,
    params.project
  );
  if (!project) {
    notFound();
  }

  const deployments = await db.deployments.deploymentsByProjectId(project.id);

  const tables = await db.tables.tablesByProjectId(project.id);

  return <div className="p-4">TBD</div>;
}
