import { store } from "@/lib/store";
import { Session } from "@tableland/studio-api";
import { cookies } from "next/headers";
import { notFound } from "next/navigation";

export default async function TeamSettings({
  params,
}: {
  params: { team: string };
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
  return <div>Team settings</div>;
}
