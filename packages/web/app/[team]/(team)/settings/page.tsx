import { api } from "@/trpc/server-invoker";

export default async function TeamSettings({
  params,
}: {
  params: { team: string };
}) {
  const team = await api.teams.teamBySlug.query({ slug: params.team });

  return <div>Team settings</div>;
}
