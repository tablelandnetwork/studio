import { Session } from "@tableland/studio-api";
import { cookies } from "next/headers";
import { notFound } from "next/navigation";
import NewTeamForm from "./_components/new-team-form";

export default async function NewProject() {
  const session = await Session.fromCookies(cookies());
  if (!session.auth) {
    notFound();
  }
  return (
    <div className="p-4">
      <NewTeamForm />
    </div>
  );
}
