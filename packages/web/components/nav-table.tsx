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
  const team = api.teams.teamBySlug.useQuery({ slug: teamSlug });
  const project = api.projects.projectBySlug.useQuery(
    { teamId: team.data!.id, slug: projectSlug },
    { enabled: !!team.data },
  );
  const table = api.tables.tableByProjectIdAndSlug.useQuery(
    { projectId: project.data!.id, slug: tableSlug },
    { enabled: !!project.data },
  );

  if (!team.data || !project.data || !table.data) {
    return null;
  }

  return (
    <div className={className}>
      <Crumb
        title={table.data.name}
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
