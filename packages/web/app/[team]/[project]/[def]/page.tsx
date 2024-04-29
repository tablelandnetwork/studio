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
import DefColumns from "@/components/def-columns";
import DefConstraints from "@/components/def-constraints";
import { defBySlug, projectBySlug, teamBySlug } from "@/lib/api-helpers";

export default async function DefDetails({
  params,
}: {
  params: { team: string; project: string; def: string };
}) {
  const team = await teamBySlug(params.team);
  const project = await projectBySlug(params.project, team.id);
  const def = await defBySlug(project.id, params.def);
  const deploymentInfos = await cache(api.deployments.deploymentsByDefId)({
    defId: def.id,
  });

  return (
    <main className="container max-w-2xl space-y-5 p-4">
      <h1 className="text-3xl font-medium">{def.name}</h1>
      <Card>
        <CardHeader>
          <CardTitle>Description</CardTitle>
          <CardDescription>{def.description}</CardDescription>
        </CardHeader>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Columns</CardTitle>
          <CardDescription>
            Definition {def.name} has the following columns:
          </CardDescription>
        </CardHeader>
        <CardContent>
          <DefColumns columns={def.schema.columns} />
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Definition constraints</CardTitle>
          <CardDescription>
            {def.schema.tableConstraints
              ? `Definition ${def.name} includes the following table-wide constraints
            that apply to one or more columns:`
              : `Definition ${def.name} doesn't have any table-wide constraints.`}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <DefConstraints tableConstraints={def.schema.tableConstraints} />
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Deployments</CardTitle>
          <CardDescription>
            {deploymentInfos.length ? (
              `Definition ${def.name} has been deployed to the following networks:`
            ) : (
              <Link href={`/${team.slug}/${project.slug}/tables`}>
                Definition <b className="font-bold">{def.name}</b> has not been
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
                href={`/${team.slug}/${project.slug}/tables/${deploymentInfo.environment.slug}/${def.slug}`}
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
