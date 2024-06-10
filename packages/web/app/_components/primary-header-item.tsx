"use client";

import { type RouterOutputs } from "@tableland/studio-api";
import { useParams, useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import { type schema } from "@tableland/studio-store";
import { useState } from "react";
import { skipToken } from "@tanstack/react-query";
import Image from "next/image";
import { Database, Folder, User, Users } from "lucide-react";
import NewTeamForm from "./new-team-form";
import NewEnvForm from "./new-env-form";
import NewProjectForm from "@/components/new-project-form";
import TeamSwitcher from "@/components/team-switcher";
import ProjectSwitcher from "@/components/project-switcher";
import { api } from "@/trpc/react";
import logo from "@/public/logo.svg";
import EnvSwitcher from "@/components/env-switcher";

export default function PrimaryHeaderItem({
  userTeams,
}: {
  userTeams?: RouterOutputs["teams"]["userTeams"];
}) {
  const {
    team: teamSlug,
    project: projectSlug,
    env: envSlug,
  } = useParams<{
    team?: string;
    project?: string;
    env?: string;
  }>();
  const [openNewTeamSheet, setOpenNewTeamSheet] = useState(false);
  const [openNewProjectSheet, setOpenNewProjectSheet] = useState(false);
  const [openNewEnvSheet, setOpenNewEnvSheet] = useState(false);
  const router = useRouter();
  const pathname = usePathname();

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

  const envsQuery = api.environments.projectEnvironments.useQuery(
    project ? { projectId: project.id } : skipToken,
  );

  const env = envsQuery.data?.find((env) => env.slug === envSlug);

  const setEnvPreference =
    api.environments.setEnvironmentPreferenceForProject.useMutation();

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

  function onEnvironmentSelected(selectedEnv: schema.Environment) {
    navToEnv(selectedEnv);
    if (!project) return;
    setEnvPreference.mutate({ projectId: project.id, envId: selectedEnv.id });
  }

  function onNewEnvironmentSelected() {
    setOpenNewEnvSheet(true);
  }

  function onNewEnvSuccess(newEnv: schema.Environment) {
    if (!team || !project) return;
    router.refresh();
    navToEnv(newEnv);
    // TODO: Set session record of this change.
  }

  function navToEnv(nextEnv: schema.Environment) {
    if (!team || !project) return;
    const nextPath = env
      ? pathname.replace(
          `/${project.slug}/${env.slug}`,
          `/${project.slug}/${nextEnv.slug}`,
        )
      : `/${team.slug}/${project.slug}/${nextEnv.slug}`;
    router.push(nextPath);
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
      <div key="team-switcher" className="flex items-center gap-x-2">
        {team.personal ? (
          <User className="size-5" />
        ) : (
          <Users className="size-5" />
        )}
        <TeamSwitcher
          selectedTeam={team}
          teams={userTeams}
          onTeamSelected={onTeamSelected}
          onNewTeamSelected={onNewTeamSelected}
        />
      </div>,
      <NewTeamForm
        onSuccess={onNewTeamSuccess}
        open={openNewTeamSheet}
        onOpenChange={setOpenNewTeamSheet}
        key="new-team-form"
      />,
    );
    if (project) {
      items.push(
        <p className="text-lg text-slate-300" key="divider-2">
          /
        </p>,
        <div key="project-switcher" className="flex items-center gap-x-2">
          <Folder className="size-5" />
          <ProjectSwitcher
            team={team}
            selectedProject={project}
            projects={projects}
            onProjectSelected={onProjectSelected}
            onNewProjectSelected={foundTeam ? onNewProjectSelected : undefined}
          />
        </div>,
        <NewProjectForm
          team={team}
          open={openNewProjectSheet}
          onOpenChange={setOpenNewProjectSheet}
          onSuccess={onNewProjectSuccess}
          key="new-project-form"
        />,
      );
    }
    if (project && env) {
      items.push(
        <p className="text-lg text-slate-300" key="divider-3">
          /
        </p>,
        <div key="environment-switcher" className="flex items-center gap-x-2">
          <Database className="size-5" />
          <EnvSwitcher
            team={team}
            project={project}
            selectedEnv={env}
            envs={envsQuery.data}
            onEnvSelected={onEnvironmentSelected}
            onNewEnvSelected={foundTeam ? onNewEnvironmentSelected : undefined}
          />
        </div>,
        <NewEnvForm
          projectId={project.id}
          open={openNewEnvSheet}
          onOpenChange={setOpenNewEnvSheet}
          onSuccess={onNewEnvSuccess}
          key="new-env-form"
        />,
      );
    }
  }

  return <div className="flex flex-row items-center gap-x-5">{items}</div>;
}
