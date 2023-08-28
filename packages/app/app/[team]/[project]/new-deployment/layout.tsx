import CrumbBack from "@/components/crumb-back";
import { store } from "@/lib/store";
import { Session } from "@tableland/studio-api";
import { cookies } from "next/headers";

export default async function NewProjectLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { auth } = await Session.fromCookies(cookies());
  const teams = auth ? await store.teams.teamsByMemberId(auth.user.teamId) : [];
  return (
    <div>
      <header className="sticky top-0 flex flex-col space-y-4 border-b bg-white px-4 py-3">
        <CrumbBack title="New Deployment" />
      </header>
      {children}
    </div>
  );
}
