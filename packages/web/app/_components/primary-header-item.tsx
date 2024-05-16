"use client";

import { type RouterOutputs } from "@tableland/studio-api";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { type schema } from "@tableland/studio-store";
import { useState } from "react";
import NewTeamForm from "./new-team-form";
import NewProjectForm from "@/components/new-project-form";
import TeamSwitcher from "@/components/team-switcher";
import MesaSvg from "@/components/mesa-svg";
import ProjectSwitcher from "@/components/project-switcher";
import { api } from "@/trpc/react";

export default function PrimaryHeaderItem({
  teams,
}: {
  teams: RouterOutputs["teams"]["userTeams"];
}) {
  const { team: teamSlug, project: projectSlug } = useParams<{
    team?: string;
    project?: string;
  }>();
  const [openNewTeamSheet, setOpenNewTeamSheet] = useState(false);
  const [openNewProjectSheet, setOpenNewProjectSheet] = useState(false);
  const router = useRouter();

  const team = teams.find((team) => team.slug === teamSlug);

  const project = team?.projects.find(
    (project) => project.slug === projectSlug,
  );
  function onTeamSelected(team: schema.Team) {
    router.push(`/${team.slug}`);
  }

  function onNewTeamSelected() {
    setOpenNewTeamSheet(true);
  }

  function onNewTeamSuccess(team: schema.Team) {
    router.refresh();
    router.push(`/${team.slug}`);
  }

  function onProjectSelected(project: schema.Project) {
    if (!team) return;
    router.push(`/${team.slug}/${project.slug}`);
  }

  function onNewProjectSelected() {
    setOpenNewProjectSheet(true);
  }

  function onNewProjectSuccess(project: schema.Project) {
    if (!team) return;
    router.refresh();
    router.push(`/${team.slug}/${project.slug}`);
  }

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
      <TeamSwitcher
        selectedTeam={team}
        teams={teams}
        onTeamSelected={onTeamSelected}
        onNewTeamSelected={onNewTeamSelected}
        key="team-switcher"
      />,
      <NewTeamForm
        onSuccess={onNewTeamSuccess}
        open={openNewTeamSheet}
        onOpenChange={setOpenNewTeamSheet}
        key="new-team-form"
      />,
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
          onProjectSelected={onProjectSelected}
          onNewProjectSelected={onNewProjectSelected}
          key="project-switcher"
        />,
        <NewProjectForm
          team={team}
          open={openNewProjectSheet}
          onOpenChange={setOpenNewProjectSheet}
          onSuccess={onNewProjectSuccess}
          key="new-project-form"
        />,
      );
    }
  } else {
    items.push(
      <h1
        className="text-2xl font-normal uppercase text-[#6358dc]"
        key="studio"
      >
        Studio
      </h1>,
    );
  }

  return <div className="flex flex-row items-center gap-x-3">{items}</div>;
}
