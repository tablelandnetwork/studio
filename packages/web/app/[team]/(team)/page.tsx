import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { api } from "@/trpc/server-invoker";
import { Plus } from "lucide-react";
import Link from "next/link";

export default async function Projects({
  params,
}: {
  params: { team: string };
}) {
  const team = await api.teams.teamBySlug.query({ slug: params.team });
  const projects = await api.projects.teamProjects.query({ teamId: team.id });

  return (
    <div className="container m-auto grid grid-flow-row grid-cols-1 gap-4 p-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
      {projects.map((project) => {
        const tableCount = Math.floor(Math.random() * 20) + 1;
        const deploymentsCount = Math.floor(Math.random() * 4) + 1;
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
                <div className="flex flex-col items-center">
                  <p className="text-4xl">{tableCount}</p>
                  <p className="text-sm text-muted-foreground">
                    Table{tableCount !== 1 && "s"}
                  </p>
                </div>
                <div className="flex flex-col items-center">
                  <p className="text-4xl">{deploymentsCount}</p>
                  <p className="text-sm text-muted-foreground">
                    Deployment{deploymentsCount !== 1 && "s"}
                  </p>
                </div>
              </CardContent>
            </Card>
          </Link>
        );
      })}
      <Card className="">
        <CardHeader className="items-center">
          <CardTitle>New Project</CardTitle>
        </CardHeader>
        <CardContent className="flex items-center justify-center">
          <Link href={`/${team.slug}/new-project`}>
            <Button variant={"ghost"}>
              <Plus />
            </Button>
          </Link>
        </CardContent>
      </Card>
    </div>
  );
}
