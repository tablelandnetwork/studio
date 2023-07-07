"use client";

import { Team } from "@/db/schema";
import { Auth } from "@/lib/session";
import { useParams } from "next/navigation";
import TeamSwitcher from "./team-switcher";

export default function PrimaryHeaderItem({
  auth,
  teams,
}: {
  auth?: Auth;
  teams: Team[];
}) {
  const { team, project } = useParams();
  if (!!!team) {
    return (
      <h1 className="text-2xl font-normal uppercase text-fuchsia-800">
        Studio
      </h1>
    );
  }
  if (auth && !!team && !!!project) {
    return <TeamSwitcher team={auth.personalTeam} teams={teams} />;
  }
  if (!!team && !!project) {
    return <p>project switcher</p>;
  }
  // return (
  //   <div>
  //     <p>{pathname}</p>
  //     <p>{team}</p>
  //     <p>{selectedLayoutSegment}</p>
  //     <p>{selectedLayoutSegments}</p>
  //   </div>
  // );
}
