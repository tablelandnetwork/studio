"use client";

import { type schema } from "@tableland/studio-store";
import Link from "next/link";
import { useParams, usePathname } from "next/navigation";
import { skipToken } from "@tanstack/react-query";
import Share from "./share";
import { api } from "@/trpc/react";
import { cn } from "@/lib/utils";
import Crumb from "@/components/crumb";

function projectLinks(
  team: schema.Team,
  project: schema.Project,
): Array<{
  label: string;
  href: string;
  isActive: (pathname: string) => boolean;
}> {
  return [
    {
      label: "Blueprint",
      href: `/${team.slug}/${project.slug}`,
      isActive: (pathname) => pathname === `/${team.slug}/${project.slug}`,
    },
    {
      label: "Deployments",
      href: `/${team.slug}/${project.slug}/deployments`,
      isActive: (pathname) =>
        pathname.includes(`/${team.slug}/${project.slug}/deployments`),
    },
  ];
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

  if (!team || !project) {
    return (
      <div className={cn("flex flex-col", className)}>
        <div className="mb-2 h-7 w-32 animate-pulse rounded bg-gray-200"></div>
        <nav className="flex items-center space-x-4 lg:space-x-6">
          <div className="h-5 w-24 animate-pulse rounded bg-gray-200"></div>
        </nav>
      </div>
    );
  }

  return (
    <div className="flex flex-1">
      <div className="flex flex-col">
        <Crumb
          title={project.name}
          items={[{ label: team.name, href: `/${team.slug}` }]}
          className="mb-2"
        />
        <nav
          className={cn("flex items-center space-x-4 lg:space-x-6", className)}
          {...props}
        >
          {projectLinks(team, project).map((link) => (
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
