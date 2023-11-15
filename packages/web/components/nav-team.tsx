"use client";

import { cn } from "@/lib/utils";
import { api } from "@/trpc/react";
import { schema } from "@tableland/studio-store";
import Link from "next/link";
import { useParams, usePathname } from "next/navigation";
import Crumb from "./crumb";

function teamLinks(team: schema.Team) {
  const links: {
    label: string;
    href: string;
    isActive: (pathname: string) => boolean;
  }[] = [
    {
      label: "Projects",
      href: `/${team.slug}`,
      isActive: (pathname: string) => pathname === `/${team.slug}`,
    },
    {
      label: "Settings",
      href: `/${team.slug}/settings`,
      isActive: (pathname: string) => pathname === `/${team.slug}/settings`,
    },
  ];
  if (!team.personal) {
    links.splice(1, 0, {
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
}: React.HTMLAttributes<HTMLElement> & {}) {
  const pathname = usePathname();
  const { team: teamSlug } = useParams<{ team: string }>();
  const team = api.teams.teamBySlug.useQuery({ slug: teamSlug });

  if (!team.data) {
    return null;
  }

  return (
    <div>
      <Crumb title={team.data.name} className="mb-2" />
      <nav
        className={cn("flex items-center space-x-4 lg:space-x-6", className)}
        {...props}
      >
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
      </nav>
    </div>
  );
}
