"use client";

import { Ellipsis } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import { type Schema, type schema } from "@tableland/studio-store";
import { skipToken } from "@tanstack/react-query";
import { type RouterOutputs } from "@tableland/studio-api";
import { Button } from "./ui/button";
import NewDefForm from "./new-def-form";
import ImportTableForm from "./import-table-form";
import TableSettings from "./table-settings";
import { DeleteTableDialog } from "./delete-table-dialog";
import { UndeployTableDialog } from "./undeploy-table-dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import ExecDeployment from "@/components/exec-deployment";
import { api } from "@/trpc/react";
import { chainsMap } from "@/lib/chains-map";

export interface TableMenuProps {
  schema: Schema;
  chainId?: number;
  tableId?: string;
  team?: schema.Team;
  project?: schema.Project;
  env?: schema.Environment;
  def?: { id: string; name: string; description: string; slug: string };
  isAuthorized?: RouterOutputs["teams"]["isAuthorized"];
}

export default function TableMenu({
  schema,
  chainId,
  tableId,
  team,
  project,
  env,
  def,
  isAuthorized,
}: TableMenuProps) {
  const [tableSettingsOpen, setTableSettingsOpen] = useState(false);
  const [execDeploymentOpen, setExecDeploymentOpen] = useState(false);
  const [newDefFormOpen, setNewDefFormOpen] = useState(false);
  const [importTableFormOpen, setImportTableFormOpen] = useState(false);
  const [deleteTableOpen, setDeleteTableOpen] = useState(false);
  const [undeployTableOpen, setUndeployTableOpen] = useState(false);
  const router = useRouter();
  const pathname = usePathname();

  const deploymentsQuery = api.deployments.deploymentsByEnvironmentId.useQuery(
    env ? { environmentId: env.id } : skipToken,
  );

  const defsQuery = api.defs.projectDefs.useQuery(
    project ? { projectId: project.id } : skipToken,
  );

  const onEditDefSuccess = (updatedDef: schema.Def) => {
    if (def?.slug !== updatedDef.slug) {
      router.replace(
        `/${team!.slug}/${project!.slug}/${env!.slug}/${updatedDef.slug}`,
      );
    }
    router.refresh();
    void defsQuery.refetch();
  };

  const onDeleteTable = () => {
    setTableSettingsOpen(false);
    setDeleteTableOpen(true);
  };

  const onUndeployTable = () => {
    void deploymentsQuery.refetch();
    setTableSettingsOpen(false);
    setUndeployTableOpen(true);
  };

  const onDeleteTableSuccess = () => {
    setDeleteTableOpen(false);
    void defsQuery.refetch();
    if (!team || !project || !env) return;
    router.refresh();
    router.replace(`/${team.slug}/${project.slug}/${env.slug}`);
  };

  const onUndeployTableSuccess = () => {
    setUndeployTableOpen(false);
    void deploymentsQuery.refetch();
    router.refresh();
  };

  const displaySettings =
    !!isAuthorized && !!def && !!team && !!project && !!env;
  const displayDeploy =
    !!isAuthorized && !chainId && !tableId && !!def && !!env;
  const displayImportToStudio =
    !!chainId && !!tableId && chainsMap.get(chainId);
  const displayImportFromTableland = !chainId && !tableId && !!def;

  return (
    <>
      {displaySettings && (
        <>
          <TableSettings
            open={tableSettingsOpen}
            onOpenChange={setTableSettingsOpen}
            isAdmin={!!isAuthorized.isOwner}
            def={{ ...def, schema }}
            projectId={project.id}
            showUndeploy={!!chainId && !!tableId}
            onEditDefSuccess={onEditDefSuccess}
            onDeleteTable={onDeleteTable}
            onUndeployTable={onUndeployTable}
          />
          <DeleteTableDialog
            open={deleteTableOpen}
            onOpenChange={setDeleteTableOpen}
            defId={def.id}
            onSuccess={onDeleteTableSuccess}
          />
          <UndeployTableDialog
            open={undeployTableOpen}
            onOpenChange={setUndeployTableOpen}
            defId={def.id}
            envId={env.id}
            onSuccess={onUndeployTableSuccess}
          />
        </>
      )}
      {displayDeploy && (
        <ExecDeployment
          open={execDeploymentOpen}
          onOpenChange={setExecDeploymentOpen}
          environment={env}
          def={{ ...def, schema }}
          onSuccess={() => {
            router.refresh();
            void deploymentsQuery.refetch();
          }}
        />
      )}
      <ImportTableForm
        teamPreset={team}
        projectPreset={project}
        envPreset={env}
        chainIdPreset={chainId}
        tableIdPreset={tableId}
        defId={def?.id}
        open={importTableFormOpen}
        onOpenChange={setImportTableFormOpen}
        onSuccess={(team, project, def, env) => {
          router.refresh();
          const newPathname = `/${team.slug}/${project.slug}/${env.slug}/${def.slug}`;
          if (pathname !== newPathname) {
            router.push(newPathname);
          } else {
            void deploymentsQuery.refetch();
          }
        }}
      />
      <NewDefForm
        schemaPreset={schema}
        open={newDefFormOpen}
        onOpenChange={setNewDefFormOpen}
        onSuccess={(selectedTeam, selectedProject, def) => {
          router.refresh();
          router.push(
            `/${selectedTeam.slug}/${selectedProject.slug}${env ? `/${env.slug}/${def.slug}` : `?table=${def.slug}`}`,
          );
          if (selectedProject.id === project?.id) {
            void defsQuery.refetch();
          }
        }}
      />
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon">
            <Ellipsis />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          {displaySettings && (
            <DropdownMenuItem onSelect={() => setTableSettingsOpen(true)}>
              Settings
            </DropdownMenuItem>
          )}
          {displayDeploy && (
            <DropdownMenuItem onSelect={() => setExecDeploymentOpen(true)}>
              Deploy to Tableland
            </DropdownMenuItem>
          )}
          {displayImportToStudio && (
            <DropdownMenuItem onSelect={() => setImportTableFormOpen(true)}>
              Import table to project definition
            </DropdownMenuItem>
          )}
          {displayImportFromTableland && (
            <DropdownMenuItem onSelect={() => setImportTableFormOpen(true)}>
              Attach existing table to this definition
            </DropdownMenuItem>
          )}
          <DropdownMenuItem onSelect={() => setNewDefFormOpen(true)}>
            Use schema in new definition
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </>
  );
}
