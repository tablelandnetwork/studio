"use client";

import { useParams } from "next/navigation";
import Crumb from "./crumb";
import { api } from "@/trpc/react";
import { cn } from "@/lib/utils";

export default function NavNewProject({
  className,
}: React.HTMLAttributes<HTMLElement> & Record<string, unknown>) {
  const { team: teamSlug } = useParams<{ team: string }>();
  const team = api.teams.teamBySlug.useQuery({ slug: teamSlug });

  if (!team.data) {
    return (
      <div className={cn("flex flex-col", className)}>
        <div className="mb-1 h-6 w-32 animate-pulse rounded bg-gray-200"></div>
      </div>
    );
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
