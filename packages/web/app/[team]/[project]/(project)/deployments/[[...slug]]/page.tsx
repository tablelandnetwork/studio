import { api } from "@/trpc/server-invoker";
import { schema } from "@tableland/studio-store";
import { AlertOctagon, HelpCircle, Rocket } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { cache } from "react";
import Deployment from "./_components/deployment";
import ExecDeployment from "./_components/exec-deployment";
import { Sidebar } from "./_components/sidebar";

export default async function Deployments({
  params,
}: {
  params: { team: string; project: string; slug?: string[] };
}) {
  if (params.slug && params.slug.length !== 2) {
    notFound();
  }

  const team = await cache(api.teams.teamBySlug.query)({ slug: params.team });
  const authorized = await cache(api.teams.isAuthorized.query)({
    teamId: team.id,
  });
  const project = await cache(api.projects.projectByTeamIdAndSlug.query)({
    teamId: team.id,
    slug: params.project,
  });
  const environments = await cache(api.environments.projectEnvironments.query)({
    projectId: project.id,
  });
  const tables = await cache(api.tables.projectTables.query)({
    projectId: project.id,
  });
  const deployments = await cache(api.deployments.projectDeployments.query)({
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
    selectedTable = tables.find((table) => table.name === tableSlug);
    if (!selectedEnvironment || !selectedTable) {
      notFound();
    }
    deployment = deploymentsMap
      .get(selectedEnvironment.id)
      ?.get(selectedTable.id);
  }

  return (
    <div className="flex flex-1">
      {!!tables.length ? (
        <>
          <Sidebar
            className="sticky top-14 h-fit min-w-[200px]"
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
              <Deployment
                environment={selectedEnvironment}
                table={selectedTable}
                deployment={deployment}
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
            <p>
              Deployments overview {params.team} {params.project}
            </p>
          )}
        </>
      ) : (
        <div className="m-auto flex max-w-xl flex-1 flex-col justify-center space-y-4">
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
