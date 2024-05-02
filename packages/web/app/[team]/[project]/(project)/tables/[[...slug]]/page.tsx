import { type schema } from "@tableland/studio-store";
import { AlertOctagon, HelpCircle, Info, Rocket, Table2 } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { cache } from "react";
import ExecDeployment from "./_components/exec-deployment";
import { Sidebar } from "./_components/sidebar";
import Table from "@/components/table";
import { api } from "@/trpc/server";
import { projectBySlug, teamBySlug } from "@/lib/api-helpers";
import DefDetails from "@/components/def-details";
import TableWrapper from "@/components/table-wrapper";

export default async function Deployments({
  params,
}: {
  params: { team: string; project: string; slug?: string[] };
}) {
  if (params.slug && params.slug.length !== 2) {
    notFound();
  }

  const team = await teamBySlug(params.team);
  const authorized = await cache(api.teams.isAuthorized)({
    teamId: team.id,
  });
  const project = await projectBySlug(params.project, team.id);
  const environments = await cache(api.environments.projectEnvironments)({
    projectId: project.id,
  });
  const defs = await cache(api.defs.projectDefs)({
    projectId: project.id,
  });
  const deployments = await cache(api.deployments.projectDeployments)({
    projectId: project.id,
  });
  const deploymentsMap = deployments.reduce((acc, deployment) => {
    if (!acc.has(deployment.environmentId)) {
      acc.set(deployment.environmentId, new Map<string, schema.Deployment>());
    }
    acc.get(deployment.environmentId)?.set(deployment.defId, deployment);
    return acc;
  }, new Map<string, Map<string, schema.Deployment>>());

  let selectedEnvironment: schema.Environment | undefined;
  let selectedDef: schema.Def | undefined;
  let deployment: schema.Deployment | undefined;
  if (params.slug && params.slug.length > 0) {
    const envSlug = params.slug[0];
    const defSlug = params.slug[1];
    selectedEnvironment = environments.find(
      (environment) => environment.slug === envSlug,
    );
    selectedDef = defs.find((def) => def.slug === defSlug);
    if (!selectedEnvironment || !selectedDef) {
      notFound();
    }
    deployment = deploymentsMap
      .get(selectedEnvironment.id)
      ?.get(selectedDef.id);
  }

  return (
    <div className="flex flex-1">
      {defs.length ? (
        <>
          <Sidebar
            className="min-w-[200px sticky top-14 h-fit"
            environments={environments}
            selectedEnvironment={selectedEnvironment}
            defs={defs}
            selectedDef={selectedDef}
            deploymentsMap={deploymentsMap}
            teamSlug={params.team}
            projectSlug={params.project}
            isAuthorized={!!authorized}
          />
          <main className="flex-1 p-4">
            {selectedEnvironment && selectedDef ? (
              <TableWrapper
                displayName={selectedDef.name}
                chainId={deployment?.chainId}
                tableId={deployment?.tableId}
              >
                {deployment ? (
                  <Table
                    displayName={selectedDef.name}
                    tableName={deployment.tableName}
                    chainId={deployment.chainId}
                    tableId={deployment.tableId}
                    createdAt={new Date(deployment.createdAt)}
                    schema={selectedDef.schema}
                    environment={selectedEnvironment}
                    defData={selectedDef}
                    deploymentData={deployment}
                  />
                ) : (
                  <DefDetails def={selectedDef} />
                )}
              </TableWrapper>
            ) : (
              <div className="m-auto my-16 flex max-w-xl flex-1 flex-col justify-center space-y-4 p-4">
                <div className="flex items-center space-x-4">
                  <Table2 className="flex-shrink-0" />
                  <h1 className="text-2xl font-medium">Your tables</h1>
                </div>
                <div className="flex items-center space-x-4">
                  <Info className="flex-shrink-0" />
                  <p className="text-muted-foreground">
                    Tables are definitions from your Project, created as tables
                    on the Tableland network. To the left, you&apos;ll see a
                    list of all your Project&apos;s deployed and undeployed
                    tables.
                  </p>
                </div>
                <div className="flex items-center space-x-4">
                  <Table2 className="flex-shrink-0" />
                  <p className="text-muted-foreground">
                    Deployed tables are incicated by a white table icon. You can
                    select any deployed table to see details about it and view
                    the table&apos;s data.
                  </p>
                </div>
                <div className="flex items-center space-x-4">
                  <Table2 className="flex-shrink-0 text-red-400 opacity-40" />
                  <p className="text-muted-foreground">
                    Undeployed definitions are incicated by a red table icon.
                    You can select any undeployed definition to deploy it on the
                    Tableland network.
                  </p>
                </div>
              </div>
            )}
          </main>
        </>
      ) : (
        <main className="m-auto my-16 flex max-w-xl flex-1 flex-col justify-center space-y-4">
          <div className="flex items-center space-x-4">
            <Rocket className="flex-shrink-0" />
            <h1 className="text-2xl font-medium">
              Your Project&apos;s definition deployments will appear here.
            </h1>
          </div>
          <div className="flex items-center space-x-4">
            <HelpCircle className="flex-shrink-0" />
            <p className="text-muted-foreground">
              Tables are definitions from your Project, created as tables on the
              Tableland network. This screen will allow you to view all your
              Project&apos;s tables, and deploy new ones.
            </p>
          </div>
          <div className="flex items-center space-x-4">
            <AlertOctagon className="flex-shrink-0" />
            <p className="text-muted-foreground">
              Before anything useful can be displayed here, you&apos;ll need to
              create some definitions first. Head over to the{" "}
              <Link href={`/${team.slug}/${project.slug}`}>definitions</Link>{" "}
              tab to do that.
            </p>
          </div>
        </main>
      )}
    </div>
  );
}
