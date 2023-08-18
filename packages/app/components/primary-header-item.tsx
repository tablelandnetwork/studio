"use client";

import db from "@/db/api";
import { useParams } from "next/navigation";
import TeamSwitcher from "./team-switcher";

export default function PrimaryHeaderItem({
  teams,
}: {
  teams: Awaited<ReturnType<typeof db.teams.teamsByMemberId>>;
}) {
  // NOTE: The team param can be undefined depending on the url.
  const { team: teamSlug } = useParams();

  const team = teams.find((team) => team.slug === teamSlug);

  if (!team) {
    return (
      <h1 className="text-2xl font-normal uppercase text-fuchsia-800">
        Studio
      </h1>
    );
  }

  return <TeamSwitcher team={team} teams={teams} />;
}
