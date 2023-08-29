import { CrumbProject } from "@/components/crumb-project";
import NavProject from "@/components/nav-project";
import { Search } from "@/components/search";
import { store } from "@/lib/store";
import { Session } from "@tableland/studio-api";
import { cookies } from "next/headers";

export default async function ProjectLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { auth } = await Session.fromCookies(cookies());
  const teams = auth ? await store.teams.teamsByMemberId(auth.user.teamId) : [];
  return (
    <div className="flex flex-1 flex-col">
      <CrumbProject teams={teams} className="px-4 pb-1 pt-3" />
      <header className="sticky top-0 flex flex-col space-y-4 border-b bg-white px-4 py-3">
        <div className="flex">
          <NavProject teams={teams} />
          <div className="ml-auto flex items-center space-x-4">
            <Search placeholder="Search Project Blueprints..." />
          </div>
        </div>
      </header>
      {children}
    </div>
  );
}
