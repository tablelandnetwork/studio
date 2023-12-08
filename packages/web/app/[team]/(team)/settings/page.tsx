import { cache } from "react";
import SettingsForm from "./_components/settings-form";
import { api } from "@/trpc/server";
import { H2, P } from "@/components/typography";

export default async function TeamSettings({
  params,
}: {
  params: { team: string };
}) {
  const team = await cache(api.teams.teamBySlug.query)({ slug: params.team });

  return (
    <main className="container max-w-3xl space-y-6 py-4">
      <section>
        <H2>Team Information</H2>
        <SettingsForm team={team} className="mt-4" />
      </section>
      <section>
        <H2 className="text-red-500">Danger Zone</H2>
      </section>
    </main>
  );
}
