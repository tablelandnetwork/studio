import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { api } from "@/trpc/server-invoker";
import { helpers } from "@tableland/sdk";
import { schema } from "@tableland/studio-store";
import { Import, Plus, Rocket, Table2 } from "lucide-react";
import Link from "next/link";
import { cache } from "react";

export default async function Project({
  params,
}: {
  params: { team: string; project: string };
}) {
  const team = await cache(api.teams.teamBySlug.query)({ slug: params.team });
  const project = await cache(api.projects.projectByTeamIdAndSlug.query)({
    teamId: team.id,
    slug: params.project,
  });
  const tables = await cache(api.tables.projectTables.query)({
    projectId: project.id,
  });
  const deployments = await cache(api.deployments.projectDeployments.query)({
    projectId: project.id,
  });
  const deploymentsMap = deployments.reduce((acc, deployment) => {
    acc.set(deployment.tableId, deployment);
    return acc;
  }, new Map<string, schema.Deployment>());
  const authorized = await cache(api.teams.isAuthorized.query)({
    teamId: team.id,
  });

  return (
    <main className="container space-y-6 p-4">
      <div className="space-y-1">
        <h2 className="text-lg font-semibold tracking-tight">
          Project description
        </h2>
        <p className="ml-4 max-w-lg text-muted-foreground">
          {project.description}
        </p>
      </div>
      <div className="space-y-1">
        <h2 className="text-lg font-semibold tracking-tight">Tables</h2>
        <div className="grid grid-flow-row grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
          {tables.map((table) => {
            const columnCount = 0;
            const deploymentsCount = 0;
            const deployment = deploymentsMap.get(table.id);
            return (
              <Link
                key={table.id}
                href={`/${team.slug}/${project.slug}/${table.slug}`}
              >
                <Card className="">
                  <CardHeader>
                    <CardTitle className="flex gap-1">
                      <Table2 />
                      {table.name}
                    </CardTitle>
                    <CardDescription className="truncate">
                      {table.description}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="flex items-center justify-center space-x-6">
                    {/* <div className="flex items-center gap-1">
                    <Columns className="h-6 w-6" />
                    <div className="flex flex-col items-center">
                      <p className="text-4xl">4</p>
                      <p className="text-sm text-muted-foreground">
                        Column{columnCount !== 1 && "s"}
                      </p>
                    </div>
                  </div> */}
                    <div className="flex items-center gap-2">
                      <div className="flex flex-col items-center">
                        <Rocket
                          className={
                            deployment ? "text-green-500" : "text-red-500"
                          }
                        />
                        <p className="text-xl">
                          {!deployment && `Not `}Deployed
                        </p>
                        {deployment && (
                          <p className="text-sm text-muted-foreground">
                            {helpers.getChainInfo(deployment.chainId).chainName}
                          </p>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            );
          })}
        </div>
        {authorized && (
          <>
            <Link href={`/${team.slug}/${project.slug}/new-table`}>
              <Button variant="ghost" className="mr-2 mt-4">
                <Plus className="mr-2" />
                New Table
              </Button>
            </Link>
            <Link href={`/${team.slug}/${project.slug}/import-table`}>
              <Button variant="ghost" className="mt-4">
                <Import className="mr-2" />
                Import Table
              </Button>
            </Link>
          </>
        )}
      </div>
    </main>
  );
}
