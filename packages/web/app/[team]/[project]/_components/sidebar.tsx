"use client";

import { type schema } from "@tableland/studio-store";
import {
  Ellipsis,
  LayoutDashboard,
  Settings,
  Table2,
  Terminal,
} from "lucide-react";
import {
  useParams,
  useRouter,
  useSelectedLayoutSegment,
  useSelectedLayoutSegments,
} from "next/navigation";
import { skipToken } from "@tanstack/react-query";
import { useState } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { api } from "@/trpc/react";
import { SidebarContainer, SidebarSection } from "@/components/sidebar";
import ImportTableForm from "@/components/import-table-form";
import NewDefForm from "@/components/new-def-form";
import SidebarLink from "@/components/sidebar-link";

export function Sidebar() {
  const {
    team: teamSlug,
    project: projectSlug,
    env: envSlug,
    table: defSlug,
  } = useParams<{
    team: string;
    project: string;
    env?: string;
    table?: string;
  }>();

  const router = useRouter();

  const selectedLayoutSegment = useSelectedLayoutSegment();
  const selectedLayoutSegments = useSelectedLayoutSegments();
  const isConsole =
    !!envSlug &&
    !defSlug &&
    selectedLayoutSegments.slice(-1).pop() === "console";

  const [newDefOpen, setNewDefOpen] = useState(false);
  const [importTableOpen, setImportTableOpen] = useState(false);

  const teamQuery = api.teams.teamBySlug.useQuery({ slug: teamSlug });

  const projectQuery = api.projects.projectBySlug.useQuery(
    teamQuery.data
      ? { teamId: teamQuery.data.id, slug: projectSlug }
      : skipToken,
  );

  const { data: env } = api.environments.environmentBySlug.useQuery(
    projectQuery.data && envSlug
      ? { projectId: projectQuery.data.id, slug: envSlug }
      : skipToken,
  );

  const envPreference =
    api.environments.environmentPreferenceForProject.useQuery(
      projectQuery.data ? { projectId: projectQuery.data.id } : skipToken,
    );

  const linkEnv = env ?? envPreference.data;

  const defQuery = api.defs.defByProjectIdAndSlug.useQuery(
    projectQuery.data && defSlug
      ? { projectId: projectQuery.data.id, slug: defSlug }
      : skipToken,
  );

  const isAuthorizedQuery = api.teams.isAuthorized.useQuery(
    teamQuery.data ? { teamId: teamQuery.data.id } : skipToken,
  );

  const defsQuery = api.defs.projectDefs.useQuery(
    projectQuery.data ? { projectId: projectQuery.data.id } : skipToken,
  );

  const deploymentsMapQuery =
    api.deployments.deploymentsByEnvironmentId.useQuery(
      env ? { environmentId: env.id } : skipToken,
      {
        select(items) {
          return items.reduce((acc, item) => {
            acc.set(item.deployment.defId, item.deployment);
            return acc;
          }, new Map<string, schema.Deployment>());
        },
      },
    );

  const onNewDefSuccess = (
    team: schema.Team,
    project: schema.Project,
    def: schema.Def,
  ) => {
    defsQuery
      .refetch()
      .then(() => {
        if (env) {
          router.push(`/${team.slug}/${project.slug}/${env.slug}/${def.slug}`);
        }
      })
      .catch(() => {});
  };

  const onImportTableSuccess = (
    team: schema.Team,
    project: schema.Project,
    def: schema.Def,
    env: schema.Environment,
  ) => {
    defsQuery
      .refetch()
      .then(() => {
        router.push(`/${team.slug}/${project.slug}/${env.slug}/${def.slug}`);
      })
      .catch(() => {});
  };

  if (!teamQuery.data || !projectQuery.data || !linkEnv) {
    return null;
  }

  return (
    <SidebarContainer>
      <SidebarSection>
        <SidebarLink
          icon={LayoutDashboard}
          title="Overview"
          href={`/${teamQuery.data.slug}/${projectQuery.data.slug}/${linkEnv.slug}`}
          selected={
            !defSlug && !!envSlug && !isConsole && envSlug === env?.slug
          }
        />
        <SidebarLink
          icon={Terminal}
          title="Console"
          href={`/${teamQuery.data.slug}/${projectQuery.data.slug}/${linkEnv.slug}/console`}
          selected={isConsole}
        />
      </SidebarSection>
      <SidebarSection>
        <div className="flex items-center gap-2">
          <h3 className="text-base font-medium tracking-wide text-muted-foreground">
            Definitions
          </h3>

          {!!isAuthorizedQuery.data && (
            <DropdownMenu>
              <DropdownMenuTrigger className="ml-auto text-muted-foreground hover:text-foreground">
                <Ellipsis className="size-5" />
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem onSelect={() => setNewDefOpen(true)}>
                  New definition
                </DropdownMenuItem>
                <DropdownMenuItem onSelect={() => setImportTableOpen(true)}>
                  Import table
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
        {!defsQuery.data?.length && (
          <span className="text-center text-sm italic opacity-50">
            No tables
          </span>
        )}
        {defsQuery.data?.map((def) => {
          const deployment = deploymentsMapQuery.data?.get(def.id);
          return (
            <SidebarLink
              key={def.id}
              icon={Table2}
              title={def.name}
              href={`/${teamQuery.data.slug}/${projectQuery.data.slug}/${linkEnv.slug}/${def.slug}`}
              selected={def.id === defQuery.data?.id}
              showIndicator={!!env && !deployment && !!isAuthorizedQuery.data}
            />
          );
        })}
      </SidebarSection>
      {!!isAuthorizedQuery.data && (
        <SidebarSection className="sticky bottom-0 bg-card p-0">
          <div className="flex flex-col gap-3 p-3">
            <h3 className="text-base font-medium tracking-wide text-muted-foreground">
              Project
            </h3>
            <SidebarLink
              icon={Settings}
              title="Settings"
              href={`/${teamQuery.data.slug}/${projectQuery.data.slug}/settings`}
              selected={selectedLayoutSegment === "settings"}
            />
          </div>
        </SidebarSection>
      )}
      <NewDefForm
        open={newDefOpen}
        onOpenChange={setNewDefOpen}
        teamPreset={teamQuery.data}
        projectPreset={projectQuery.data}
        onSuccess={onNewDefSuccess}
      />
      <ImportTableForm
        open={importTableOpen}
        onOpenChange={setImportTableOpen}
        teamPreset={teamQuery.data}
        projectPreset={projectQuery.data}
        envPreset={env}
        onSuccess={onImportTableSuccess}
      />
    </SidebarContainer>
  );
}
