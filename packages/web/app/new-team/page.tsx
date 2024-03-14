import { notFound } from "next/navigation";
import NewTeamForm from "./_components/new-team-form";
import { getSession } from "@/lib/session";

export default async function NewTeam() {
  const session = await getSession();
  if (!session.auth) {
    notFound();
  }
  return (
    <div className="p-4">
      <NewTeamForm />
    </div>
  );
}
