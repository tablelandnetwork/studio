import NewProjectForm from "@/components/new-project-form";
import { api } from "@/trpc/server-invoker";

export default async function NewProject({
  params,
}: {
  params: { team: string };
}) {
  const team = await api.teams.teamBySlug.query({ slug: params.team });

  return (
    <div className="p-4">
      <NewProjectForm team={team} />
    </div>
  );
}
