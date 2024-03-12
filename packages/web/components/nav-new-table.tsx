"use client";

import { useParams } from "next/navigation";
import Crumb from "./crumb";
import { api } from "@/trpc/react";
import { cn } from "@/lib/utils";

export default function NavNewTable({
  crumbTitle,
  className,
}: React.HTMLAttributes<HTMLElement> & { crumbTitle: string }) {
  const { team: teamSlug, project: projectSlug } = useParams<{
    team: string;
    project: string;
  }>();

  const { data: team } = api.teams.teamBySlug.useQuery({ slug: teamSlug });
  const teamId = team?.id;
  const { data: project } = api.projects.projectBySlug.useQuery(
    { teamId, slug: projectSlug },
    { enabled: !!teamId },
  );

  if (!team || !project) {
    return (
      <div className={cn("flex flex-col", className)}>
        <div className="mb-1 h-6 w-32 animate-pulse rounded bg-gray-200"></div>
      </div>
    );
  }

  return (
    <div className={className}>
      <Crumb
        title={crumbTitle}
        items={[
          { label: team.name, href: `/${team.slug}` },
          {
            label: project.name,
            href: `/${team.slug}/${project.slug}`,
          },
        ]}
      />
    </div>
  );
}
