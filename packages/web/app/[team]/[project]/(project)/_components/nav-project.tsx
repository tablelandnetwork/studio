"use client";

import { type schema } from "@tableland/studio-store";
import Link from "next/link";
import { useParams, usePathname } from "next/navigation";
import { skipToken } from "@tanstack/react-query";
import Share from "./share";
import { api } from "@/trpc/react";
import { cn } from "@/lib/utils";

function projectLinks(
  team: schema.Team,
  project: schema.Project,
  includeSettings: boolean,
) {
  const links: Array<{
    label: string;
    href: string;
    isActive: (pathname: string) => boolean;
  }> = [
    {
      label: "Definitions",
      href: `/${team.slug}/${project.slug}`,
      isActive: (pathname) => pathname === `/${team.slug}/${project.slug}`,
    },
    {
      label: "Tables",
      href: `/${team.slug}/${project.slug}/tables`,
      isActive: (pathname) =>
        pathname.includes(`/${team.slug}/${project.slug}/tables`),
    },
  ];
  if (includeSettings) {
    links.push({
      label: "Settings",
      href: `/${team.slug}/${project.slug}/settings`,
      isActive: (pathname: string) =>
        pathname.startsWith(`/${team.slug}/${project.slug}/settings`),
    });
  }
  return links;
}

export default function NavProject({
  className,
  ...props
}: React.HTMLAttributes<HTMLElement> & Record<string, unknown>) {
  const { team: teamSlug, project: projectSlug } = useParams<{
    team: string;
    project: string;
  }>();
  const pathname = usePathname();

  const { data: team } = api.teams.teamBySlug.useQuery({ slug: teamSlug });
  const { data: project } = api.projects.projectBySlug.useQuery(
    team ? { teamId: team.id, slug: projectSlug } : skipToken,
  );
  const { data: authorization } = api.teams.isAuthorized.useQuery(
    team ? { teamId: team.id } : skipToken,
  );

  if (!team || !project || !authorization === undefined) {
    return (
      <div className={cn("flex flex-col", className)}>
        <nav className="flex items-center space-x-4 lg:space-x-6">
          <div className="h-5 w-24 animate-pulse rounded bg-gray-200"></div>
        </nav>
      </div>
    );
  }

  return (
    <div className="flex flex-1 items-end">
      <div className="flex flex-col">
        <nav
          className={cn("flex items-center space-x-4 lg:space-x-6", className)}
          {...props}
        >
          {projectLinks(team, project, !!authorization).map((link) => (
            <Link
              key={link.label}
              href={link.href}
              className={cn(
                "text-sm font-medium transition-colors hover:text-primary",
                !link.isActive(pathname) && "text-muted-foreground",
              )}
            >
              {link.label}
            </Link>
          ))}
        </nav>
      </div>
      <Share className="ml-auto self-end" project={project} />
    </div>
  );
}
