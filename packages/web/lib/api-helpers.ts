import { TRPCError } from "@trpc/server";
import { notFound } from "next/navigation";
import { cache } from "react";
import { api } from "@/trpc/server";

export async function orgBySlug(slug: string) {
  return await catch404(async () => await cache(api.orgs.orgBySlug)({ slug }));
}

export async function projectBySlug(slug: string, orgId?: string) {
  return await catch404(
    async () => await cache(api.projects.projectBySlug)({ orgId, slug }),
  );
}

export async function environmentBySlug(projectId: string, slug: string) {
  return await catch404(
    async () =>
      await cache(api.environments.environmentBySlug)({ projectId, slug }),
  );
}

export async function defBySlug(projectId: string, slug: string) {
  return await catch404(
    async () =>
      await cache(api.defs.defByProjectIdAndSlug)({ projectId, slug }),
  );
}

async function catch404<T>(work: () => Promise<T>) {
  try {
    return await work();
  } catch (e) {
    if (e instanceof TRPCError && e.code === "NOT_FOUND") {
      notFound();
    }
    throw e;
  }
}
