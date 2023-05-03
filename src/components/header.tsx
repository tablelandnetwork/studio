import dynamic from "next/dynamic";
import Link from "next/link";

import MesaSvg from "@/components/mesa-svg";
import { Team } from "@/db/schema";

export default function Header({ personalTeam }: { personalTeam?: Team }) {
  const Login = dynamic(
    () => import("@/components/login").then((res) => res.default),
    { ssr: false }
  );
  const UserNav = dynamic(
    () => import("@/components/nav-user").then((res) => res.UserNav),
    { ssr: false }
  );
  return (
    <header className="flex items-center justify-between px-4 py-3">
      <div className="flex flex-row items-center gap-x-2">
        <MesaSvg />
        <h1 className="text-2xl font-normal uppercase text-fuchsia-800">
          Studio
        </h1>
      </div>
      <div className="ml-auto flex items-center space-x-4">
        <nav>
          {personalTeam && (
            <Link
              href={`/${personalTeam.slug}/projects`}
              className="text-sm font-medium text-muted-foreground transition-colors hover:text-primary"
            >
              Dashboard
            </Link>
          )}
        </nav>
        {personalTeam ? <UserNav personalTeam={personalTeam} /> : <Login />}
      </div>
    </header>
  );
}
