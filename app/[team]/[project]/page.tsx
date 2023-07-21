import NewTable from "@/components/new-table";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import db from "@/db/api";
import Session from "@/lib/session";
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
    <div className="mx-auto flex w-full max-w-3xl flex-col space-y-4 p-4">
      <div className="flex w-full max-w-3xl flex-col space-y-4">
        {tables.map((table) => (
          <Link
            key={table.id}
            href={`/${team.slug}/${project.slug}/${table.name}`}
          >
            <Card>
              <CardHeader>
                <CardTitle>{table.name}</CardTitle>
                <CardDescription>{table.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <p>{table.schema}</p>
              </CardContent>
              <CardFooter>
                <p>Card Footer</p>
              </CardFooter>
            </Card>
          </Link>
        ))}
      </div>
      <NewTable project={project} />
    </div>
  );
}
