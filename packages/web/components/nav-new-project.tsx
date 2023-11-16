"use client";

import { useParams } from "next/navigation";
import Crumb from "./crumb";
import { api } from "@/trpc/react";

export default function NavNewProject({
  className,
}: React.HTMLAttributes<HTMLElement> & Record<string, unknown>) {
  const { team: teamSlug } = useParams<{ team: string }>();
  const team = api.teams.teamBySlug.useQuery({ slug: teamSlug });

  if (!team.data) {
    return null;
  }

  return (
    <div className={className}>
      <Crumb
        title="New Project"
        items={[{ label: team.data.name, href: `/${team.data.slug}` }]}
      />
    </div>
  );
}
