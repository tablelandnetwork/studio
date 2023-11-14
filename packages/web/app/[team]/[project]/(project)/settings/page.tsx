import { cache } from "react";
import { api } from "@/trpc/server";

export default async function ProjectSettings({
  params,
}: {
  params: { team: string; project: string };
}) {
  const team = await cache(api.teams.teamBySlug.query)({ slug: params.team });

  const project = await cache(api.projects.projectBySlug.query)({
    teamId: team.id,
    slug: params.project,
  });

  return (
    <div>
      <h1>Project Settings</h1>
    </div>
  );
}
