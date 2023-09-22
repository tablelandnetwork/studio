import NewProjectForm from "@/components/new-project-form";
import { api } from "@/trpc/server-invoker";
import { cache } from "react";

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
