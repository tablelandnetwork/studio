import { type schema } from "@tableland/studio-store";
import { AlertOctagon, HelpCircle, Info, Rocket, Table2 } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { cache } from "react";
import ExecDeployment from "./_components/exec-deployment";
import { Sidebar } from "./_components/sidebar";
import TablelandTable from "@/components/tableland-table";
import { api } from "@/trpc/server";

export default async function Deployments({
  params,
}: {
  params: { team: string; project: string; slug?: string[] };
}) {
  if (params.slug && params.slug.length !== 2) {
    notFound();
  }

  const team = await cache(api.teams.teamBySlug)({ slug: params.team });
  const authorized = await cache(api.teams.isAuthorized)({
    teamId: team.id,
  });
  const project = await cache(api.projects.projectBySlug)({
    teamId: team.id,
    slug: params.project,
  });
  const environments = await cache(api.environments.projectEnvironments)({
    projectId: project.id,
  });
  const tables = await cache(api.tables.projectTables)({
    projectId: project.id,
  });
  const deployments = await cache(api.deployments.projectDeployments)({
    projectId: project.id,
  });
  const deploymentsMap = deployments.reduce((acc, deployment) => {
    if (!acc.has(deployment.environmentId)) {
      acc.set(deployment.environmentId, new Map<string, schema.Deployment>());
    }
    acc.get(deployment.environmentId)?.set(deployment.tableId, deployment);
    return acc;
  }, new Map<string, Map<string, schema.Deployment>>());

  let selectedEnvironment: schema.Environment | undefined;
  let selectedTable: schema.Table | undefined;
  let deployment: schema.Deployment | undefined;
  if (params.slug && params.slug.length > 0) {
    const envSlug = params.slug[0];
    const tableSlug = params.slug[1];
    selectedEnvironment = environments.find(
      (environment) => environment.slug === envSlug,
    );
    selectedTable = tables.find((table) => table.slug === tableSlug);
    if (!selectedEnvironment || !selectedTable) {
      notFound();
    }
    deployment = deploymentsMap
      .get(selectedEnvironment.id)
      ?.get(selectedTable.id);
  }

  return (
    <div className="flex flex-1">
      {tables.length ? (
        <>
          <Sidebar
            className="min-w-[200px sticky top-14 h-fit"
            environments={environments}
            selectedEnvironment={selectedEnvironment}
            tables={tables}
            selectedTable={selectedTable}
            deploymentsMap={deploymentsMap}
            teamSlug={params.team}
            projectSlug={params.project}
            isAuthorized={!!authorized}
          />
          {selectedEnvironment && selectedTable ? (
            deployment ? (
              <TablelandTable
                displayName={selectedTable.name}
                tableName={deployment.tableName}
                chainId={deployment.chainId}
                tokenId={deployment.tokenId}
                createdAt={new Date(deployment.createdAt)}
                schema={selectedTable.schema}
                environment={selectedEnvironment}
                tableData={selectedTable}
                deploymentData={deployment}
              />
            ) : (
              <ExecDeployment
                team={team}
                project={project}
                environment={selectedEnvironment}
                table={selectedTable}
              />
            )
          ) : (
            <div className="m-auto my-16 flex max-w-xl flex-1 flex-col justify-center space-y-4 p-4">
              <div className="flex items-center space-x-4">
                <Rocket className="flex-shrink-0" />
                <h1 className="text-2xl font-medium">Your Deployments.</h1>
              </div>
              <div className="flex items-center space-x-4">
                <Info className="flex-shrink-0" />
                <p className="text-muted-foreground">
                  A Deployment represents a Table definition from your
                  Project&apos;s Blueprint, created on the Tableland network. To
                  the left, you&apos;ll see a list of all your Project&apos;s
                  deployed and undeployed Tables.
                </p>
              </div>
              <div className="flex items-center space-x-4">
                <Table2 className="flex-shrink-0" />
                <p className="text-muted-foreground">
                  Deployed Tables are incicated by a black table icon. You can
                  select any deployed Table to see details about the Deployment
                  and view the Table&apos;s data.
                </p>
              </div>
              <div className="flex items-center space-x-4">
                <Table2 className="flex-shrink-0 text-red-400 opacity-40" />
                <p className="text-muted-foreground">
                  Undeployed Tables are incicated by a red table icon. You can
                  select any undeployed Table to deploy it to the Tableland
                  network.
                </p>
              </div>
            </div>
          )}
        </>
      ) : (
        <div className="m-auto my-16 flex max-w-xl flex-1 flex-col justify-center space-y-4">
          <div className="flex items-center space-x-4">
            <Rocket className="flex-shrink-0" />
            <h1 className="text-2xl font-medium">
              Your Project&apos;s Table Deployments will appear here.
            </h1>
          </div>
          <div className="flex items-center space-x-4">
            <HelpCircle className="flex-shrink-0" />
            <p className="text-muted-foreground">
              A Deployment represents a Table definition from your
              Project&apos;s Blueprint, created on the Tableland network. This
              screen will allow you to view all your Project&apos;s Deployments,
              and create new ones.
            </p>
          </div>
          <div className="flex items-center space-x-4">
            <AlertOctagon className="flex-shrink-0" />
            <p className="text-muted-foreground">
              Before anything useful can be displayed here, you&apos;ll need to
              define some Tables first. Head over to the{" "}
              <Link href={`/${team.slug}/${project.slug}`}>Blueprint</Link> tab
              to do that.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
