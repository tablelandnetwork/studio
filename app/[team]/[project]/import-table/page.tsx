import db from "@/db/api";
import Session from "@/lib/session";
import { cookies } from "next/headers";
import { notFound } from "next/navigation";
import ImportTableForm from "./_components/import-table-form";

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

  const envs = await db.environments.getEnvironmentsByProjectId(project.id);

  if (!project) {
    notFound();
  }
  return (
    <div className="p-4">
      <ImportTableForm team={team} project={project} envs={envs} />
    </div>
  );
}
