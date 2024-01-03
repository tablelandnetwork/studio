"use client";

import { type RouterOutputs } from "@tableland/studio-api";
import { useParams } from "next/navigation";
import Link from "next/link";
import TeamSwitcher from "./team-switcher";
import MesaSvg from "./mesa-svg";
import ProjectSwitcher from "./project-switcher";

export default function PrimaryHeaderItem({
  teams,
}: {
  teams: RouterOutputs["teams"]["userTeams"];
}) {
  const { team: teamSlug, project: projectSlug } = useParams<{
    team?: string;
    project?: string;
  }>();

  // const team = api.teams.teamBySlug.useQuery(
  //   { slug: teamSlug! },
  //   {
  //     enabled: !!teamSlug,
  //     initialData: teams.find((team) => team.slug === teamSlug),
  //   },
  // );

  const team = teams.find((team) => team.slug === teamSlug);

  // const project = api.projects.projectBySlug.useQuery(
  //   { teamId: team.data!.id, slug: projectSlug! },
  //   {
  //     enabled: !!projectSlug && !!team.data?.id,
  //     initialData: teams
  //       .find((team) => team.slug === teamSlug)
  //       ?.projects.find((project) => project.slug === projectSlug),
  //   },
  // );

  const project = team?.projects.find(
    (project) => project.slug === projectSlug,
  );

  const items: React.ReactNode[] = [
    <Link href="/" key="logo">
      <MesaSvg />
    </Link>,
  ];

  if (team) {
    items.push(
      <p className="text-lg text-slate-300" key="divider-1">
        /
      </p>,
      <TeamSwitcher team={team} teams={teams} key="team-switcher" />,
    );
    if (project) {
      items.push(
        <p className="text-lg text-slate-300" key="divder-2">
          /
        </p>,
        <ProjectSwitcher
          team={team}
          selectedProject={project}
          projects={team.projects}
          key="project-switcher"
        />,
      );
    }
  } else {
    items.push(
      <h1
        className="text-2xl font-normal uppercase text-fuchsia-800"
        key="studio"
      >
        Studio
      </h1>,
    );
  }

  return <div className="flex flex-row items-center gap-x-3">{items}</div>;
}
