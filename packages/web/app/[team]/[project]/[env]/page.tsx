import {
  CircleAlert,
  Database,
  Folder,
  Info,
  Rows4,
  Share2,
  Table2,
} from "lucide-react";
import Share from "./_components/share";
import {
  environmentBySlug,
  projectBySlug,
  teamBySlug,
} from "@/lib/api-helpers";
import { api } from "@/trpc/server";
import SQLLogs from "@/components/sql-logs";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { chainsMap } from "@/lib/chains-map";
import HashDisplay from "@/components/hash-display";

export default async function Deployments({
  params,
}: {
  params: { team: string; project: string; env: string };
}) {
  const team = await teamBySlug(params.team);
  const project = await projectBySlug(params.project, team.id);
  const env = await environmentBySlug(project.id, params.env);
  const defs = await api.defs.projectDefs({ projectId: project.id });
  const deployments = await api.deployments.deploymentsByEnvironmentId({
    environmentId: env.id,
  });

  const tables = deployments.map((d) => ({
    chainId: d.deployment.chainId,
    tableId: d.deployment.tableId,
  }));

  const chainTypes = tables.reduce((acc, table) => {
    return acc.add(chainsMap.get(table.chainId)?.testnet);
  }, new Set<boolean | undefined>());

  return (
    <main className="m-4 flex flex-1 flex-col justify-center">
      <div className="m-auto grid max-w-4xl items-start justify-center gap-4 md:grid-cols-2">
        {chainTypes.size > 1 && (
          <div className="col-span-2 grid gap-4">
            <Card className="col-span-2">
              <CardHeader>
                <div className="flex items-center gap-2">
                  <CircleAlert className="text-destructive" />
                  <CardTitle className="text-destructive">
                    Warning: Mainnet/testnet collision
                  </CardTitle>
                </div>
                <CardDescription>
                  Your project includes both tables that have been deployed a
                  mainnet and tables that have been deployed to a testnet. This
                  is not recommended, as it can lead to unexpected behavior in
                  Studio when querying information about your tables and data
                  from your tables.
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        )}
        <div className="col-span-2 grid gap-4 lg:col-span-1">
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Info className="text-muted-foreground" />
                <CardTitle>Project description</CardTitle>
              </div>
              <CardDescription>{project.description}</CardDescription>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Table2 className="text-muted-foreground" />
                <CardTitle>Tables</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="text-center">
              <p className="text-3xl font-semibold">
                {deployments.length} of {defs.length}
              </p>
            </CardContent>
            <CardFooter className="justify-center text-sm text-muted-foreground">
              Tables deployed
            </CardFooter>
          </Card>
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Share2 className="text-muted-foreground" />
                <CardTitle>Share project</CardTitle>
              </div>
              <CardDescription>
                Please share the {project.name} project to let everyone know
                what you&apos;re working on and help us spread the word about
                Tableland Studio. Thank you!
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Share project={project} />
            </CardContent>
          </Card>
        </div>
        <div className="col-span-2 grid gap-4 lg:col-span-1">
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Folder className="text-muted-foreground" />
                <CardTitle>Project ID</CardTitle>
              </div>
              <CardDescription>
                Your project ID is useful when using the Studio CLI or Tableland
                SDK.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <HashDisplay
                hash={project.id}
                hashDesc="Project ID"
                copy
                className="text-3xl font-semibold"
              />
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Database className="text-muted-foreground" />
                <CardTitle>Environment ID</CardTitle>
              </div>
              <CardDescription>
                Your environment ID is useful when using the Studio CLI or
                Tableland SDK.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <HashDisplay
                hash={env.id}
                hashDesc="Environment ID"
                copy
                className="text-3xl font-semibold"
              />
            </CardContent>
          </Card>
        </div>
        <div className="col-span-2 grid gap-4">
          <Card className="col-span-2">
            <CardHeader>
              <div className="flex items-center gap-2">
                <Rows4 className="text-muted-foreground" />
                <CardTitle>SQL Logs</CardTitle>
              </div>
              <CardDescription>
                Logs for all write operations to all deployed tables in your
                project.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <SQLLogs tables={tables} />
            </CardContent>
          </Card>
        </div>
      </div>
    </main>
  );
}
