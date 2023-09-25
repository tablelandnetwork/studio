"use client";

import { projectByTeamIdAndSlug, teamBySlug } from "@/app/actions";
import { schema } from "@tableland/studio-store";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import Crumb from "./crumb";

export default function NavNewTable({
  crumbTitle,
  className,
}: React.HTMLAttributes<HTMLElement> & { crumbTitle: string }) {
  const { team: teamSlug, project: projectSlug } = useParams<{
    team: string;
    project: string;
  }>();
  const [team, setTeam] = useState<schema.Team | undefined>(undefined);
  const [project, setProject] = useState<schema.Project | undefined>(undefined);

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

  return (
    <div className={className}>
      <Crumb
        title={crumbTitle}
        items={[
          { label: team.name, href: `/${team.slug}` },
          { label: project.name, href: `/${team.slug}/${project.slug}` },
        ]}
      />
    </div>
  );
}
