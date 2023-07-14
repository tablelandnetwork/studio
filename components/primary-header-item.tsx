"use client";

import db from "@/db/api";
import { authAtom } from "@/store/wallet";
import { useAtomValue } from "jotai";
import { useParams } from "next/navigation";
import ProjectSwitcher from "./project-switcher";
import TeamButton from "./team-button";
import TeamSwitcher from "./team-switcher";

export default function PrimaryHeaderItem({
  teams,
}: {
  teams: Awaited<ReturnType<typeof db.teams.teamsByMemberId>>;
}) {
  const auth = useAtomValue(authAtom);
  // NOTE: The team project params can be undefined depending on the url.
  const { team: teamSlug, project: projectSlug } = useParams();

  const team = teams.find((team) => team.slug === teamSlug);

  if (!team) {
    return (
      <h1 className="text-2xl font-normal uppercase text-fuchsia-800">
        Studio
      </h1>
    );
  }

  if (auth && !!!projectSlug) {
    return <TeamSwitcher team={team} teams={teams} />;
  }

  if (!!projectSlug) {
    const project = team.projects.find(
      (project) => project.slug === projectSlug
    );
    if (!project) {
      return null;
    }
    return (
      <>
        <TeamButton team={team} />
        <p className="text-sm text-muted-foreground">/</p>
        <ProjectSwitcher
          selectedProject={project}
          projects={team.projects}
          team={team}
        />
      </>
    );
  }
}
