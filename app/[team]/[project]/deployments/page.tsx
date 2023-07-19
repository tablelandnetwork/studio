import BodyDeployments from "@/components/body-deployments";
import db from "@/db/api";
import Session from "@/lib/session";
import { cookies } from "next/headers";
import { notFound } from "next/navigation";

export default async function Deployments({
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
    !(await db.teams.isAuthorizedForTeam(session.auth.personalTeam.id, team.id))
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

  return (
    <>
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-semibold">Project</h1>
        <p className="text-lg text-gray-600">
          {team.name} / {project.name}
        </p>
        <p>{project.description}</p>
      </div>
      <div className="mx-auto flex w-full max-w-3xl flex-col space-y-4 p-4">
        <BodyDeployments
          team={team}
          project={project}
          tables={tables}
          deployments={deployments}
        />
      </div>
    </>
  );
}
