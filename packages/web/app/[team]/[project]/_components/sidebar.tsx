"use client";

import { type schema } from "@tableland/studio-store";
import { Import, LayoutDashboard, Plus, Settings, Table2 } from "lucide-react";
import Link from "next/link";
import {
  useParams,
  useRouter,
  useSelectedLayoutSegment,
} from "next/navigation";
import { skipToken } from "@tanstack/react-query";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { api } from "@/trpc/react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { SidebarContainer, SidebarSection } from "@/components/sidebar";
import ImportTableForm from "@/components/import-table-form";
import NewDefForm from "@/components/new-def-form";

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
  const [newDefOpen, setNewDefOpen] = useState(false);
  const [importTableOpen, setImportTableOpen] = useState(false);

  const teamQuery = api.teams.teamBySlug.useQuery({ slug: teamSlug });

  const projectQuery = api.projects.projectBySlug.useQuery(
    teamQuery.data
      ? { teamId: teamQuery.data.id, slug: projectSlug }
      : skipToken,
  );

  const environmentQuery = api.environments.environmentBySlug.useQuery(
    projectQuery.data && envSlug
      ? { projectId: projectQuery.data.id, slug: envSlug }
      : skipToken,
  );

  const environmentsQuery = api.environments.projectEnvironments.useQuery(
    !envSlug && projectQuery.data
      ? { projectId: projectQuery.data.id }
      : skipToken,
  );

  const env =
    environmentQuery.data ??
    (environmentsQuery.data && environmentsQuery.data.length > 0
      ? environmentsQuery.data?.[0]
      : undefined);

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
        if (environmentQuery.data) {
          router.push(
            `/${team.slug}/${project.slug}/${environmentQuery.data.slug}/${def.slug}`,
          );
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

  if (!teamQuery.data || !projectQuery.data || !env) {
    return null;
  }

  return (
    <SidebarContainer>
      <SidebarSection>
        <Link
          href={`/${teamQuery.data.slug}/${projectQuery.data.slug}/${env.slug}`}
        >
          <Button
            variant={
              !defSlug && !!envSlug && envSlug === environmentQuery.data?.slug
                ? "secondary"
                : "ghost"
            }
            className="w-full justify-start gap-x-2 pl-1"
          >
            <LayoutDashboard />
            Overview
          </Button>
        </Link>
      </SidebarSection>
      <SidebarSection>
        <div className="flex items-center pl-1">
          <Table2 className="mr-2" />
          <h2 className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50">
            Tables
          </h2>
        </div>
        {defsQuery.data?.map((def) => {
          const deployment = deploymentsMapQuery.data?.get(def.id);
          return (
            <Link
              key={def.id}
              href={`/${teamQuery.data.slug}/${projectQuery.data.slug}/${env.slug}/${def.slug}`}
            >
              <Button
                key={def.id}
                variant={def.id === defQuery.data?.id ? "secondary" : "ghost"}
                className="w-full justify-start"
              >
                <span className={cn(!deployment && "mr-4")}>{def.name}</span>
                {!deployment && (
                  <div
                    className={cn(
                      "ml-auto size-2 rounded-full",
                      isAuthorizedQuery.data
                        ? "bg-destructive"
                        : "bg-foreground",
                    )}
                  />
                )}
              </Button>
            </Link>
          );
        })}
        {!!isAuthorizedQuery.data && (
          <div className="flex flex-1 items-center justify-center gap-x-2">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setNewDefOpen(true)}
                  >
                    <Plus />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>New table</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setImportTableOpen(true)}
                  >
                    <Import />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Import table</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        )}
      </SidebarSection>
      <SidebarSection>
        <Link
          href={`/${teamQuery.data.slug}/${projectQuery.data.slug}/settings`}
        >
          <Button
            variant={
              selectedLayoutSegment === "settings" ? "secondary" : "ghost"
            }
            className="w-full justify-start gap-x-2 pl-1"
          >
            <Settings />
            Settings
          </Button>
        </Link>
      </SidebarSection>
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
