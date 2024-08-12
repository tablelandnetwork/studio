import { type schema } from "@tableland/studio-store";
import { cache } from "react";
import { TRPCError } from "@trpc/server";
import { getSession } from "@tableland/studio-api";
import { cookies, headers } from "next/headers";
import NeedsDeploy from "./_components/needs-deploy";
import Table from "@/components/table";
import { api } from "@/trpc/server";
import {
  defBySlug,
  environmentBySlug,
  projectBySlug,
  orgBySlug,
} from "@/lib/api-helpers";
import DefDetails from "@/components/def-details";
import TableWrapper from "@/components/table-wrapper";
import {
  getRegistryRecord,
  type RegistryRecord,
} from "@/lib/validator-queries";

export default async function Deployments({
  params,
}: {
  params: { org: string; project: string; env: string; table: string };
}) {
  const session = await getSession({ headers: headers(), cookies: cookies() });
  const org = await orgBySlug(params.org);
  const project = await projectBySlug(params.project, org.id);
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

  let registryRecord: RegistryRecord | undefined;
  if (deployment) {
    registryRecord = await cache(getRegistryRecord)(
      deployment.chainId,
      deployment.tableId,
    );
  }

  const isAuthorized = await cache(api.orgs.isAuthorized)({ orgId: org.id });

  return (
    <main className="p-4">
      <TableWrapper
        org={org}
        project={project}
        env={env}
        def={def}
        displayName={def.name}
        description={def.description}
        chainId={deployment?.chainId}
        tableId={deployment?.tableId}
        schema={def.schema}
        isAuthenticated={!!session.auth}
        isAuthorized={isAuthorized}
      >
        {deployment ? (
          <Table
            tableName={deployment.tableName}
            chainId={deployment.chainId}
            tableId={deployment.tableId}
            owner={registryRecord?.controller}
            createdAt={new Date(deployment.createdAt)}
            schema={def.schema}
            environment={env}
            defData={def}
            deploymentData={deployment}
            isAuthorized={isAuthorized}
          />
        ) : (
          <div className="container max-w-2xl space-y-5">
            <NeedsDeploy def={def} env={env} isAuthorized={isAuthorized} />
            <DefDetails name={def.name} schema={def.schema} />
          </div>
        )}
      </TableWrapper>
    </main>
  );
}
