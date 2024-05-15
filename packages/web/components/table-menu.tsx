"use client";

import { Ellipsis } from "lucide-react";
import { useRouter, usePathname } from "next/navigation";
import { useState } from "react";
import { type Schema, type schema } from "@tableland/studio-store";
import { skipToken } from "@tanstack/react-query";
import { type RouterOutputs } from "@tableland/studio-api";
import { Button } from "./ui/button";
import NewDefForm from "./new-def-form";
import ImportTableForm from "./import-table-form";
import TableSettings from "./table-settings";
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
  projectId?: string;
  env?: schema.Environment;
  def?: { id: string; name: string; description: string; slug: string };
  isAuthorized?: RouterOutputs["teams"]["isAuthorized"];
}) {
  const [editDefFormOpen, setEditDefFormOpen] = useState(false);
  const [execDeploymentOpen, setExecDeploymentOpen] = useState(false);
  const [newDefFormOpen, setNewDefFormOpen] = useState(false);
  const [importTableFormOpen, setImportTableFormOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();

  const deploymentsQuery = api.deployments.deploymentsByEnvironmentId.useQuery(
    props.env ? { environmentId: props.env.id } : skipToken,
  );

  const defsQuery = api.defs.projectDefs.useQuery(
    props.projectId ? { projectId: props.projectId } : skipToken,
  );

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
      {!props.chainId && !props.tableId && props.def && props.env && (
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
      {props.isAuthorized && props.def && props.projectId && (
        <TableSettings
          open={editDefFormOpen}
          onOpenChange={setEditDefFormOpen}
          isAuthorized={props.isAuthorized}
          def={{ ...props.def, schema: props.schema }}
          projectId={props.projectId}
          onSuccess={(updatedDef) => {
            if (props.def?.slug !== updatedDef.slug) {
              router.replace(
                pathname.replace(`/${props.def!.slug}`, `/${updatedDef.slug}`),
              );
            }
            router.refresh();
            void defsQuery.refetch();
          }}
        />
      )}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon">
            <Ellipsis />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          {props.isAuthorized && props.def && props.projectId && (
            <DropdownMenuItem onSelect={() => setEditDefFormOpen(true)}>
              Table settings
            </DropdownMenuItem>
          )}
          {!props.chainId && !props.tableId && props.def && props.env && (
            <DropdownMenuItem onSelect={() => setExecDeploymentOpen(true)}>
              Deploy definition to Tableland
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
