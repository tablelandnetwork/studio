import { api } from "@/trpc/server";
import { cache } from "react";
import NewProjectForm from "./_components/new-project-form";

export default async function NewProject({
  params,
}: {
  params: { team: string };
}) {
  const team = await cache(api.teams.teamBySlug.query)({ slug: params.team });

  return (
    <div className="p-4">
      <NewProjectForm team={team} />
    </div>
  );
}
