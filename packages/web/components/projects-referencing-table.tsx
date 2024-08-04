"use client";

import { type RouterOutputs } from "@tableland/studio-api";
import Link from "next/link";
import { type ComponentProps } from "react";
import { ScrollArea } from "./ui/scroll-area";

type Props = {
  references: RouterOutputs["deployments"]["deploymentReferences"];
} & ComponentProps<typeof ScrollArea>;

export default function ProjectsReferencingTable({
  references,
  ...rest
}: Props) {
  return (
    <ScrollArea {...rest}>
      <ul className="space-y-1">
        {references.map((p) => (
          <li key={p.project.id}>
            <Link
              href={`/${p.org.slug}/${p.project.slug}/${p.environment.slug}/${p.def.slug}`}
              className="text-foreground"
            >
              {p.org.name}/{p.project.name}
            </Link>
          </li>
        ))}
      </ul>
    </ScrollArea>
  );
}
