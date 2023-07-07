import MesaSvg from "@/components/mesa-svg";
import { NavProject } from "@/components/nav-project";
import ProjectSwitcher from "@/components/project-switcher";
import { Search } from "@/components/search";
import TeamButton from "@/components/team-button";
import { Project, Team } from "@/db/schema";
import dynamic from "next/dynamic";
import Link from "next/link";

const UserNav = dynamic(
  () => import("./menu-user").then((res) => res.MenuUser),
  {
    ssr: false,
  }
);

export default function HeaderProject({
  personalTeam,
  team,
  project,
  projects,
}: {
  team: Team;
  personalTeam: Team;
  project: Project;
  projects: Project[];
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
          <ProjectSwitcher
            team={team}
            selectedProject={project}
            projects={projects}
          />
        </div>
        <div className="ml-auto flex items-center space-x-4">
          <UserNav personalTeam={personalTeam} />
        </div>
      </div>
      <div className="flex">
        <NavProject project={project} />
        <div className="ml-auto flex items-center space-x-4">
          <Search placeholder="Search Project Blueprints..." />
        </div>
      </div>
      {/* <nav></nav> */}
    </header>
  );
}
