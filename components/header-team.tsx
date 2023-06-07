import dynamic from "next/dynamic";
import Link from "next/link";

import MesaSvg from "@/components/mesa-svg";
import { NavTeam } from "@/components/nav-team";
import { Search } from "@/components/search";
import { Team } from "@/db/schema";
import TeamSwitcher from "./team-switcher";

const NavUser = dynamic(() => import("./nav-user").then((res) => res.NavUser), {
  ssr: false,
});

export default function HeaderTeam({
  personalTeam,
  team,
  teams,
}: {
  team: Team;
  teams: Team[];
  personalTeam: Team;
}) {
  return (
    <header className="sticky top-0 flex flex-col space-y-4 border-b bg-white px-4 py-3">
      <div className="flex items-center justify-start gap-x-4">
        <Link href="/">
          <MesaSvg />
        </Link>
        <TeamSwitcher team={team} teams={teams} />
        <div className="ml-auto flex items-center space-x-4">
          <NavUser personalTeam={personalTeam} />
        </div>
      </div>
      <div className="flex">
        <NavTeam team={team} />
        <div className="ml-auto flex items-center space-x-4">
          <Search placeholder="Search Project Blueprints..." />
        </div>
      </div>
      {/* <nav></nav> */}
    </header>
  );
}
