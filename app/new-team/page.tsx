import NewTeamForm from "@/components/new-team-form";
import Session from "@/lib/session";
import { cookies } from "next/headers";
import { notFound } from "next/navigation";

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
