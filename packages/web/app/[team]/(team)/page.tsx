import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { api } from "@/trpc/server-invoker";
import { Plus, Rocket, Table2 } from "lucide-react";
import Link from "next/link";

export default async function Projects({
  params,
}: {
  params: { team: string };
}) {
  // TODO: Make some high level API call to return a summary of all projects.
  const team = await api.teams.teamBySlug.query({ slug: params.team });
  const projects = await api.projects.teamProjects.query({ teamId: team.id });
  const authorized = await api.teams.isAuthorized.query({ teamId: team.id });

  const tables = await Promise.all(
    projects.map(
      async (project) =>
        await api.tables.projectTables.query({ projectId: project.id }),
    ),
  );
  const deployments = await Promise.all(
    projects.map(
      async (project) =>
        await api.deployments.projectDeployments.query({
          projectId: project.id,
        }),
    ),
  );

  return (
    <main className="container p-4">
      <div className="m-auto grid grid-flow-row grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
        {projects.map((project, i) => {
          const tableCount = tables[i].length;
          const deploymentsCount = deployments[i].length;
          return (
            <Link key={project.id} href={`/${team.slug}/${project.slug}`}>
              <Card className="">
                <CardHeader>
                  <CardTitle>{project.name}</CardTitle>
                  <CardDescription className="truncate">
                    {project.description}
                  </CardDescription>
                </CardHeader>
                <CardContent className="flex items-center justify-center space-x-6">
                  <div className="flex items-center gap-1">
                    <Table2 className="h-6 w-6" />
                    <div className="flex flex-col items-center">
                      <p className="text-4xl">{tableCount}</p>
                      <p className="text-sm text-muted-foreground">
                        Table{tableCount !== 1 && "s"}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    <Rocket className="h-6 w-6" />
                    <div className="flex flex-col items-center">
                      <p className="text-4xl">{deploymentsCount}</p>
                      <p className="text-sm text-muted-foreground">
                        Deployment{deploymentsCount !== 1 && "s"}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          );
        })}
      </div>
      {authorized && (
        <Link href={`/${team.slug}/new-project`}>
          <Button variant="ghost" className="mt-4">
            <Plus className="mr-2" />
            New Project
          </Button>
        </Link>
      )}
    </main>
  );
}
