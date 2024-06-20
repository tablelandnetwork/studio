import { type schema } from "@tableland/studio-store";
import { cache } from "react";
import { TRPCError } from "@trpc/server";
import { getSession } from "@tableland/studio-api";
import { cookies, headers } from "next/headers";
import NeedsDeploy from "./_components/needs-deploy";
import { Console } from "@/components/console";
import { api } from "@/trpc/server";
import {
  defBySlug,
  environmentBySlug,
  projectBySlug,
  teamBySlug,
} from "@/lib/api-helpers";
import DefDetails from "@/components/def-details";
import TableWrapper from "@/components/table-wrapper";

export default async function ConsolePage({
  params,
}: {
  params: { team: string; project: string; env: string };
}) {
  const session = await getSession({ headers: headers(), cookies: cookies() });
  const team = await teamBySlug(params.team);
  const project = await projectBySlug(params.project, team.id);
  const environment = await environmentBySlug(project.id, params.env);

  if (!environment) {
    throw new TRPCError({
      code: "NOT_FOUND",
      status: 404,
    });
  }

  const isAuthorized = await cache(api.teams.isAuthorized)({ teamId: team.id });

  return (
    <main className="flex-1 p-4">
      <Console environmentId={environment.id} />
    </main>
  );
}
