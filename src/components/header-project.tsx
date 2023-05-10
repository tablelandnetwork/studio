import dynamic from "next/dynamic";
import Link from "next/link";

import MesaSvg from "@/components/mesa-svg";
import { ProjectNav } from "@/components/nav-project";
import ProjectSwitcher from "@/components/project-switcher";
import { Search } from "@/components/search";
import TeamButton from "@/components/team-button";
import { Project, Team } from "@/db/schema";

const UserNav = dynamic(() => import("./nav-user").then((res) => res.UserNav), {
  ssr: false,
});

export default function Header({
  personalTeam,
  team,
  project,
}: {
  team: Team;
  personalTeam: Team;
  project: Project;
}) {
  return (
    <header className="sticky top-0 flex flex-col space-y-4 border-b bg-white px-4 py-3">
      <div className="flex items-center justify-start gap-x-4">
        <Link href="/">
          <MesaSvg />
        </Link>
        <div className="flex items-center justify-start">
          <TeamButton team={team} />
          <p className="text-sm text-muted-foreground">/</p>
          <ProjectSwitcher team={team} selectedProject={project} />
        </div>
        <div className="ml-auto flex items-center space-x-4">
          <UserNav personalTeam={personalTeam} />
        </div>
      </div>
      <div className="flex">
        <ProjectNav project={project} team={team} />
        <div className="ml-auto flex items-center space-x-4">
          <Search placeholder="Search Project Blueprints..." />
        </div>
      </div>
      {/* <nav></nav> */}
    </header>
  );
}
