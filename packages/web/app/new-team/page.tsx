import { getSession } from "@tableland/studio-api";
import { headers, cookies } from "next/headers";
import { notFound } from "next/navigation";
import NewTeamForm from "./_components/new-team-form";

export default async function NewProject() {
  const session = await getSession({ headers: headers(), cookies: cookies() });
  if (!session.auth) {
    notFound();
  }
  return (
    <div className="p-4">
      <NewTeamForm />
    </div>
  );
}
