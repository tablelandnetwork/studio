import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { api } from "@/trpc/server";
import { helpers } from "@tableland/sdk";
import { hasConstraint } from "@tableland/studio-store";
import TimeAgo from "javascript-time-ago";
import { Check, Rocket } from "lucide-react";
import Link from "next/link";
import { cache } from "react";

const timeAgo = new TimeAgo("en-US");

export default async function TableDetails({
  params,
}: {
  params: { team: string; project: string; table: string };
}) {
  const team = await cache(api.teams.teamBySlug.query)({ slug: params.team });
  const project = await cache(api.projects.projectBySlug.query)({
    teamId: team.id,
    slug: params.project,
  });
  const table = await cache(api.tables.tableByProjectIdAndSlug.query)({
    projectId: project.id,
    slug: params.table,
  });
  const deploymentInfos = await cache(
    api.deployments.deploymentsByTableId.query,
  )({
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
          <Table>
            {table.schema.columns.length > 0 && (
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead className="text-center">Not Null</TableHead>
                  <TableHead className="text-center">Primary Key</TableHead>
                  <TableHead className="text-center">Unique</TableHead>
                </TableRow>
              </TableHeader>
            )}
            <TableBody>
              {table.schema.columns.map((column, index) => {
                return (
                  <TableRow key={column.name}>
                    <TableCell>
                      <p>{column.name}</p>
                    </TableCell>
                    <TableCell>
                      <p>{column.type}</p>
                    </TableCell>
                    <TableCell align="center">
                      {hasConstraint(column, "not null") && <Check />}
                    </TableCell>
                    <TableCell align="center">
                      {hasConstraint(column, "primary key") && <Check />}
                    </TableCell>
                    <TableCell align="center">
                      {hasConstraint(column, "unique") && <Check />}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
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
          <Table>
            <TableBody>
              {table.schema.tableConstraints?.map((constraint, index) => {
                return (
                  <TableRow key={constraint}>
                    <TableCell>{constraint}</TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Deployments</CardTitle>
          <CardDescription>
            {deploymentInfos.length
              ? `Table ${table.name} has been deployed to the following networks:`
              : `Table ${table.name} has not been deployed yet.`}
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
                      {timeAgo.format(
                        new Date(deploymentInfo.deployment.createdAt),
                      )}
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
