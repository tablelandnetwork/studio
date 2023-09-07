import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { api } from "@/trpc/server-invoker";
import { Import, Plus } from "lucide-react";
import Link from "next/link";

export default async function Project({
  params,
}: {
  params: { team: string; project: string };
}) {
  const team = await api.teams.teamBySlug.query({ slug: params.team });
  const project = await api.projects.projectByTeamIdAndSlug.query({
    teamId: team.id,
    slug: params.project,
  });
  const tables = await api.tables.projectTables.query({
    projectId: project.id,
  });

  return (
    <div className="container grid grid-flow-row grid-cols-1 gap-4 p-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
      {tables.map((table) => {
        return (
          <Link
            key={table.id}
            href={`/${team.slug}/${project.slug}/${table.slug}`}
          >
            <Card className="">
              <CardHeader>
                <CardTitle>{table.name}</CardTitle>
                <CardDescription className="truncate">
                  {table.description}
                </CardDescription>
              </CardHeader>
              <CardContent className="flex items-center justify-center space-x-6"></CardContent>
            </Card>
          </Link>
        );
      })}
      <Card className="">
        <CardHeader className="items-center">
          <CardTitle>Add Table</CardTitle>
        </CardHeader>
        <CardContent className="flex items-center justify-center">
          <Link href={`/${team.slug}/${project.slug}/new-table`}>
            <Button variant={"ghost"}>
              <Plus />
            </Button>
          </Link>
          <Link href={`/${team.slug}/${project.slug}/import-table`}>
            <Button variant={"ghost"}>
              <Import />
            </Button>
          </Link>
        </CardContent>
      </Card>
    </div>
  );
}
