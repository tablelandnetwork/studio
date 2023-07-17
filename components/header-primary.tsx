import MesaSvg from "@/components/mesa-svg";
import db from "@/db/api";
import Session from "@/lib/session";
import dynamic from "next/dynamic";
import { cookies } from "next/headers";
import Link from "next/link";
import { NavPrimary } from "./nav-primary";
import PrimaryHeaderItem from "./primary-header-item";

const UserActions = dynamic(
  () => import("@/components/user-actions").then((res) => res.default),
  { ssr: false }
);

export default async function HeaderPrimary() {
  const { auth } = await Session.fromCookies(cookies());
  const teams = auth ? await db.teams.teamsByMemberId(auth.user.teamId) : [];

  return (
    <header className="flex items-center justify-between px-4 py-3">
      <div className="flex flex-row items-center gap-x-2">
        <Link href="/">
          <MesaSvg />
        </Link>
        <PrimaryHeaderItem teams={teams} />
      </div>
      <div className="ml-auto flex items-center space-x-4">
        <NavPrimary />
        <UserActions />
      </div>
    </header>
  );
}
