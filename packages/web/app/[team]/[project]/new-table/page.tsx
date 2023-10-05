import { api } from "@/trpc/server-http";
import { cache } from "react";
import NewTableForm from "./_components/new-table-form";

export default async function NewProject({
  params,
}: {
  params: { team: string; project: string };
}) {
  const team = await cache(api.teams.teamBySlug.query)({ slug: params.team });
  const project = await cache(api.projects.projectByTeamIdAndSlug.query)({
    teamId: team.id,
    slug: params.project,
  });
  const envs = await cache(api.environments.projectEnvironments.query)({
    projectId: project.id,
  });

  return (
    <div className="p-4">
      <NewTableForm team={team} project={project} envs={envs} />
    </div>
  );
}
