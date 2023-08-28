"use client";

import { store } from "@/lib/store";
import { cn } from "@/lib/utils";
import { schema } from "@tableland/studio-store";
import Link from "next/link";
import { useParams, usePathname } from "next/navigation";
import { useCallback } from "react";

function teamLinks(team: schema.Team) {
  const links = [
    { label: "Projects", href: `/${team.slug}` },
    { label: "People", href: `/${team.slug}/people` },
    { label: "Settings", href: `/${team.slug}/settings` },
  ];
  if (team.personal) {
    links.splice(1, 1);
  }
  return links;
}

export default function NavTeam({
  className,
  teams,
  ...props
}: React.HTMLAttributes<HTMLElement> & {
  teams: Awaited<ReturnType<typeof store.teams.teamsByMemberId>>;
}) {
  const pathname = usePathname();
  const { team: teamSlug, project: projectSlug } = useParams();
  const navItemClassName = useCallback(
    (path: string) => {
      return cn(
        "text-sm font-medium transition-colors hover:text-primary",
        pathname !== path && "text-muted-foreground",
      );
    },
    [pathname],
  );

  const team = teams.find((team) => team.slug === teamSlug);
  if (!team) {
    return null;
  }

  return (
    <nav
      className={cn("flex items-center space-x-4 lg:space-x-6", className)}
      {...props}
    >
      {teamLinks(team).map((link) => (
        <Link
          key={link.href}
          href={link.href}
          className={navItemClassName(link.href)}
        >
          {link.label}
        </Link>
      ))}
    </nav>
  );
}
