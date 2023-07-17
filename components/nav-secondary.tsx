"use client";

import db from "@/db/api";
import { Project, Team } from "@/db/schema";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { useParams, usePathname } from "next/navigation";
import { useCallback } from "react";

function teamLinks(team: Team) {
  const links = [
    { label: "Projects", href: `/${team.slug}` },
    { label: "People", href: `/${team.slug}/people` },
    { label: "Settings", href: `/${team.slug}/settings` },
  ];
  if (team.personal) {
    links.splice(1, 1);
  }
  return links;
}

function projectLinks(team: Team, project: Project) {
  return [
    { label: "Schema", href: `/${team.slug}/${project.slug}` },
    { label: "Deployments", href: `/${team.slug}/${project.slug}/deployments` },
    { label: "Settings", href: `/${team.slug}/${project.slug}/settings` },
  ];
}

export function NavSecondary({
  className,
  teams,
  ...props
}: React.HTMLAttributes<HTMLElement> & {
  teams: Awaited<ReturnType<typeof db.teams.teamsByMemberId>>;
}) {
  const pathname = usePathname();
  const { team: teamSlug, project: projectSlug } = useParams();
  const navItemClassName = useCallback(
    (path: string) => {
      return cn(
        "text-sm font-medium transition-colors hover:text-primary",
        pathname !== path && "text-muted-foreground"
      );
    },
    [pathname]
  );

  const team = teams.find((team) => team.slug === teamSlug);
  if (!team) {
    return null;
  }
  const project = team.projects.find((project) => project.slug === projectSlug);
  const links = project ? projectLinks(team, project) : teamLinks(team);

  return (
    <nav
      className={cn("flex items-center space-x-4 lg:space-x-6", className)}
      {...props}
    >
      {links.map((link) => (
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
