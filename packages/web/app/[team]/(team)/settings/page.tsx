import { cache } from "react";
import SettingsForm from "./_components/settings-form";
import { api } from "@/trpc/server";

export default async function TeamSettings({
  params,
}: {
  params: { team: string };
}) {
  const team = await cache(api.teams.teamBySlug.query)({ slug: params.team });

  return (
    <div className="container py-4">
      <p>Team settings {team.name}</p>
      <SettingsForm team={team} />
    </div>
  );
}
