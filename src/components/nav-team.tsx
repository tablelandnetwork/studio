import Link from "next/link";

import { Team } from "@/db/schema";
import { cn } from "@/lib/utils";

export function TeamNav({
  className,
  team,
  ...props
}: React.HTMLAttributes<HTMLElement> & { team: Team }) {
  return (
    <nav
      className={cn("flex items-center space-x-4 lg:space-x-6", className)}
      {...props}
    >
      <Link
        href={`/${team.slug}/projects`}
        className="text-sm font-medium transition-colors hover:text-primary"
      >
        Projects
      </Link>
      <Link
        href="/"
        className="text-sm font-medium text-muted-foreground transition-colors hover:text-primary"
      >
        People
      </Link>
      <Link
        href="/"
        className="text-sm font-medium text-muted-foreground transition-colors hover:text-primary"
      >
        Settings
      </Link>
    </nav>
  );
}
