import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import db from "@/db/api";
import Session from "@/lib/session";
import { Plus } from "lucide-react";
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

  const team = await db.teams.teamBySlug(params.team);
  if (!team) {
    notFound();
  }

  if (
    !(await db.teams.isAuthorizedForTeam(session.auth.personalTeam.id, team.id))
  ) {
    notFound();
  }

  const project = await db.projects.projectByTeamIdAndSlug(
    team.id,
    params.project
  );
  if (!project) {
    notFound();
  }

  const tables = await db.tables.tablesByProjectId(project.id);

  return (
    <div className="container m-auto grid grid-flow-row grid-cols-1 gap-4 p-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
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
          <CardTitle>New Table</CardTitle>
        </CardHeader>
        <CardContent className="flex items-center justify-center">
          <Link href={`/${team.slug}/${project.slug}/new-table`}>
            <Button variant={"ghost"}>
              <Plus />
            </Button>
          </Link>
        </CardContent>
      </Card>
    </div>
  );
}
