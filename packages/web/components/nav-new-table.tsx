"use client";

import { useParams } from "next/navigation";
import Crumb from "./crumb";
import { api } from "@/trpc/react";

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
    return null;
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
