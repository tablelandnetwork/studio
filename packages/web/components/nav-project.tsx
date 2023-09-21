"use client";

import { cn } from "@/lib/utils";
import { api } from "@/trpc/server-invoker";
import { schema } from "@tableland/studio-store";
import Link from "next/link";
import { useParams, usePathname } from "next/navigation";

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
  teams,
  ...props
}: React.HTMLAttributes<HTMLElement> & {
  teams: Awaited<ReturnType<typeof api.teams.userTeams.query>>;
}) {
  const pathname = usePathname();
  const { team: teamSlug, project: projectSlug } = useParams();
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
  );
}
