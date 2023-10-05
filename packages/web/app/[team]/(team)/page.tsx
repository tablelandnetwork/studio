import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { api } from "@/trpc/server-http";
import {
  Folders,
  Gem,
  Plus,
  Rocket,
  Table2,
  UserCircle,
  Users,
} from "lucide-react";
import Link from "next/link";
import { cache } from "react";

export default async function Projects({
  params,
}: {
  params: { team: string };
}) {
  // TODO: Make some high level API call to return a summary of all projects.
  const team = await cache(api.teams.teamBySlug.query)({ slug: params.team });
  const projects = await cache(api.projects.teamProjects.query)({
    teamId: team.id,
  });
  const authorized = await cache(api.teams.isAuthorized.query)({
    teamId: team.id,
  });

  const tables = await Promise.all(
    projects.map(
      async (project) =>
        await cache(api.tables.projectTables.query)({ projectId: project.id }),
    ),
  );
  const deployments = await Promise.all(
    projects.map(
      async (project) =>
        await cache(api.deployments.projectDeployments.query)({
          projectId: project.id,
        }),
    ),
  );

  return (
    <main className="container flex flex-1 flex-col p-4">
      {authorized && (
        <Link href={`/${team.slug}/new-project`} className="ml-auto">
          <Button variant="ghost">
            <Plus className="mr-2" />
            New Project
          </Button>
        </Link>
      )}
      {!projects.length ? (
        <div className="m-auto flex max-w-xl flex-1 flex-col justify-center space-y-4 py-16">
          <div className="flex items-center space-x-4">
            <Gem className="flex-shrink-0" />
            <h1 className="text-2xl font-medium">
              {!!team.personal
                ? "Welcome to Tableland Studio!"
                : `Team ${team.name} has been created!`}
            </h1>
          </div>
          <div className="flex items-center space-x-4">
            <Users className="flex-shrink-0" />
            {!!team.personal ? (
              <p className="text-muted-foreground">
                In Studio, Teams are the top level container for your work. You
                can create new Teams and switch Teams using the Team switcher in
                the upper left corner of the screen. Once you create new Team,
                you can invite others to collaborate.
              </p>
            ) : (
              <p className="text-muted-foreground">
                You can invite others to collaborate in the People tab above.
              </p>
            )}
          </div>
          {!!team.personal && (
            <div className="flex items-center space-x-4">
              <UserCircle className="flex-shrink-0" />
              <p className="text-muted-foreground">
                We&apos;ve created a default Team &mdash;{" "}
                <span className="font-semibold text-foreground">
                  {team.slug}
                </span>{" "}
                &mdash; for you. {!!team.personal ? "This" : "It"} is your
                personal Team for your own projects &mdash; You can&apos;t
                invite collaborators {!!team.personal ? "here" : "there"}.
              </p>
            </div>
          )}
          <div className="flex items-center space-x-4">
            <Folders className="flex-shrink-0" />
            <p className="text-muted-foreground">
              Within a Team, work is organized into Projects. To get started,
              create a Project using the New Project button above.
            </p>
          </div>
        </div>
      ) : (
        <div className="grid grid-flow-row grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
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
      )}
    </main>
  );
}
