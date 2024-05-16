"use client";

import { Ellipsis } from "lucide-react";
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

export default function TableMenu(props: {
  schema: Schema;
  chainId?: number;
  tableId?: string;
  team?: schema.Team;
  project?: schema.Project;
  env?: schema.Environment;
  def?: { id: string; name: string; description: string; slug: string };
  isAuthorized?: RouterOutputs["teams"]["isAuthorized"];
}) {
  const [tableSettingsOpen, setTableSettingnsOpen] = useState(false);
  const [execDeploymentOpen, setExecDeploymentOpen] = useState(false);
  const [newDefFormOpen, setNewDefFormOpen] = useState(false);
  const [importTableFormOpen, setImportTableFormOpen] = useState(false);
  const [deleteTableOpen, setDeleteTableOpen] = useState(false);
  const [undeployTableOpen, setUndeployTableOpen] = useState(false);
  const router = useRouter();

  const deploymentsQuery = api.deployments.deploymentsByEnvironmentId.useQuery(
    props.env ? { environmentId: props.env.id } : skipToken,
  );

  const defsQuery = api.defs.projectDefs.useQuery(
    props.project ? { projectId: props.project.id } : skipToken,
  );

  const onEditDefSuccess = (updatedDef: schema.Def) => {
    if (props.def?.slug !== updatedDef.slug) {
      router.replace(
        `/${props.team!.slug}/${props.project!.slug}/${props.env!.slug}/${
          updatedDef.slug
        }`,
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
    setTableSettingnsOpen(false);
    setUndeployTableOpen(true);
  };

  const onDeleteTableSuccess = () => {
    setDeleteTableOpen(false);
    void defsQuery.refetch();
    if (!props.team || !props.project || !props.env) return;
    router.replace(
      `/${props.team.slug}/${props.project.slug}/${props.env.slug}`,
    );
  };

  const onUndeployTableSuccess = () => {
    setUndeployTableOpen(false);
    void deploymentsQuery.refetch();
    router.refresh();
  };

  return (
    <>
      <NewDefForm
        schemaPreset={props.schema}
        open={newDefFormOpen}
        onOpenChange={setNewDefFormOpen}
        onSuccess={(team, project, def) => {
          router.refresh();
          router.push(`/${team.slug}/${project.slug}/${def.slug}`);
        }}
      />
      {props.chainId && props.tableId && (
        <ImportTableForm
          chainIdPreset={props.chainId}
          tableIdPreset={props.tableId}
          open={importTableFormOpen}
          onOpenChange={setImportTableFormOpen}
          onSuccess={(team, project, def, env) => {
            router.refresh();
            router.push(
              `/${team.slug}/${project.slug}/tables/${env.slug}/${def.slug}`,
            );
          }}
        />
      )}
      {props.isAuthorized &&
        !props.chainId &&
        !props.tableId &&
        props.def &&
        props.env && (
          <ExecDeployment
            open={execDeploymentOpen}
            onOpenChange={setExecDeploymentOpen}
            environment={props.env}
            def={{ ...props.def, schema: props.schema }}
            onSuccess={() => {
              router.refresh();
              void deploymentsQuery.refetch();
            }}
          />
        )}
      {props.isAuthorized &&
        props.def &&
        props.team &&
        props.project &&
        props.env && (
          <TableSettings
            open={tableSettingsOpen}
            onOpenChange={setTableSettingnsOpen}
            isAuthorized={props.isAuthorized}
            def={{ ...props.def, schema: props.schema }}
            projectId={props.project.id}
            showUndeploy={!!props.chainId && !!props.tableId}
            onEditDefSuccess={onEditDefSuccess}
            onDeleteTable={onDeleteTable}
            onUndeployTable={onUndeployTable}
          />
        )}
      {props.def && (
        <DeleteTableDialog
          open={deleteTableOpen}
          onOpenChange={setDeleteTableOpen}
          defId={props.def.id}
          onSuccess={onDeleteTableSuccess}
        />
      )}
      {props.def && props.env && (
        <UndeployTableDialog
          open={undeployTableOpen}
          onOpenChange={setUndeployTableOpen}
          defId={props.def.id}
          envId={props.env.id}
          onSuccess={onUndeployTableSuccess}
        />
      )}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon">
            <Ellipsis />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          {props.isAuthorized && props.def && props.project && (
            <DropdownMenuItem onSelect={() => setTableSettingnsOpen(true)}>
              Table settings
            </DropdownMenuItem>
          )}
          {props.isAuthorized &&
            !props.chainId &&
            !props.tableId &&
            props.def &&
            props.env && (
              <DropdownMenuItem onSelect={() => setExecDeploymentOpen(true)}>
                Deploy table definition to Tableland
              </DropdownMenuItem>
            )}
          {props.chainId && props.tableId && (
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
