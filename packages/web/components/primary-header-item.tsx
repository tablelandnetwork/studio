"use client";

import { teamBySlug } from "@/app/actions";
import { api } from "@/trpc/server-invoker";
import { schema } from "@tableland/studio-store";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import TeamSwitcher from "./team-switcher";

export default function PrimaryHeaderItem({
  teams,
}: {
  teams: Awaited<ReturnType<typeof api.teams.userTeams.query>>;
}) {
  const { team: teamSlug } = useParams<{ team?: string }>();
  const [team, setTeam] = useState<schema.Team | undefined>(
    teams.find((team) => team.slug === teamSlug),
  );
  useEffect(() => {
    const getTeam = async (slug: string) => {
      const team = await teamBySlug(slug);
      setTeam(team);
    };
    if (!!teams.length && !team && teamSlug) {
      getTeam(teamSlug);
    }
  }, [team, teamSlug, teams.length]);

  if (!teams.length || !team) {
    return (
      <h1 className="text-2xl font-normal uppercase text-fuchsia-800">
        Studio
      </h1>
    );
  }

  return <TeamSwitcher team={team} teams={teams} />;
}
