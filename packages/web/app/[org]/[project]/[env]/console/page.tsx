import { cache } from "react";
import dynamic from "next/dynamic";
import { getSession } from "@tableland/studio-api";
import { cookies, headers } from "next/headers";
import { environmentBySlug, projectBySlug, orgBySlug } from "@/lib/api-helpers";
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
  params: { org: string; project: string; env: string };
}) {
  const session = await getSession({ headers: headers(), cookies: cookies() });
  const org = await orgBySlug(params.org);
  const project = await projectBySlug(params.project, org.id);
  const environment = await environmentBySlug(project.id, params.env);
  const deployments = await cache(api.deployments.deploymentsByEnvironmentId)({
    environmentId: environment.id,
  });

  return (
    <main className="flex min-h-[calc(100vh-3.507rem)] p-4">
      <ConsoleTabs
        auth={session.auth}
        projectId={project.id}
        nativeMode={!!project.nativeMode}
        environmentId={environment.id}
        deployments={deployments}
      />
    </main>
  );
}
