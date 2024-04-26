import { projectBySlug, teamBySlug } from "@/lib/api-helpers";

export default async function ProjectSettings({
  params,
}: {
  params: { team: string; project: string };
}) {
  const team = await teamBySlug(params.team);
  const project = await projectBySlug(params.project, team.id);

  return (
    <div>
      <h1>Project Settings</h1>
    </div>
  );
}
