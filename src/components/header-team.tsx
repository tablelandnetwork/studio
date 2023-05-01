import dynamic from "next/dynamic";
import Link from "next/link";

import MesaSvg from "@/components/mesa-svg";
import { TeamNav } from "@/components/nav-team";
import { Search } from "@/components/search";
import TeamSwitcher from "@/components/team-switcher";
import { Team } from "@/db/schema";

const UserNav = dynamic(() => import("./nav-user").then((res) => res.UserNav), {
  ssr: false,
});

export default function Header({
  personalTeam,
  team,
}: {
  team: Team;
  personalTeam: Team;
}) {
  return (
    <header className="px-4 py-3 flex flex-col space-y-4 border-b sticky top-0 bg-white">
      <div className="flex justify-start items-center gap-x-4">
        <Link href="/">
          <MesaSvg />
        </Link>
        <TeamSwitcher team={team} />
        <div className="ml-auto flex items-center space-x-4">
          <UserNav personalTeam={personalTeam} />
        </div>
      </div>
      <div className="flex">
        <TeamNav team={team} />
        <div className="ml-auto flex items-center space-x-4">
          <Search placeholder="Search Project Blueprints..." />
        </div>
      </div>
      {/* <nav></nav> */}
    </header>
  );
}
