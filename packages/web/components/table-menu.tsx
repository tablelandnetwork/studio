"use client";

import { Ellipsis } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { type Schema, type schema } from "@tableland/studio-store";
import { skipToken } from "@tanstack/react-query";
import { Button } from "./ui/button";
import NewDefForm, { type NewDefFormProps } from "./new-def-form";
import ImportTableForm, {
  type ImportTableFormProps,
} from "./import-table-form";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import ExecDeployment from "@/app/[team]/[project]/[env]/_components/exec-deployment";
import { api } from "@/trpc/react";

export default function TableMenu(props: {
  schema: Schema;
  chainId?: number;
  tableId?: string;
  env?: schema.Environment;
  def?: { id: string; name: string };
}) {
  const [execDeploymentOpen, setExecDeploymentOpen] = useState(false);
  const [newDefFormOpen, setNewDefFormOpen] = useState(false);
  const [importTableFormOpen, setImportTableFormOpen] = useState(false);
  const router = useRouter();

  const deploymentsQuery = api.deployments.deploymentsByEnvironmentId.useQuery(
    props.env ? { environmentId: props.env.id } : skipToken,
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
            deploymentsQuery.refetch();
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
            Use table schema in Studio project
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </>
  );
}
