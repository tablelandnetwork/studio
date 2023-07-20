import { Search } from "@/components/search";
import db from "@/db/api";
import Session from "@/lib/session";
import { cookies } from "next/headers";
import { Breadcrumbs } from "./breadcrumbs";
import { NavSecondary } from "./nav-secondary";

export default async function HeaderSecondary() {
  const { auth } = await Session.fromCookies(cookies());
  const teams = auth ? await db.teams.teamsByMemberId(auth.user.teamId) : [];

  return (
    <>
      <Breadcrumbs teams={teams} className="px-4 pb-1 pt-3" />
      <header className="sticky top-0 flex flex-col space-y-4 border-b bg-white px-4 py-3">
        <div className="flex">
          <NavSecondary teams={teams} />
          <div className="ml-auto flex items-center space-x-4">
            <Search placeholder="Search Project Blueprints..." />
          </div>
        </div>
      </header>
    </>
  );
}
