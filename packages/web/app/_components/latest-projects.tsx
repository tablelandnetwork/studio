"use client";

import Link from "next/link";
import { useState } from "react";
import { TimeSince } from "@/components/time";
import { Paginator } from "@/components/paginator";
import { TypographyH3 } from "@/components/typography-h3";
import { type store } from "@/lib/store";
import OrgAvatar from "@/components/org-avatar";

export type Projects = Awaited<
  ReturnType<typeof store.projects.latestProjects>
>;

export function LatestProjects({ projects }: { projects: Projects }) {
  const [pageSize] = useState(10);
  const [page, setPage] = useState(0);

  const offset = page * pageSize;

  return (
    <>
      <TypographyH3>Latest Studio Projects</TypographyH3>
      <div className={"mt-4 flex flex-col gap-4"}>
        {projects.slice(offset, offset + pageSize).map((item) => (
          <Link
            key={item.project.id}
            href={`/${item.org.slug}/${item.project.slug}`}
            className="flex flex-col items-start gap-2 rounded-md border p-4 text-left text-sm transition-all hover:bg-accent"
          >
            <div className="flex w-full flex-col gap-1">
              <div className="flex items-center gap-2">
                <OrgAvatar org={item.org} />
                <div className="flex items-center gap-2">
                  <div className="text-sm font-semibold">
                    {item.org.name}/{item.project.name}
                  </div>
                </div>
                {item.project.createdAt && (
                  <div className="ml-auto text-sm text-muted-foreground">
                    <TimeSince time={item.project.createdAt} />
                  </div>
                )}
              </div>
            </div>
          </Link>
        ))}
      </div>
      <Paginator
        numItems={projects.length}
        pageSize={pageSize}
        page={page}
        setPage={setPage}
      />
    </>
  );
}
