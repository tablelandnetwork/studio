import { RedirectType, redirect } from "next/navigation";
import { projectBySlug } from "@/lib/api-helpers";
import { api } from "@/trpc/server";

export default async function Page({
  params,
  searchParams,
}: {
  params: { team: string; project: string };
  searchParams: Record<string, string | string[] | undefined>;
}) {
  const table =
    typeof searchParams.table === "string" ? searchParams.table : undefined;
  const project = await projectBySlug(params.project);
  const env = await api.environments.userEnvironmentForProject({
    projectId: project.id,
  });
  const path = table
    ? `/${params.team}/${params.project}/${env.slug}/${table}`
    : `/${params.team}/${params.project}/${env.slug}`;

  redirect(path, RedirectType.replace);
}
