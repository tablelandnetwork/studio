import { api } from "@/trpc/server-invoker";
import { schema } from "@tableland/studio-store";
import { notFound } from "next/navigation";
import { Sidebar } from "./_components/sidebar";

export default async function Deployments({
  params,
}: {
  params: { team: string; project: string; slug?: string[] };
}) {
  if (params.slug && params.slug.length !== 2) {
    notFound();
  }

  const team = await api.teams.teamBySlug.query({ slug: params.team });
  const project = await api.projects.projectByTeamIdAndSlug.query({
    teamId: team.id,
    slug: params.project,
  });
  const environments = await api.environments.projectEnvironments.query({
    projectId: project.id,
  });
  const tables = await api.tables.projectTables.query({
    projectId: project.id,
  });
  const deployments = await api.deployments.projectDeployments.query({
    projectId: project.id,
  });

  let selectedEnvironment: schema.Environment | undefined;
  let selectedTable: schema.Table | undefined;
  if (params.slug && params.slug.length > 0) {
    const envSlug = params.slug[0];
    const tableSlug = params.slug[1];
    selectedEnvironment = environments.find(
      (environment) => environment.name === envSlug,
    );
    selectedTable = tables.find((table) => table.name === tableSlug);
    if (!selectedEnvironment || !selectedTable) {
      notFound();
    }
  }

  return (
    <div className="flex">
      <Sidebar
        className="sticky top-14 h-fit min-w-[200px]"
        environments={environments}
        selectedEnvironment={selectedEnvironment}
        tables={tables}
        selectedTable={selectedTable}
        deployments={deployments}
        teamSlug={params.team}
        projectSlug={params.project}
      />
      {selectedEnvironment && selectedTable ? (
        <p>
          Deployment for env: {selectedEnvironment.name} table:{" "}
          {selectedTable.name}
        </p>
      ) : (
        <p>
          Deployments overview {params.team} {params.project}
        </p>
      )}
    </div>
  );
}
