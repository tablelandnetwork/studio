import { Project, Team } from "@/db/schema";
import { Auth } from "@/lib/withSession";
import HeaderProject from "./header-project";
import LayoutBase from "./layout-base";

export default function LayoutProject({
  children,
  team,
  auth,
  personalTeam,
  project,
  projects,
}: {
  children: React.ReactNode;
  team: Team;
  auth: Auth | null;
  personalTeam: Team;
  project: Project;
  projects: Project[];
}) {
  return (
    <LayoutBase auth={auth}>
      <HeaderProject
        team={team}
        personalTeam={personalTeam}
        project={project}
        projects={projects}
      />
      {children}
    </LayoutBase>
  );
}
