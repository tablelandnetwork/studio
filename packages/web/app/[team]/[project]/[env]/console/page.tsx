import { cache } from "react";
import dynamic from "next/dynamic";
import {
  environmentBySlug,
  projectBySlug,
  teamBySlug,
} from "@/lib/api-helpers";
import { api } from "@/trpc/server";

const ConsoleTabs = dynamic(
  async () => await import("@/components/console-tabs"),
  {
    ssr: false,
  },
);

export default async function ConsolePage({
  params,
}: {
  params: { team: string; project: string; env: string };
}) {
  const team = await teamBySlug(params.team);
  const project = await projectBySlug(params.project, team.id);
  const environment = await environmentBySlug(project.id, params.env);
  const deployments = await cache(api.deployments.deploymentsByEnvironmentId)({
    environmentId: environment.id,
  });

  return (
    <main className="flex min-h-[calc(100vh-3.507rem)] p-4">
      <ConsoleTabs
        environmentId={environment.id}
        defs={deployments.map((d) => d.def)}
      />
    </main>
  );
}
