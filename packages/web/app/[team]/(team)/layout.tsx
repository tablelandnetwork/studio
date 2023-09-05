import NavTeam from "@/components/nav-team";
import { Search } from "@/components/search";
import { api } from "@/trpc/server-invoker";

export default async function LayoutTeam({
  children,
}: {
  children: React.ReactNode;
}) {
  var teams: Awaited<ReturnType<typeof api.teams.userTeams.query>> = [];
  try {
    teams = await api.teams.userTeams.query();
  } catch {}

  return (
    <div>
      <header className="sticky top-0 flex flex-col space-y-4 border-b bg-white px-4 py-3">
        <div className="flex">
          <NavTeam teams={teams} />
          <div className="ml-auto flex items-center space-x-4">
            <Search placeholder="Search Project Blueprints..." />
          </div>
        </div>
      </header>
      {children}
    </div>
  );
}
