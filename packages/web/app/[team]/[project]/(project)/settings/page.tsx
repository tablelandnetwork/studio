import { api } from "@/trpc/server-invoker";

export default async function ProjectSettings({
  params,
}: {
  params: { team: string; project: string };
}) {
  const team = await api.teams.teamBySlug.query({ slug: params.team });

  const project = await api.projects.projectByTeamIdAndSlug.query({
    teamId: team.id,
    slug: params.project,
  });

  return (
    <div>
      <h1>Project Settings</h1>
    </div>
  );
}
