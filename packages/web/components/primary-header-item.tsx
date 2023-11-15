"use client";

import { type RouterOutputs } from "@tableland/studio-api";
import { useParams } from "next/navigation";
import TeamSwitcher from "./team-switcher";
import { api } from "@/trpc/react";

export default function PrimaryHeaderItem({
  teams,
}: {
  teams: RouterOutputs["teams"]["userTeams"];
}) {
  const { team: teamSlug } = useParams<{ team?: string }>();

  const team = api.teams.teamBySlug.useQuery(
    { slug: teamSlug! },
    {
      enabled: !!teamSlug,
      initialData: teams.find((team) => team.slug === teamSlug),
    },
  );

  if (!teams.length || !team.data) {
    return (
      <h1 className="text-2xl font-normal uppercase text-fuchsia-800">
        Studio
      </h1>
    );
  }

  return <TeamSwitcher team={team.data} teams={teams} />;
}
