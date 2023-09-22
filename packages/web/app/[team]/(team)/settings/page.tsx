import { api } from "@/trpc/server-invoker";
import { cache } from "react";

export default async function TeamSettings({
  params,
}: {
  params: { team: string };
}) {
  const team = await cache(api.teams.teamBySlug.query)({ slug: params.team });

  return <div>Team settings</div>;
}
