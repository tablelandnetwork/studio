"use client";

import Crumb from "@/components/crumb";
import { cn } from "@/lib/utils";
import { api } from "@/trpc/react";
import { schema } from "@tableland/studio-store";
import Link from "next/link";
import { useParams, usePathname } from "next/navigation";
import Share from "./share";

function projectLinks(
  team: schema.Team,
  project: schema.Project,
): { label: string; href: string; isActive: (pathname: string) => boolean }[] {
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
}: React.HTMLAttributes<HTMLElement> & {}) {
  const { team: teamSlug, project: projectSlug } = useParams<{
    team: string;
    project: string;
  }>();
  const pathname = usePathname();

  const { data: team } = api.teams.teamBySlug.useQuery({ slug: teamSlug });
  const teamId = team?.id;
  const { data: project } = api.projects.projectBySlug.useQuery(
    { teamId: teamId!, slug: projectSlug },
    { enabled: !!teamId },
  );

  if (!team || !project) {
    return null;
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
