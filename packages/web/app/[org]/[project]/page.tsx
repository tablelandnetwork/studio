import { RedirectType, redirect } from "next/navigation";
import { projectBySlug, orgBySlug } from "@/lib/api-helpers";
import { api } from "@/trpc/server";

export default async function Page({
  params,
  searchParams,
}: {
  params: { org: string; project: string };
  searchParams: Record<string, string | string[] | undefined>;
}) {
  const table =
    typeof searchParams.table === "string" ? searchParams.table : undefined;
  const org = await orgBySlug(params.org);
  const project = await projectBySlug(params.project, org.id);
  const env = await api.environments.environmentPreferenceForProject({
    projectId: project.id,
  });
  const path = table
    ? `/${params.org}/${params.project}/${env.slug}/${table}`
    : `/${params.org}/${params.project}/${env.slug}`;

  redirect(path, RedirectType.replace);
}
