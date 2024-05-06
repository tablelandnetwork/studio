"use client";

import { type schema } from "@tableland/studio-store";
import { LayoutDashboard, Table2 } from "lucide-react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { skipToken } from "@tanstack/react-query";
import NewDef from "./new-def";
import ImportTable from "./import-table";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { api } from "@/trpc/react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface SidebarProps extends React.HTMLAttributes<HTMLDivElement> {}

export function Sidebar({ className }: SidebarProps) {
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
      environmentQuery.data
        ? { environmentId: environmentQuery.data.id }
        : skipToken,
      {
        select(items) {
          return items.reduce((acc, item) => {
            if (!acc.has(item.deployment.environmentId)) {
              acc.set(
                item.deployment.environmentId,
                new Map<string, schema.Deployment>(),
              );
            }
            acc
              .get(item.deployment.environmentId)
              ?.set(item.deployment.defId, item.deployment);
            return acc;
          }, new Map<string, Map<string, schema.Deployment>>());
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

  if (!teamQuery.data || !projectQuery.data || !environmentQuery.data) {
    return null;
  }

  return (
    <div className={cn("space-y-5 p-3", className)}>
      <div className="flex flex-col space-y-1">
        <Link
          href={`/${teamQuery.data.slug}/${projectQuery.data.slug}/${environmentQuery.data.slug}`}
        >
          <Button
            variant={
              !defSlug && envSlug === environmentQuery.data?.slug
                ? "secondary"
                : "ghost"
            }
            className="w-full justify-start gap-x-2 pl-1"
          >
            <LayoutDashboard />
            Overview
          </Button>
        </Link>
      </div>
      <div className="flex flex-col space-y-1">
        <div className="flex items-center pl-1">
          <Table2 className="mr-2" />
          <h2 className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50">
            Tables
          </h2>
        </div>
        {defsQuery.data?.map((def) => {
          const deployment = environmentQuery.data
            ? deploymentsMapQuery.data
                ?.get(environmentQuery.data.id)
                ?.get(def.id)
            : undefined;
          return (
            <Link
              key={def.id}
              href={`/${teamQuery.data.slug}/${projectQuery.data.slug}/${environmentQuery.data.slug}/${def.slug}`}
            >
              <Button
                key={def.id}
                variant={def.id === defQuery.data?.id ? "secondary" : "ghost"}
                className="w-full justify-start"
              >
                <span className={cn(!deployment && "mr-4")}>{def.name}</span>
                {!deployment && isAuthorizedQuery.data && (
                  <div className="ml-auto size-2 rounded-full bg-destructive" />
                )}
              </Button>
            </Link>
          );
        })}
        <div className="flex flex-1 items-center justify-center gap-x-2">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger>
                <NewDef
                  teamPreset={teamQuery.data}
                  projectPreset={projectQuery.data}
                  onSuccess={onNewDefSuccess}
                />
              </TooltipTrigger>
              <TooltipContent>
                <p>New table</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger>
                <ImportTable
                  teamPreset={teamQuery.data}
                  projectPreset={projectQuery.data}
                  envPreset={environmentQuery.data}
                  onSuccess={onImportTableSuccess}
                />
              </TooltipTrigger>
              <TooltipContent>
                <p>Import table</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </div>
    </div>
  );
}
