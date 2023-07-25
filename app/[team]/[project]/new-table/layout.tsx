import CrumbBack from "@/components/crumb-back";
import db from "@/db/api";
import Session from "@/lib/session";
import { cookies } from "next/headers";

export default async function NewProjectLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { auth } = await Session.fromCookies(cookies());
  const teams = auth ? await db.teams.teamsByMemberId(auth.user.teamId) : [];
  return (
    <div>
      <header className="sticky top-0 flex flex-col space-y-4 border-b bg-white px-4 py-3">
        <CrumbBack title="New Table" />
      </header>
      {children}
    </div>
  );
}
