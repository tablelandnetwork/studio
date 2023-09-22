import { CrumbProject } from "@/components/crumb-project";
import NavProject from "@/components/nav-project";
import { api } from "@/trpc/server-invoker";
import { cache } from "react";

export default async function ProjectLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  var teams: Awaited<ReturnType<typeof api.teams.userTeams.query>> = [];
  try {
    teams = await cache(api.teams.userTeams.query)();
  } catch {}
  return (
    <div className="flex flex-1 flex-col">
      <CrumbProject teams={teams} className="px-4 pb-1 pt-3" />
      <header className="sticky top-0 flex flex-col space-y-4 border-b bg-white px-4 py-3">
        <div className="flex">
          <NavProject teams={teams} />
        </div>
      </header>
      {children}
    </div>
  );
}
