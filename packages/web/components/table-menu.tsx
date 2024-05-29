"use client";

import { EllipsisVertical } from "lucide-react";
import { useRouter } from "next/navigation";
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
  const [tableSettingsOpen, setTableSettingnsOpen] = useState(false);
  const [execDeploymentOpen, setExecDeploymentOpen] = useState(false);
  const [newDefFormOpen, setNewDefFormOpen] = useState(false);
  const [importTableFormOpen, setImportTableFormOpen] = useState(false);
  const [deleteTableOpen, setDeleteTableOpen] = useState(false);
  const [undeployTableOpen, setUndeployTableOpen] = useState(false);
  const router = useRouter();

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
    setTableSettingnsOpen(false);
    setDeleteTableOpen(true);
  };

  const onUndeployTable = () => {
    void deploymentsQuery.refetch();
    setTableSettingnsOpen(false);
    setUndeployTableOpen(true);
  };

  const onDeleteTableSuccess = () => {
    setDeleteTableOpen(false);
    void defsQuery.refetch();
    if (!team || !project || !env) return;
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
  const displayImport = !!chainId && !!tableId;

  return (
    <>
      {displaySettings && (
        <>
          <TableSettings
            open={tableSettingsOpen}
            onOpenChange={setTableSettingnsOpen}
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
      {displayImport && (
        <ImportTableForm
          chainIdPreset={chainId}
          tableIdPreset={tableId}
          open={importTableFormOpen}
          onOpenChange={setImportTableFormOpen}
          onSuccess={(team, project, def, env) => {
            router.refresh();
            router.push(
              `/${team.slug}/${project.slug}/${env.slug}/${def.slug}`,
            );
          }}
        />
      )}
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
            <EllipsisVertical />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          {displaySettings && (
            <DropdownMenuItem onSelect={() => setTableSettingnsOpen(true)}>
              Table settings
            </DropdownMenuItem>
          )}
          {displayDeploy && (
            <DropdownMenuItem onSelect={() => setExecDeploymentOpen(true)}>
              Deploy table definition to Tableland
            </DropdownMenuItem>
          )}
          {displayImport && (
            <DropdownMenuItem onSelect={() => setImportTableFormOpen(true)}>
              Import table into Studio project
            </DropdownMenuItem>
          )}
          <DropdownMenuItem onSelect={() => setNewDefFormOpen(true)}>
            Use table definition in Studio project
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </>
  );
}
