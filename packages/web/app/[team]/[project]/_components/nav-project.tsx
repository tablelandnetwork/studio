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
  env: schema.Environment,
  includeSettings: boolean,
) {
  const links: Array<{
    label: string;
    href: string;
    isActive: (pathname: string) => boolean;
  }> = [
    {
      label: "Tables",
      href: `/${team.slug}/${project.slug}/${env.slug}`,
      isActive: (pathname) =>
        pathname.includes(`/${team.slug}/${project.slug}/${env.slug}`),
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
  const {
    team: teamSlug,
    project: projectSlug,
    env: envSlug,
  } = useParams<{
    team: string;
    project: string;
    env?: string;
  }>();
  const pathname = usePathname();

  const { data: team } = api.teams.teamBySlug.useQuery({ slug: teamSlug });
  const { data: project } = api.projects.projectBySlug.useQuery(
    team ? { teamId: team.id, slug: projectSlug } : skipToken,
  );
  const { data: env } = api.environments.environmentBySlug.useQuery(
    project && envSlug ? { projectId: project.id, slug: envSlug } : skipToken,
  );
  const { data: envs } = api.environments.projectEnvironments.useQuery(
    project && !env ? { projectId: project.id } : skipToken,
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
        {(!!env || (!!envs && envs.length > 0)) && (
          <nav
            className={cn(
              "flex items-center space-x-4 lg:space-x-6",
              className,
            )}
            {...props}
          >
            {projectLinks(team, project, env ?? envs![0], !!authorization).map(
              (link) => (
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
              ),
            )}
          </nav>
        )}
      </div>
      <Share className="ml-auto self-end" project={project} />
    </div>
  );
}
