import dynamic from "next/dynamic";
import { Team } from "@/db/schema";
import { TeamNav } from "./team-nav";
import { Search } from "./search";
import TeamSwitcher from "./team-switcher";
import MesaSvg from "./mesa-svg";
import Link from "next/link";
// import { UserNav } from "./user-nav";

const UserNav = dynamic(() => import("./user-nav").then((res) => res.UserNav), {
  ssr: false,
});

export default function Header({
  userId,
  personalTeam,
  team,
}: {
  userId: string;
  team: Team;
  personalTeam: Team;
}) {
  return (
    <header className="px-4 py-3 flex flex-col space-y-4 border-b sticky top-0 bg-white">
      <div className="flex justify-start items-center">
        <Link href="/">
          <MesaSvg />
        </Link>
        <TeamSwitcher team={team} />
        <div className="ml-auto flex items-center space-x-4">
          <UserNav personalTeam={personalTeam} />
        </div>
      </div>
      <div className="flex">
        <TeamNav />
        <div className="ml-auto flex items-center space-x-4">
          <Search placeholder="Search Project Blueprints..." />
        </div>
      </div>
      {/* <nav></nav> */}
    </header>
  );
}
