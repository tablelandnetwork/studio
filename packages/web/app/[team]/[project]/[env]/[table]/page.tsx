import { type schema } from "@tableland/studio-store";
import { cache } from "react";
import { TRPCError } from "@trpc/server";
import Table from "@/components/table";
import { api } from "@/trpc/server";
import {
  defBySlug,
  environmentBySlug,
  projectBySlug,
  teamBySlug,
} from "@/lib/api-helpers";
import DefDetails from "@/components/def-details";
import TableWrapper from "@/components/table-wrapper";

export default async function Deployments({
  params,
}: {
  params: { team: string; project: string; env: string; table: string };
}) {
  const team = await teamBySlug(params.team);
  const project = await projectBySlug(params.project, team.id);
  const env = await environmentBySlug(project.id, params.env);
  const def = await defBySlug(project.id, params.table);
  let deployment: schema.Deployment | undefined;
  try {
    deployment = await cache(api.deployments.deploymentByEnvAndDefId)({
      envId: env.id,
      defId: def.id,
    });
  } catch (e) {
    if (!(e instanceof TRPCError && e.code === "NOT_FOUND")) {
      throw e;
    }
  }

  const isAuthorized = await cache(api.teams.isAuthorized)({ teamId: team.id });

  return (
    <main className="flex-1 p-4">
      <TableWrapper
        projectId={project.id}
        env={env}
        def={def}
        displayName={def.name}
        description={def.description}
        chainId={deployment?.chainId}
        tableId={deployment?.tableId}
        schema={def.schema}
        isAuthorized={isAuthorized}
      >
        {deployment ? (
          <Table
            tableName={deployment.tableName}
            chainId={deployment.chainId}
            tableId={deployment.tableId}
            createdAt={new Date(deployment.createdAt)}
            schema={def.schema}
            environment={env}
            defData={def}
            deploymentData={deployment}
          />
        ) : (
          <DefDetails def={def} />
        )}
      </TableWrapper>
    </main>
  );
}
