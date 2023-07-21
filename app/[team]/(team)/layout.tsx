import NavTeam from "@/components/nav-team";
import { Search } from "@/components/search";
import db from "@/db/api";
import Session from "@/lib/session";
import { cookies } from "next/headers";

export default async function LayoutTeam({
  children,
}: {
  children: React.ReactNode;
}) {
  const { auth } = await Session.fromCookies(cookies());
  const teams = auth ? await db.teams.teamsByMemberId(auth.user.teamId) : [];

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
