import MesaSvg from "@/components/mesa-svg";
import { Team } from "@/db/schema";
import dynamic from "next/dynamic";
import Link from "next/link";
import { NextRouter } from "next/router";

export default function Header({
  personalTeam,
  loginSuccessRouterCallback,
}: {
  personalTeam?: Team;
  loginSuccessRouterCallback?: (router: NextRouter) => void;
}) {
  const Login = dynamic(
    () => import("@/components/login").then((res) => res.default),
    { ssr: false }
  );
  const NavUser = dynamic(
    () => import("@/components/nav-user").then((res) => res.NavUser),
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
        {personalTeam ? (
          <NavUser personalTeam={personalTeam} />
        ) : (
          <Login successRouterCallback={loginSuccessRouterCallback} />
        )}
      </div>
    </header>
  );
}
