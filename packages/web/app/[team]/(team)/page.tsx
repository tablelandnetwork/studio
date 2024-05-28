import { AlertCircle, Boxes, Folders, Table2 } from "lucide-react";
import Link from "next/link";
import { cache } from "react";
import NewProjectButton from "./_components/new-project-button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { api } from "@/trpc/server";
import { teamBySlug } from "@/lib/api-helpers";

export default async function Projects({
  params,
}: {
  params: { team: string };
}) {
  // TODO: Make some high level API call to return a summary of all projects.
  const team = await teamBySlug(params.team);
  const projects = await cache(api.projects.teamProjects)({
    teamId: team.id,
  });
  const authorized = await cache(api.teams.isAuthorized)({
    teamId: team.id,
  });
  const authenticated = await api.auth.authenticated();

  const defs = await Promise.all(
    projects.map(
      async (project) =>
        await cache(api.defs.projectDefs)({ projectId: project.id }),
    ),
  );
  const deployments = await Promise.all(
    projects.map(
      async (project) =>
        await cache(api.deployments.projectDeployments)({
          projectId: project.id,
        }),
    ),
  );

  return (
    <main className="container flex flex-1 flex-col p-4">
      {!authorized && authenticated && (
        <Alert className="mb-4 flex flex-1 items-center">
          <span className="mr-2">
            <AlertCircle />
          </span>
          <AlertDescription>
            You don&apos;t currently have access to work in this team. If you
            think this is a mistake contact the owner and ask them to invite you
            to the team.
          </AlertDescription>
        </Alert>
      )}

      {authorized && <NewProjectButton team={team} />}

      {!projects.length && (
        <div className="m-auto flex max-w-xl flex-1 flex-col justify-center space-y-4 py-16">
          <div className="flex items-center space-x-4">
            <Folders className="flex-shrink-0" />
            <h1 className="text-2xl font-medium">
              Team <b>{team.name}</b> doesn&apos;t have any projects yet.
            </h1>
          </div>
        </div>
      )}

      {!!projects.length && (
        <div className="grid grid-flow-row grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
          {projects.map((project, i) => {
            const defCount = defs[i].length;
            const deploymentsCount = deployments[i].length;
            return (
              <Link
                key={project.id}
                href={`/${team.slug}/${project.slug}/default`} // TODO: Handle multiple environments and read from local storage or session.
              >
                <Card className="">
                  <CardHeader>
                    <CardTitle>{project.name}</CardTitle>
                    <CardDescription className="truncate">
                      {project.description}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="flex items-center justify-center space-x-6">
                    <div className="flex items-center gap-1">
                      <Boxes className="h-6 w-6" />
                      <div className="flex flex-col items-center">
                        <p className="text-4xl">{defCount}</p>
                        <p className="text-sm text-muted-foreground">
                          Definition{defCount !== 1 && "s"}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-1">
                      <Table2 className="h-6 w-6" />
                      <div className="flex flex-col items-center">
                        <p className="text-4xl">{deploymentsCount}</p>
                        <p className="text-sm text-muted-foreground">
                          Table{deploymentsCount !== 1 && "s"}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            );
          })}
        </div>
      )}
    </main>
  );
}
