// import { cache } from "react";
// import { api } from "@/trpc/server";

export default async function TeamSettings({
  params,
}: {
  params: { team: string };
}) {
  // const team = await cache(api.teams.teamBySlug.query)({ slug: params.team });

  return <div>Team settings</div>;
}
