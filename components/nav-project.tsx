import Link from "next/link";

import { Project } from "@/db/schema";
import { cn } from "@/lib/utils";

export function NavProject({
  className,
  project,
  ...props
}: React.HTMLAttributes<HTMLElement> & { project: Project }) {
  return (
    <nav
      className={cn("flex items-center space-x-4 lg:space-x-6", className)}
      {...props}
    >
      <Link
        href={"/"}
        className="text-sm font-medium transition-colors hover:text-primary"
      >
        Tables
      </Link>
      <Link
        href="/"
        className="text-sm font-medium text-muted-foreground transition-colors hover:text-primary"
      >
        Deployments
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
