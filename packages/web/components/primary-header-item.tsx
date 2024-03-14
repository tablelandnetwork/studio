"use client";

import { type RouterOutputs } from "@tableland/studio-api";
import { skipToken } from "@tanstack/react-query";
import TeamSwitcher from "./team-switcher";
import { api } from "@/trpc/react";

export default function PrimaryHeaderItem({
  teams,
}: {
  teams: RouterOutputs["teams"]["userTeams"];
}) {
  const { team: teamSlug } = useParams<{ team?: string }>();

  const team = api.teams.teamBySlug.useQuery(
    teamSlug ? { slug: teamSlug } : skipToken,
    {
      initialData: teams.find((team) => team.slug === teamSlug),
    },
  );

  if (!teams.length || !team.data) {
    return (
      <h1 className="text-2xl font-normal uppercase text-[#6358dc]">Studio</h1>
    );
  }

  return <TeamSwitcher team={team.data} teams={teams} />;
}
