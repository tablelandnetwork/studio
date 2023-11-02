"use client";

import { api } from "@/trpc/react";
import { useParams } from "next/navigation";
import Crumb from "./crumb";

export default function NavNewTable({
  crumbTitle,
  className,
}: React.HTMLAttributes<HTMLElement> & { crumbTitle: string }) {
  const { team: teamSlug, project: projectSlug } = useParams<{
    team: string;
    project: string;
  }>();

  const team = api.teams.teamBySlug.useQuery({ slug: teamSlug });
  const project = api.projects.projectByTeamIdAndSlug.useQuery(
    { teamId: team.data!.id, slug: projectSlug },
    { enabled: !!team.data },
  );

  if (!team.data || !project.data) {
    return null;
  }

  return (
    <div className={className}>
      <Crumb
        title={crumbTitle}
        items={[
          { label: team.data.name, href: `/${team.data.slug}` },
          {
            label: project.data.name,
            href: `/${team.data.slug}/${project.data.slug}`,
          },
        ]}
      />
    </div>
  );
}
