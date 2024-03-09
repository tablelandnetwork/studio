"use client";

import { useParams } from "next/navigation";
import Crumb from "./crumb";
import { api } from "@/trpc/react";

export default function NavNewTable({
  className,
}: React.HTMLAttributes<HTMLElement>) {
  const {
    team: teamSlug,
    project: projectSlug,
    table: tableSlug,
  } = useParams<{
    team: string;
    project: string;
    table: string;
  }>();

  // TODO: Create a single endpoint for this.
  const { data: team } = api.teams.teamBySlug.useQuery({ slug: teamSlug });
  const teamId = team?.id;
  const { data: project } = api.projects.projectBySlug.useQuery(
    { teamId, slug: projectSlug },
    { enabled: !!teamId },
  );
  const projectId = project?.id;
  const { data: table } = api.tables.tableByProjectIdAndSlug.useQuery(
    { projectId: projectId!, slug: tableSlug },
    { enabled: !!projectId },
  );

  if (!team || !project || !table) {
    return null;
  }

  return (
    <div className={className}>
      <Crumb
        title={table.name}
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
