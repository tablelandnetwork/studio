import { api } from "@/trpc/server-invoker";
import ImportTableForm from "./_components/import-table-form";

export default async function NewProject({
  params,
}: {
  params: { team: string; project: string };
}) {
  const team = await api.teams.teamBySlug.query({ slug: params.team });
  const project = await api.projects.projectByTeamIdAndSlug.query({
    teamId: team.id,
    slug: params.project,
  });
  const envs = await api.environments.projectEnvironments.query({
    projectId: project.id,
  });

  return (
    <div className="p-4">
      <ImportTableForm team={team} project={project} envs={envs} />
    </div>
  );
}
