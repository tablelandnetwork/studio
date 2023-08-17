import db from "@/db/api";
import Session from "@/lib/session";
import { cookies } from "next/headers";
import { notFound } from "next/navigation";

export default async function ProjectSettings({
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

  return (
    <div>
      <h1>Project Settings</h1>
    </div>
  );
}
