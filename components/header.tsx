import MesaSvg from "@/components/mesa-svg";
import { getServerSession } from "@/lib/withSession";
import dynamic from "next/dynamic";
import Link from "next/link";
import { NavUser } from "./nav-user";

export default async function Header() {
  const { auth } = await getServerSession();

  const Login = dynamic(
    () => import("@/components/login").then((res) => res.default),
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
          {auth?.personalTeam && (
            <Link
              href={`/${auth.personalTeam.slug}/projects`}
              className="text-sm font-medium text-muted-foreground transition-colors hover:text-primary"
            >
              Dashboard
            </Link>
          )}
        </nav>
        {auth?.personalTeam ? (
          <NavUser personalTeam={auth.personalTeam} />
        ) : (
          <Login />
        )}
      </div>
    </header>
  );
}
