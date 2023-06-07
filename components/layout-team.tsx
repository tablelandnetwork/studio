import { Team } from "@/db/schema";
import { Auth } from "@/lib/withSession";
import HeaderTeam from "./header-team";
import LayoutBase from "./layout-base";

export default function LayoutTeam({
  children,
  team,
  teams,
  auth,
  personalTeam,
}: {
  children: React.ReactNode;
  team: Team;
  teams: Team[];
  auth: Auth | null;
  personalTeam: Team;
}) {
  return (
    <LayoutBase auth={auth}>
      <HeaderTeam team={team} personalTeam={personalTeam} teams={teams} />
      {children}
    </LayoutBase>
  );
}
