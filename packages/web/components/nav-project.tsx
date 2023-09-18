"use client";

import { cn } from "@/lib/utils";
import { api } from "@/trpc/server-invoker";
import { schema } from "@tableland/studio-store";
import Link from "next/link";
import { useParams, usePathname } from "next/navigation";
import { useCallback } from "react";

function projectLinks(team: schema.Team, project: schema.Project) {
  return [
    { label: "Blueprint", href: `/${team.slug}/${project.slug}` },
    { label: "Deployments", href: `/${team.slug}/${project.slug}/deployments` },
    { label: "Settings", href: `/${team.slug}/${project.slug}/settings` },
  ];
}

export default function NavProject({
  className,
  teams,
  ...props
}: React.HTMLAttributes<HTMLElement> & {
  teams: Awaited<ReturnType<typeof api.teams.userTeams.query>>;
}) {
  const pathname = usePathname();
  const { team: teamSlug, project: projectSlug } = useParams();
  const navItemClassName = useCallback(
    (path: string) => {
      return cn(
        "text-sm font-medium transition-colors hover:text-primary",
        pathname !== path && "text-muted-foreground",
      );
    },
    [pathname],
  );

  const team = teams.find((team) => team.slug === teamSlug);
  if (!team) {
    return null;
  }
  const project = team.projects.find((project) => project.slug === projectSlug);
  if (!project) {
    return null;
  }

  return (
    <nav
      className={cn("flex items-center space-x-4 lg:space-x-6", className)}
      {...props}
    >
      {projectLinks(team, project).map((link) => (
        <Link
          key={link.href}
          href={link.href}
          className={navItemClassName(link.href)}
        >
          {link.label}
        </Link>
      ))}
    </nav>
  );
}
