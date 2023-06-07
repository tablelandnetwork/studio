import { Team } from "@/db/schema";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { useRouter } from "next/router";
import { useCallback } from "react";

export function NavTeam({
  className,
  team,
  ...props
}: React.HTMLAttributes<HTMLElement> & { team: Team }) {
  const router = useRouter();

  const navItemClassName = useCallback(
    (path: string) => {
      return cn(
        "text-sm font-medium transition-colors hover:text-primary",
        !router.pathname.endsWith(path) && "text-muted-foreground"
      );
    },
    [router]
  );

  return (
    <nav
      className={cn("flex items-center space-x-4 lg:space-x-6", className)}
      {...props}
    >
      <Link
        href={`/${team.slug}/projects`}
        className={navItemClassName("projects")}
      >
        Projects
      </Link>
      {!team.personal && (
        <Link
          href={`/${team.slug}/people`}
          className={navItemClassName("people")}
        >
          People
        </Link>
      )}
      <Link
        href={`/${team.slug}/settings`}
        className={navItemClassName("settings")}
      >
        Settings
      </Link>
    </nav>
  );
}
