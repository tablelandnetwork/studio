import { TRPCError } from "@trpc/server";
import { notFound } from "next/navigation";
import { cache } from "react";
import { api } from "@/trpc/server";

export async function teamBySlug(slug: string) {
  return await catch404(
    async () => await cache(api.teams.teamBySlug)({ slug }),
  );
}

export async function projectBySlug(slug: string, teamId?: string) {
  return await catch404(
    async () => await cache(api.projects.projectBySlug)({ teamId, slug }),
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
