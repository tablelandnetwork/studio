"use client";

import { type schema } from "@tableland/studio-store";
import { Ellipsis, LayoutDashboard, Settings, Table2 } from "lucide-react";
import Link from "next/link";
import {
  useParams,
  useRouter,
  useSelectedLayoutSegment,
} from "next/navigation";
import { skipToken } from "@tanstack/react-query";
import { useState } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { api } from "@/trpc/react";
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

  const { data: env } = api.environments.environmentBySlug.useQuery(
    projectQuery.data && envSlug
      ? { projectId: projectQuery.data.id, slug: envSlug }
      : skipToken,
  );

  const userEnvForProject = api.environments.userEnvironmentForProject.useQuery(
    projectQuery.data ? { projectId: projectQuery.data.id } : skipToken,
  );

  const linkEnv = env ?? userEnvForProject.data;

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
      <SidebarSection className="px-3 pt-3">
        <Link
          href={`/${teamQuery.data.slug}/${projectQuery.data.slug}/${linkEnv.slug}`}
        >
          <Button
            variant={
              !defSlug && !!envSlug && envSlug === env?.slug
                ? "secondary"
                : "ghost"
            }
            className="w-full justify-start gap-x-2 pl-1"
          >
            <LayoutDashboard className="size-5" />
            Overview
          </Button>
        </Link>
      </SidebarSection>
      <SidebarSection className="px-3">
        <div className="flex items-center gap-2 pl-1">
          <h2 className="text-base font-medium text-muted-foreground">
            Tables
          </h2>
          {!!isAuthorizedQuery.data && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="ml-auto">
                  <Ellipsis className="size-5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem onSelect={() => setNewDefOpen(true)}>
                  New table
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
            <Link
              key={def.id}
              href={`/${teamQuery.data.slug}/${projectQuery.data.slug}/${linkEnv.slug}/${def.slug}`}
            >
              <Button
                key={def.id}
                variant={def.id === defQuery.data?.id ? "secondary" : "ghost"}
                className="w-full justify-start gap-x-2 pl-1"
              >
                <Table2 className="size-5 shrink-0" />
                <span className={cn(!deployment && "mr-4")}>{def.name}</span>
                {env && !deployment && (
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
      </SidebarSection>
      {!!isAuthorizedQuery.data && (
        <SidebarSection className="sticky bottom-0 bg-card">
          <div className="px-3 pb-3">
            <Link
              href={`/${teamQuery.data.slug}/${projectQuery.data.slug}/settings`}
            >
              <Button
                variant={
                  selectedLayoutSegment === "settings" ? "secondary" : "ghost"
                }
                className="w-full justify-start gap-x-2 pl-1"
              >
                <Settings className="size-5" />
                Settings
              </Button>
            </Link>
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
