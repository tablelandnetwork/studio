"use client";

import { useParams } from "next/navigation";
import { skipToken } from "@tanstack/react-query";
import Crumb from "./crumb";
import { api } from "@/trpc/react";

export default function NavDef({
  className,
}: React.HTMLAttributes<HTMLElement>) {
  const {
    team: teamSlug,
    project: projectSlug,
    def: defSlug,
  } = useParams<{
    team: string;
    project: string;
    def: string;
  }>();

  // TODO: Create a single endpoint for this.
  const { data: team } = api.teams.teamBySlug.useQuery({ slug: teamSlug });
  const { data: project } = api.projects.projectBySlug.useQuery(
    team ? { teamId: team.id, slug: projectSlug } : skipToken,
  );
  const { data: def } = api.defs.defByProjectIdAndSlug.useQuery(
    project ? { projectId: project.id, slug: defSlug } : skipToken,
  );

  if (!team || !project || !def) {
    return null;
  }

  return (
    <div className={className}>
      <Crumb
        title={def.name}
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
