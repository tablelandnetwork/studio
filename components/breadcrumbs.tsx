"use client";

import db from "@/db/api";
import { cn } from "@/lib/utils";
import { ChevronLeft } from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { Button } from "./ui/button";

export function Breadcrumbs({
  className,
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
    router.back();
  };

  if (!project) {
    return null;
  }

  return (
    <div className={cn("flex flex-col", className)} {...props}>
      <div className="flex items-center space-x-1">
        <Button variant="ghost" size="sm" className="px-0" onClick={handleBack}>
          <ChevronLeft />
        </Button>
        <h1 className="text-2xl">{project.name}</h1>
      </div>
      <p>{project.description}</p>
    </div>
  );
}
