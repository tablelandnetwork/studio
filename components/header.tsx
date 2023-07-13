import MesaSvg from "@/components/mesa-svg";
import db from "@/db/api";
import Session from "@/lib/session";
import dynamic from "next/dynamic";
import { cookies } from "next/headers";
import Link from "next/link";
import PrimaryHeaderItem from "./primary-header-item";

const UserActions = dynamic(
  () => import("@/components/user-actions").then((res) => res.default),
  { ssr: false }
);

export default async function Header() {
  const { auth } = await Session.fromCookies(cookies());
  const teams = auth ? await db.teams.teamsByMemberId(auth.user.teamId) : [];

  return (
    <header className="flex items-center justify-between px-4 py-3">
      <div className="flex flex-row items-center gap-x-2">
        <Link href="/">
          <MesaSvg />
        </Link>
        <PrimaryHeaderItem auth={auth} teams={teams} />
      </div>
      <div className="ml-auto flex items-center space-x-4">
        <nav>
          {auth?.personalTeam && (
            <Link
              href={`/${auth.personalTeam.slug}`}
              className="text-sm font-medium text-muted-foreground transition-colors hover:text-primary"
            >
              Dashboard
            </Link>
          )}
        </nav>
        <UserActions personalTeam={auth?.personalTeam} />
      </div>
    </header>
  );
}
