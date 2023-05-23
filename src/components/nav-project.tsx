import Link from "next/link";

import { Project, Team } from "@/db/schema";
import { cn } from "@/lib/utils";
import { useRouter } from "next/router";

export function NavProject({
  className,
  project,
  team,
  ...props
}: React.HTMLAttributes<HTMLElement> & { project: Project; team: Team }) {
  const router = useRouter();

  const currentPage = router.pathname.split("/").reverse()[0];
  return (
    <nav
      className={cn("flex items-center space-x-4 lg:space-x-6", className)}
      {...props}
    >
      <Link
        href={`/${team.slug}/${project.slug}`}
        className={cn(
          "text-sm font-medium transition-colors hover:text-primary",
          currentPage !== "[project]" && "text-muted-foreground"
        )}
      >
        Tables
      </Link>
      <Link
        href={`/${team.slug}/${project.slug}/deployments`}
        className={cn(
          "text-sm font-medium transition-colors hover:text-primary",
          currentPage !== "deployments" && "text-muted-foreground"
        )}
      >
        Deployments
      </Link>
      <Link
        href={`/${team.slug}/${project.slug}/settings`}
        className={cn(
          "text-sm font-medium transition-colors hover:text-primary",
          currentPage !== "settings" && "text-muted-foreground"
        )}
      >
        Settings
      </Link>
    </nav>
  );
}
