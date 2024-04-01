import { helpers } from "@tableland/sdk";
import { Rocket } from "lucide-react";
import Link from "next/link";
import { cache } from "react";
import { api } from "@/trpc/server";
import { TimeSince } from "@/components/time";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import TableColumns from "@/components/table-columns";
import TableConstraints from "@/components/table-constraints";

export default async function TableDetails({
  params,
}: {
  params: { team: string; project: string; table: string };
}) {
  const team = await cache(api.teams.teamBySlug)({ slug: params.team });
  const project = await cache(api.projects.projectBySlug)({
    teamId: team.id,
    slug: params.project,
  });
  const table = await cache(api.tables.tableByProjectIdAndSlug)({
    projectId: project.id,
    slug: params.table,
  });
  const deploymentInfos = await cache(api.deployments.deploymentsByTableId)({
    tableId: table.id,
  });

  return (
    <main className="container max-w-2xl space-y-5 p-4">
      <Card>
        <CardHeader>
          <CardTitle>About {table.name}</CardTitle>
          <CardDescription>{table.description}</CardDescription>
        </CardHeader>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Columns</CardTitle>
          <CardDescription>
            Table {table.name} has the following columns:
          </CardDescription>
        </CardHeader>
        <CardContent>
          <TableColumns columns={table.schema.columns} />
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Table Constraints</CardTitle>
          <CardDescription>
            {table.schema.tableConstraints
              ? `Table ${table.name} includes the following table-wide constraints
            that apply to one or more columns:`
              : `Table ${table.name} doesn't have any table constraints.`}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <TableConstraints tableConstraints={table.schema.tableConstraints} />
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Deployments</CardTitle>
          <CardDescription>
            {deploymentInfos.length ? (
              `Table ${table.name} has been deployed to the following networks:`
            ) : (
              <Link href={`/${team.slug}/${project.slug}/deployments`}>
                Table <b className="font-bold">{table.name}</b> has not been
                deployed yet.
              </Link>
            )}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-8">
            {deploymentInfos.map((deploymentInfo) => (
              <Link
                key={deploymentInfo.environment.id}
                href={`/${team.slug}/${project.slug}/deployments/${deploymentInfo.environment.slug}/${table.slug}`}
              >
                <div className="flex items-center rounded-md p-3 hover:bg-slate-100">
                  <Rocket />
                  <div className="ml-4 space-y-1">
                    <p className="text-sm font-medium leading-none">
                      {
                        helpers.getChainInfo(deploymentInfo.deployment.chainId)
                          .chainName
                      }
                    </p>
                    <p className="text-sm text-muted-foreground">
                      <TimeSince time={deploymentInfo.deployment.createdAt} />
                    </p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </CardContent>
      </Card>
    </main>
  );
}
