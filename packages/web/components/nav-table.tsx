"use client";

import {
  projectByTeamIdAndSlug,
  tableByProjectIdAndSlug,
  teamBySlug,
} from "@/app/actions";
import { schema } from "@tableland/studio-store";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import Crumb from "./crumb";

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
  const [team, setTeam] = useState<schema.Team | undefined>(undefined);
  const [project, setProject] = useState<schema.Project | undefined>(undefined);
  const [table, setTable] = useState<schema.Table | undefined>(undefined);

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

  useEffect(() => {
    const getTable = async (projectId: string) => {
      const table = await tableByProjectIdAndSlug(projectId, tableSlug);
      setTable(table);
    };
    if (project) {
      getTable(project.id);
    }
  }, [project, tableSlug]);

  if (!team || !project || !table) {
    return null;
  }

  return (
    <div className={className}>
      <Crumb
        title={table.name}
        items={[
          { label: team.name, href: `/${team.slug}` },
          { label: project.name, href: `/${team.slug}/${project.slug}` },
        ]}
      />
    </div>
  );
}
