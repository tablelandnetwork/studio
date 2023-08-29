import { store } from "@/lib/store";
import { Session } from "@tableland/studio-api";
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

  const envs = await store.environments.getEnvironmentsByProjectId(project.id);

  if (!project) {
    notFound();
  }
  return (
    <div className="p-4">
      <ImportTableForm team={team} project={project} envs={envs} />
    </div>
  );
}
