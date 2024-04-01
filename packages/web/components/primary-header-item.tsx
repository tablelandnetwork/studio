"use client";

import { type RouterOutputs } from "@tableland/studio-api";
import { useParams, useRouter } from "next/navigation";
import { type schema } from "@tableland/studio-store";
import { skipToken } from "@tanstack/react-query";
import TeamSwitcher from "./team-switcher";
import { api } from "@/trpc/react";

export default function PrimaryHeaderItem({
  teams,
}: {
  teams: RouterOutputs["teams"]["userTeams"];
}) {
  const { team: teamSlug } = useParams<{ team?: string }>();
  const router = useRouter();

  const { data: team } = api.teams.teamBySlug.useQuery(
    teamSlug ? { slug: teamSlug } : skipToken,
    {
      initialData: teams.find((team) => team.slug === teamSlug),
    },
  );

  function onTeamSelected(team: schema.Team) {
    router.push(`/${team.slug}`);
  }

  function onNewTeamSelected() {
    router.push("/new-team");
  }

  if (!teams.length || !team) {
    return (
      <h1 className="text-2xl font-normal uppercase text-[#6358dc]">Studio</h1>
    );
  }

  return (
    <TeamSwitcher
      selectedTeam={team}
      teams={teams}
      onTeamSelected={onTeamSelected}
      onNewTeamSelected={onNewTeamSelected}
    />
  );
}
