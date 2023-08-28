import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { store } from "@/lib/store";
import { Session } from "@tableland/studio-api";
import { Import, Plus } from "lucide-react";
import { cookies } from "next/headers";
import Link from "next/link";
import { notFound } from "next/navigation";

export default async function Project({
  params,
}: {
  params: { team: string; project: string };
}) {
  const session = await Session.fromCookies(cookies());
  if (!session.auth) {
    notFound();
  }

  const team = await store.teams.teamBySlug(params.team);
  if (!team) {
    notFound();
  }

  if (
    !(await store.teams.isAuthorizedForTeam(
      session.auth.personalTeam.id,
      team.id,
    ))
  ) {
    notFound();
  }

  const project = await store.projects.projectByTeamIdAndSlug(
    team.id,
    params.project,
  );
  if (!project) {
    notFound();
  }

  const tables = await store.tables.tablesByProjectId(project.id);

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
