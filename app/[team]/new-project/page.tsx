import NewProjectForm from "@/components/new-project-form";
import db from "@/db/api";
import Session from "@/lib/session";
import { cookies } from "next/headers";
import { notFound } from "next/navigation";

export default async function NewProject({
  params,
}: {
  params: { team: string };
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
    !(await db.teams.isAuthorizedForTeam(session.auth.user.teamId, team.id))
  ) {
    notFound();
  }
  return (
    <div className="p-4">
      <NewProjectForm team={team} />
    </div>
  );
}
