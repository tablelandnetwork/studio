"use client";

import { useParams } from "next/navigation";
import { skipToken } from "@tanstack/react-query";
import Crumb from "./crumb";
import { api } from "@/trpc/react";

export default function NavTable({
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
  const { data: project } = api.projects.projectBySlug.useQuery(
    team ? { teamId: team.id, slug: projectSlug } : skipToken,
  );
  const { data: table } = api.tables.tableByProjectIdAndSlug.useQuery(
    project ? { projectId: project.id, slug: tableSlug } : skipToken,
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
