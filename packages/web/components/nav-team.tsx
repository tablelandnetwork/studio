"use client";

import { teamBySlug } from "@/app/actions";
import { cn } from "@/lib/utils";
import { api } from "@/trpc/server-invoker";
import { schema } from "@tableland/studio-store";
import Link from "next/link";
import { useParams, usePathname } from "next/navigation";
import { useEffect, useState } from "react";

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
  teams,
  ...props
}: React.HTMLAttributes<HTMLElement> & {
  teams: Awaited<ReturnType<typeof api.teams.userTeams.query>>;
}) {
  const pathname = usePathname();
  const { team: teamSlug } = useParams<{ team: string }>();
  const [team, setTeam] = useState<schema.Team | undefined>(undefined);
  useEffect(() => {
    const getTeam = async () => {
      const team = await teamBySlug(teamSlug);
      setTeam(team);
    };
    getTeam();
  }, [teamSlug]);

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
          className={cn(
            "text-sm font-medium transition-colors hover:text-primary",
            !link.isActive(pathname) && "text-muted-foreground",
          )}
        >
          {link.label}
        </Link>
      ))}
    </nav>
  );
}
