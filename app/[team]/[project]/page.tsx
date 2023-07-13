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
import { redirect } from "next/navigation";

export default async function Project({
  params,
}: {
  params: { team: string; project: string };
}) {
  const session = await Session.fromCookies(cookies());

  if (!session.auth) {
    // TODO: Redirect to 401 page.
    redirect("/");
  }

  // TODO: Check that user is authorized to access this team/project.

  const team = await db.teams.teamBySlug(params.team);
  // TODO: Figure out how drizzle handles not found even though the return type isn't optional.
  if (!team) {
    // TODO: Redirect to 404 page.
    redirect("/");
  }

  const project = await db.projects.projectByTeamIdAndSlug(
    team.id,
    params.project
  );
  if (!project) {
    // TODO: Redirect to 401 page.
    redirect("/");
  }

  const tables = await db.tables.tablesByProjectId(project.id);

  return (
    <>
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-semibold">Project</h1>
        <p className="text-lg text-gray-600">
          {team.name} / {project.name}
        </p>
        <p>{project.description}</p>
      </div>
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
    </>
  );
}