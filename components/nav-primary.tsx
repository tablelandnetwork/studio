"use client";

import { Team } from "@/db/schema";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCallback } from "react";

function links(team?: Team) {
  const links = [
    { label: "Home", href: "/" },
    { label: "Tableland", href: "https://tableland.xyz" },
    { label: "Docs", href: "https://docs.tableland.xyz" },
    { label: "Dashboard", href: `/${team?.slug}` },
  ];
  if (!team) {
    links.pop();
  }
  return links;
}

export function NavPrimary({
  className,
  personalTeam,
  ...props
}: React.HTMLAttributes<HTMLElement> & {
  personalTeam?: Team;
}) {
  const pathname = usePathname();
  const navItemClassName = useCallback(
    (path: string) => {
      return cn(
        "text-sm font-medium transition-colors hover:text-primary",
        pathname !== path && "text-muted-foreground"
      );
    },
    [pathname]
  );

  return (
    <nav
      className={cn("flex items-center space-x-4 lg:space-x-6", className)}
      {...props}
    >
      {links(personalTeam).map((link) => (
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
