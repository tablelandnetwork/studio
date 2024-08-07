"use client";

import { type RouterOutputs } from "@tableland/studio-api";
import { useParams, useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import { type schema } from "@tableland/studio-store";
import { useState } from "react";
import { skipToken } from "@tanstack/react-query";
import Image from "next/image";
import { Database, Folder, User, Users } from "lucide-react";
import NewOrgForm from "./new-org-form";
import NewEnvForm from "./new-env-form";
import NewProjectForm from "@/components/new-project-form";
import OrgSwitcher from "@/components/org-switcher";
import ProjectSwitcher from "@/components/project-switcher";
import { api } from "@/trpc/react";
import logo from "@/public/logo.svg";
import EnvSwitcher from "@/components/env-switcher";

export default function PrimaryHeaderItem({
  userOrgs,
}: {
  userOrgs?: RouterOutputs["orgs"]["userOrgs"];
}) {
  const {
    org: orgSlug,
    project: projectSlug,
    env: envSlug,
  } = useParams<{
    org?: string;
    project?: string;
    env?: string;
  }>();
  const [openNewOrgSheet, setOpenNewOrgSheet] = useState(false);
  const [openNewProjectSheet, setOpenNewProjectSheet] = useState(false);
  const [openNewEnvSheet, setOpenNewEnvSheet] = useState(false);
  const router = useRouter();
  const pathname = usePathname();

  const foundOrg = userOrgs?.find((org) => org.slug === orgSlug);
  const orgQuery = api.orgs.orgBySlug.useQuery(
    orgSlug && !foundOrg ? { slug: orgSlug } : skipToken,
  );
  const org = foundOrg ?? orgQuery.data;

  const foundProjects = foundOrg?.projects;
  const projectsQuery = api.projects.orgProjects.useQuery(
    !foundOrg && org ? { orgId: org.id } : skipToken,
  );
  const projects = foundProjects ?? projectsQuery.data;

  const foundProject = foundProjects?.find(
    (project) => project.slug === projectSlug,
  );
  const projectQuery = api.projects.projectBySlug.useQuery(
    !foundProject && org && projectSlug
      ? { orgId: org.id, slug: projectSlug }
      : skipToken,
  );
  const project = foundProject ?? projectQuery.data;

  const envsQuery = api.environments.projectEnvironments.useQuery(
    project ? { projectId: project.id } : skipToken,
  );

  const env = envsQuery.data?.find((env) => env.slug === envSlug);

  const setEnvPreference =
    api.environments.setEnvironmentPreferenceForProject.useMutation();

  function onOrgSelected(org: schema.Org) {
    router.push(`/${org.slug}`);
  }

  function onNewOrgSelected() {
    setOpenNewOrgSheet(true);
  }

  function onNewOrgSuccess(org: schema.Org) {
    router.refresh();
    router.push(`/${org.slug}`);
  }

  function onProjectSelected(project: schema.Project) {
    if (!org) return;
    router.push(`/${org.slug}/${project.slug}`);
  }

  function onNewProjectSelected() {
    setOpenNewProjectSheet(true);
  }

  function onNewProjectSuccess(project: schema.Project) {
    if (!org) return;
    router.refresh();
    router.push(`/${org.slug}/${project.slug}`);
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
    if (!org || !project) return;
    router.refresh();
    navToEnv(newEnv);
    // TODO: Set session record of this change.
  }

  function navToEnv(nextEnv: schema.Environment) {
    if (!org || !project) return;
    const nextPath = env
      ? pathname.replace(
          `/${project.slug}/${env.slug}`,
          `/${project.slug}/${nextEnv.slug}`,
        )
      : `/${org.slug}/${project.slug}/${nextEnv.slug}`;
    router.push(nextPath);
  }

  const items: React.ReactNode[] = [
    <Link href="/" key="logo" className="shrink-0">
      <Image
        src={logo}
        alt="Tableland Studio"
        priority={true}
        className="fill-primary stroke-primary"
      />
    </Link>,
  ];

  if (org) {
    items.push(
      <p className="text-base" key="divider-1">
        /
      </p>,
      <div key="org-switcher" className="flex items-center gap-x-2">
        {org.personal ? (
          <User className="size-5" />
        ) : (
          <Users className="size-5" />
        )}
        <OrgSwitcher
          selectedOrg={org}
          orgs={userOrgs}
          onOrgSelected={onOrgSelected}
          onNewOrgSelected={onNewOrgSelected}
          className="font-medium"
        />
      </div>,
      <NewOrgForm
        onSuccess={onNewOrgSuccess}
        open={openNewOrgSheet}
        onOpenChange={setOpenNewOrgSheet}
        key="new-org-form"
      />,
    );
    if (project) {
      items.push(
        <p className="text-base" key="divider-2">
          /
        </p>,
        <div key="project-switcher" className="flex items-center gap-x-2">
          <Folder className="size-5" />
          <ProjectSwitcher
            org={org}
            selectedProject={project}
            projects={projects}
            onProjectSelected={onProjectSelected}
            onNewProjectSelected={foundOrg ? onNewProjectSelected : undefined}
            className="font-medium"
          />
        </div>,
        <NewProjectForm
          org={org}
          open={openNewProjectSheet}
          onOpenChange={setOpenNewProjectSheet}
          onSuccess={onNewProjectSuccess}
          key="new-project-form"
        />,
      );
    }
    if (project && env) {
      items.push(
        <p className="text-base" key="divider-3">
          /
        </p>,
        <div key="environment-switcher" className="flex items-center gap-x-2">
          <Database className="size-5" />
          <EnvSwitcher
            org={org}
            project={project}
            selectedEnv={env}
            envs={envsQuery.data}
            onEnvSelected={onEnvironmentSelected}
            onNewEnvSelected={foundOrg ? onNewEnvironmentSelected : undefined}
            className="font-medium"
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
