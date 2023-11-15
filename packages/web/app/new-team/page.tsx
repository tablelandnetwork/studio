import { Session } from "@tableland/studio-api";
import { cookies } from "next/headers";
import { notFound } from "next/navigation";
import NewTeam from "./_components/new-team";

export default async function NewProject() {
  const session = await Session.fromCookies(cookies());
  if (!session.auth) {
    notFound();
  }
  return (
    <div className="p-4">
      <NewTeam />
    </div>
  );
}
