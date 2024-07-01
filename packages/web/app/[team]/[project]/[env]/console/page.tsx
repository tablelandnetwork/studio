import { TRPCError } from "@trpc/server";
import { Console } from "@/components/console";
import {
  environmentBySlug,
  projectBySlug,
  teamBySlug,
} from "@/lib/api-helpers";

export default async function ConsolePage({
  params,
}: {
  params: { team: string; project: string; env: string };
}) {
  const team = await teamBySlug(params.team);
  const project = await projectBySlug(params.project, team.id);
  const environment = await environmentBySlug(project.id, params.env);

  if (!environment) {
    throw new TRPCError({
      code: "NOT_FOUND",
    });
  }

  return (
    <main className="flex-1 p-4">
      <Console environmentId={environment.id} />
    </main>
  );
}
