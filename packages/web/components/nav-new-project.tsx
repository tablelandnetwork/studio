"use client";

import { teamBySlug } from "@/app/actions";
import { schema } from "@tableland/studio-store";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import Crumb from "./crumb";

export default function NavNewProject({
  className,
}: React.HTMLAttributes<HTMLElement> & {}) {
  const { team: teamSlug } = useParams<{ team: string }>();
  const [team, setTeam] = useState<schema.Team | undefined>(undefined);
  useEffect(() => {
    const getTeam = async () => {
      const team = await teamBySlug(teamSlug);
      setTeam(team);
    };
    getTeam();
  }, [teamSlug]);

  if (!team) {
    return null;
  }

  return (
    <div className={className}>
      <Crumb
        title="New Project"
        items={[{ label: team.name, href: `/${team.slug}` }]}
      />
    </div>
  );
}
