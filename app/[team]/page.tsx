import NewProject from "@/components/new-project";
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

export default async function Projects({
  params,
}: {
  params: { team: string };
}) {
  const session = await Session.fromCookies(cookies());
  if (!session.auth) {
    // TODO: Redirect to 401 page.
    redirect("/");
  }

  // TODO: Check that user is authorized to access this team/project.

  const team = await db.teams.teamBySlug(params.team);
  const projects = await db.projects.projectsByTeamId(team.id);

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col space-y-4 p-4">
      {projects.map((project) => (
        <Link key={project.id} href={`/${team.slug}/${project.slug}`}>
          <Card>
            <CardHeader>
              <CardTitle>{project.name}</CardTitle>
              <CardDescription>{project.description}</CardDescription>
            </CardHeader>
            <CardContent>
              <p>Card Content</p>
            </CardContent>
            <CardFooter>
              <p>Card Footer</p>
            </CardFooter>
          </Card>
        </Link>
      ))}
      <NewProject team={team} />
    </div>
  );
}
