"use client";

import { type RouterOutputs } from "@tableland/studio-api";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { type schema } from "@tableland/studio-store";
import { useState } from "react";
import { skipToken } from "@tanstack/react-query";
import Image from "next/image";
import NewTeamForm from "./new-team-form";
import NewProjectForm from "@/components/new-project-form";
import TeamSwitcher from "@/components/team-switcher";
import ProjectSwitcher from "@/components/project-switcher";
import { api } from "@/trpc/react";
import logo from "@/public/logo.svg";

export default function PrimaryHeaderItem({
  userTeams,
}: {
  userTeams?: RouterOutputs["teams"]["userTeams"];
}) {
  const { team: teamSlug, project: projectSlug } = useParams<{
    team?: string;
    project?: string;
  }>();
  const [openNewTeamSheet, setOpenNewTeamSheet] = useState(false);
  const [openNewProjectSheet, setOpenNewProjectSheet] = useState(false);
  const router = useRouter();

  const foundTeam = userTeams?.find((team) => team.slug === teamSlug);
  const teamQuery = api.teams.teamBySlug.useQuery(
    teamSlug && !foundTeam ? { slug: teamSlug } : skipToken,
  );
  const team = foundTeam ?? teamQuery.data;

  const foundProjects = foundTeam?.projects;
  const projectsQuery = api.projects.teamProjects.useQuery(
    !foundTeam && team ? { teamId: team.id } : skipToken,
  );
  const projects = foundProjects ?? projectsQuery.data;

  const foundProject = foundProjects?.find(
    (project) => project.slug === projectSlug,
  );
  const projectQuery = api.projects.projectBySlug.useQuery(
    !foundProject && team && projectSlug
      ? { teamId: team.id, slug: projectSlug }
      : skipToken,
  );
  const project = foundProject ?? projectQuery.data;

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
    // TODO: Deal with multiple envs
    router.push(`/${team.slug}/${project.slug}/default`);
  }

  function onNewProjectSelected() {
    setOpenNewProjectSheet(true);
  }

  function onNewProjectSuccess(project: schema.Project) {
    if (!team) return;
    router.refresh();
    // TODO: Deal with multiple envs
    router.push(`/${team.slug}/${project.slug}/default`);
  }

  const items: React.ReactNode[] = [
    <Link href="/" key="logo" className="shrink-0">
      <Image src={logo} alt="Tableland Studio" priority={true} />
    </Link>,
  ];

  if (team) {
    items.push(
      <p className="text-lg text-slate-300" key="divider-1">
        /
      </p>,
      <TeamSwitcher
        selectedTeam={team}
        teams={userTeams}
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
          projects={projects}
          onProjectSelected={onProjectSelected}
          onNewProjectSelected={foundTeam ? onNewProjectSelected : undefined}
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
  }

  return <div className="flex flex-row items-center gap-x-3">{items}</div>;
}
