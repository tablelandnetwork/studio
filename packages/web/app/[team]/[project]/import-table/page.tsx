import { cache } from "react";
import ImportTableForm from "./_components/import-table-form";
import { api } from "@/trpc/server";

export default async function NewProject({
  params,
}: {
  params: { team: string; project: string };
}) {
  const team = await cache(api.teams.teamBySlug)({ slug: params.team });
  const project = await cache(api.projects.projectBySlug)({
    teamId: team.id,
    slug: params.project,
  });
  const envs = await cache(api.environments.projectEnvironments)({
    projectId: project.id,
  });

  return (
    <div className="p-4">
      <ImportTableForm team={team} project={project} envs={envs} />
    </div>
  );
}
