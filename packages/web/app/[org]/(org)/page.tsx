import { Folder, Folders } from "lucide-react";
import Link from "next/link";
import { cache } from "react";
import NewProjectButton from "./_components/new-project-button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { api } from "@/trpc/server";
import { orgBySlug } from "@/lib/api-helpers";
import { TimeSince } from "@/components/time";

export default async function Projects({
  params,
}: {
  params: { org: string };
}) {
  // TODO: Make some high level API call to return a summary of all projects.
  const org = await orgBySlug(params.org);
  const projects = await cache(api.projects.orgProjects)({
    orgId: org.id,
  });
  const authorized = await cache(api.orgs.isAuthorized)({
    orgId: org.id,
  });

  const defs = await Promise.all(
    projects.map(
      async (project) =>
        await cache(api.defs.projectDefs)({ projectId: project.id }),
    ),
  );

  return (
    <main className="container flex max-w-5xl flex-col items-stretch gap-4 p-4">
      <div className="flex items-end">
        <h1 className="text-3xl font-medium">{org.name} projects</h1>
        {authorized && <NewProjectButton org={org} className="ml-auto" />}
      </div>

      {!projects.length && (
        <div className="flex flex-1 items-center justify-center gap-x-4 text-muted-foreground">
          <Folders className="size-8 flex-shrink-0" />
          <h1 className="text-2xl">
            Org <b>{org.name}</b> doesn&apos;t have any projects yet.
          </h1>
        </div>
      )}

      {!!projects.length && (
        <div className="grid grid-cols-4 gap-4">
          {projects.map((project, i) => {
            const defCount = defs[i].length;
            return (
              <Link
                key={project.id}
                href={`/${org.slug}/${project.slug}`}
                className="col-span-4 grid grid-cols-subgrid items-center rounded-md border bg-card p-4 hover:bg-accent"
              >
                <div className="flex items-center gap-x-4">
                  <Folder className="shrink-0" />
                  <h3 className="text-xl font-medium">{project.name}</h3>
                </div>
                <div className="flex">
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <p className="line-clamp-2 text-sm text-muted-foreground">
                          {project.description}
                        </p>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p className="max-w-xs">{project.description}</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
                <p className="text-sm text-muted-foreground">
                  {defCount} definitions
                </p>
                <p className="text-sm text-muted-foreground">
                  Created{" "}
                  {project.createdAt && <TimeSince time={project.createdAt} />}
                </p>
              </Link>
            );
          })}
        </div>
      )}
    </main>
  );
}
