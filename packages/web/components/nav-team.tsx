"use client";

import { type schema } from "@tableland/studio-store";
import Link from "next/link";
import { useParams, usePathname } from "next/navigation";
import { skipToken } from "@tanstack/react-query";
import { api } from "@/trpc/react";
import { cn } from "@/lib/utils";

function teamLinks(team: schema.Team, includeSettings: boolean) {
  const links: Array<{
    label: string;
    href: string;
    isActive: (pathname: string) => boolean;
  }> = [
    {
      label: "Projects",
      href: `/${team.slug}`,
      isActive: (pathname: string) => pathname === `/${team.slug}`,
    },
  ];
  if (!team.personal) {
    links.push({
      label: "People",
      href: `/${team.slug}/people`,
      isActive: (pathname: string) => pathname === `/${team.slug}/people`,
    });
  }
  if (includeSettings) {
    links.push({
      label: "Settings",
      href: `/${team.slug}/settings`,
      isActive: (pathname: string) =>
        pathname.startsWith(`/${team.slug}/settings`),
    });
  }
  return links;
}

export default function NavTeam({
  className,
  ...props
}: React.HTMLAttributes<HTMLElement> & Record<string, unknown>) {
  const pathname = usePathname();
  const { team: teamSlug } = useParams<{ team: string }>();
  const team = api.teams.teamBySlug.useQuery({ slug: teamSlug });
  const authorization = api.teams.isAuthorized.useQuery(
    team.data ? { teamId: team.data.id } : skipToken,
  );

  if (!(team.data && authorization.data !== undefined)) {
    return (
      <div className={cn("flex flex-col", className)} {...props}>
        <nav className="flex items-center space-x-4 lg:space-x-6">
          <div className="h-5 w-24 animate-pulse rounded bg-gray-200"></div>
        </nav>
      </div>
    );
  }

  return (
    <div>
      <nav
        className={cn("flex items-center space-x-4 lg:space-x-6", className)}
        {...props}
      >
        {teamLinks(team.data, !!authorization.data).map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className={cn(
              "text-sm font-medium transition-colors hover:text-primary",
              !link.isActive(pathname) && "text-muted-foreground",
            )}
          >
            {link.label}
          </Link>
        ))}
      </nav>
    </div>
  );
}
