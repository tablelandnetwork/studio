import { helpers } from "@tableland/sdk";
import { type schema } from "@tableland/studio-store";
import { Boxes, PencilRuler, Table2 } from "lucide-react";
import Link from "next/link";
import { cache } from "react";
import NewDef from "./_components/new-def";
import ImportTable from "./_components/import-table";
import { api } from "@/trpc/server";
import HashDisplay from "@/components/hash-display";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default async function Project({
  params,
}: {
  params: { team: string; project: string };
}) {
  const team = await cache(api.teams.teamBySlug)({ slug: params.team });
  const project = await cache(api.projects.projectBySlug)({
    teamId: team.id,
    slug: params.project,
  });
  const envs = await cache(api.environments.projectEnvironments)({
    projectId: project.id,
  });

  const defs = await cache(api.defs.projectDefs)({
    projectId: project.id,
  });
  const deployments = await cache(api.deployments.projectDeployments)({
    projectId: project.id,
  });
  const deploymentsMap = deployments.reduce((acc, deployment) => {
    acc.set(deployment.defId, deployment);
    return acc;
  }, new Map<string, schema.Deployment>());
  const authorized = await cache(api.teams.isAuthorized)({
    teamId: team.id,
  });

  return (
    <main className="container flex flex-col space-y-6 p-4">
      <div className="flex flex-col md:flex-row">
        <div className="min-w-1/2 space-y-1 pr-8">
          <h2 className="text-lg font-semibold tracking-tight">
            Project description
          </h2>
          <p className="whitespace-pre-wrap leading-tight text-muted-foreground">
            {project.description}
          </p>
        </div>
        <div className="space-y-1">
          <h2 className="text-lg font-semibold tracking-tight">Project ID</h2>
          <span className="block min-w-72 whitespace-pre-wrap leading-tight text-muted-foreground">
            <HashDisplay
              hash={project.id}
              numCharacters={60}
              copy={true}
              hashDesc="project id"
            />
          </span>
        </div>
      </div>
      <div className="flex flex-1 flex-col space-y-1">
        <div className="flex items-center">
          <h2 className="text-lg font-semibold tracking-tight">Definitions</h2>
          {authorized && (
            <div className="ml-auto">
              <NewDef teamPreset={team} projectPreset={project} />
              {envs.length && (
                <ImportTable
                  teamPreset={team}
                  projectPreset={project}
                  envPreset={envs[0]}
                />
              )}
            </div>
          )}
        </div>
        {!defs.length && (
          <div className="m-auto flex max-w-xl flex-1 flex-col justify-center space-y-4 py-16">
            <div className="flex items-center space-x-4">
              <PencilRuler className="flex-shrink-0" />
              <h1 className="text-2xl font-medium">
                This Project does not have any definitions yet.
              </h1>
            </div>
            {authorized && (
              <div className="flex items-center space-x-4">
                <Table2 className="flex-shrink-0" />
                <p className="text-muted-foreground">
                  Get started by creating a definition or importing a table
                  using the buttons above. Remember, definitions simply define
                  the shape of tables that will eventually be created on
                  Tableland &mdash; To actually deploy your definitions to
                  Tableland, vist the Project&apos;s{" "}
                  <Link href={`${project.slug}/tables`}>tables tab</Link>.
                </p>
              </div>
            )}
          </div>
        )}

        {!!defs.length && (
          <div className="grid grid-flow-row grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
            {defs.map((def) => {
              // const columnCount = 0;
              // const deploymentsCount = 0;
              const deployment = deploymentsMap.get(def.id);
              return (
                <Link
                  key={def.id}
                  href={`/${team.slug}/${project.slug}/${def.slug}`}
                >
                  <Card className="">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-1">
                        <Boxes />
                        {def.name}
                      </CardTitle>
                      <CardDescription className="truncate">
                        {def.description}
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
                          <Table2
                            className={
                              deployment ? "text-green-500" : "text-red-500"
                            }
                          />
                          <p className="text-xl">
                            {!deployment && `Not `}Deployed
                          </p>
                          {deployment && (
                            <p className="text-sm text-muted-foreground">
                              {
                                helpers.getChainInfo(deployment.chainId)
                                  .chainName
                              }
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
        )}
      </div>
    </main>
  );
}
