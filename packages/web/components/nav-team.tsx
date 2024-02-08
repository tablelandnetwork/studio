"use client";

import { type schema } from "@tableland/studio-store";
import Link from "next/link";
import { useParams, usePathname } from "next/navigation";
import { api } from "@/trpc/react";
import { cn } from "@/lib/utils";

function teamLinks(team: schema.Team) {
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
  return links;
}

export default function NavTeam({
  className,
  ...props
}: React.HTMLAttributes<HTMLElement> & Record<string, unknown>) {
  const pathname = usePathname();
  const { team: teamSlug } = useParams<{ team: string }>();
  const team = api.teams.teamBySlug.useQuery({ slug: teamSlug });

  if (!team.data) {
    return null;
  }

  return (
    <div>
      <nav className={cn("flex flex-col items-start", className)} {...props}>
        {teamLinks(team.data).map((link) => (
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
        <p>doo</p>
        <p>doo</p>
        <p>doo</p>
        <p>doo</p>
        <p>doo</p>
        <p>doo</p>
        <p>doo</p>
        <p>doo</p>
        <p>doo</p>
        <p>doo</p>
        <p>doo</p>
        <p>doo</p>
        <p>doo</p>
        <p>doo</p>
        <p>doo</p>
        <p>doo</p>
        <p>doo</p>
        <p>doo</p>
        <p>doo</p>
        <p>doo</p>
        <p>doo</p>
        <p>doo</p>
        <p>doo</p>
        <p>doo</p>
        <p>doo</p>
        <p>doo</p>
        <p>doo</p>
        <p>doo</p>
        <p>doo</p>
        <p>doo</p>
        <p>doo</p>
        <p>doo</p>
        <p>doo</p>
        <p>doo</p>
        <p>doo</p>
        <p>doo</p>
        <p>doo</p>
        <p>doo</p>
        <p>doo</p>
        <p>doo</p>
        <p>doo</p>
        <p>doo</p>
        <p>doo</p>
        <p>doo</p>
        <p>doo</p>
      </nav>
    </div>
  );
}
