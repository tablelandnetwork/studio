"use client";

import { projectByTeamIdAndSlug, teamBySlug } from "@/app/actions";
import { schema } from "@tableland/studio-store";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Crumb } from "./crumb";

// TODO: Consolidate this with nav-project and make it the new breadcrumb design.
export function CrumbProject({
  ...props
}: React.HTMLAttributes<HTMLElement> & {}) {
  const { team: teamSlug, project: projectSlug } = useParams<{
    team: string;
    project: string;
  }>();
  const [team, setTeam] = useState<schema.Team | undefined>(undefined);
  const [project, setProject] = useState<schema.Project | undefined>(undefined);
  const router = useRouter();

  useEffect(() => {
    const getTeam = async () => {
      const team = await teamBySlug(teamSlug);
      setTeam(team);
    };
    getTeam();
  }, [teamSlug]);

  useEffect(() => {
    const getProject = async (teamId: string) => {
      const project = await projectByTeamIdAndSlug(teamId, projectSlug);
      setProject(project);
    };
    if (team) {
      getProject(team.id);
    }
  }, [projectSlug, team]);

  if (!team || !project) {
    return null;
  }

  const handleBack = () => {
    router.push(`/${team.slug}`);
  };

  return (
    <Crumb
      title={project.name}
      subtitle={project.description}
      onBack={handleBack}
      {...props}
    />
  );
}
