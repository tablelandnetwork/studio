import { cache } from "react";
import DeleteButton from "./_components/delete-button";
import { api } from "@/trpc/server";

export default async function TeamSettings({
  params,
}: {
  params: { team: string };
}) {
  const teamx = await cache(api.teams.teamBySlug)({ slug: params.team });

  return (
    <div>
      Team settings
      <DeleteButton team={teamx} />
    </div>
  );
}
