"use client";

import { projectByTeamIdAndSlug, teamBySlug } from "@/app/actions";
import { cn } from "@/lib/utils";
import { schema } from "@tableland/studio-store";
import Link from "next/link";
import { useParams, usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import Crumb from "./crumb";

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
  const [team, setTeam] = useState<schema.Team | undefined>(undefined);
  const [project, setProject] = useState<schema.Project | undefined>(undefined);
  const pathname = usePathname();

  useEffect(() => {
    const getTeam = async () => {
      const team = await teamBySlug(teamSlug);
      setTeam(team);
    };
    getTeam();
  }, [teamSlug]);

  useEffect(() => {
    const getProject = async (teamId: string) => {
      const project = await projectByTeamIdAndSlug(teamId, projectSlug);
      setProject(project);
    };
    if (team) {
      getProject(team.id);
    }
  }, [projectSlug, team]);

  if (!team || !project) {
    return null;
  }

  return (
    <div>
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
  );
}
