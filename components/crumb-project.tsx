"use client";

import db from "@/db/api";
import { useParams, useRouter } from "next/navigation";
import { Crumb } from "./crumb";

export function CrumbProject({
  teams,
  ...props
}: React.HTMLAttributes<HTMLElement> & {
  teams: Awaited<ReturnType<typeof db.teams.teamsByMemberId>>;
}) {
  const { team: teamSlug, project: projectSlug } = useParams();
  const router = useRouter();

  const team = teams.find((team) => team.slug === teamSlug);
  if (!team) {
    return null;
  }
  const project = team.projects.find((project) => project.slug === projectSlug);

  const handleBack = () => {
    router.push(`/${team.slug}`);
  };

  if (!project) {
    return null;
  }

  return (
    <Crumb
      title={project.name}
      subtitle={project.description || undefined}
      onBack={handleBack}
      {...props}
    />
  );
}
