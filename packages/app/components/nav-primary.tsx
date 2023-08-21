"use client";

import { Team } from "@/db/schema";
import { cn } from "@/lib/utils";
import { authAtom } from "@/store/wallet";
import { useAtomValue } from "jotai";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCallback } from "react";

function links(team?: Team) {
  const links = [
    { label: "Home", href: "/" },
    { label: "Tableland", href: "https://tableland.xyz" },
    { label: "Docs", href: "https://docs.tableland.xyz" },
    { label: "Studio", href: `/${team?.slug}` },
  ];
  if (!team) {
    links.pop();
  }
  return links;
}

export function NavPrimary({
  className,
  ...props
}: React.HTMLAttributes<HTMLElement>) {
  const auth = useAtomValue(authAtom);
  const pathname = usePathname();
  const navItemClassName = useCallback(
    (path: string) => {
      return cn(
        "text-sm font-medium transition-colors hover:text-primary",
        pathname !== path && "text-muted-foreground",
      );
    },
    [pathname],
  );

  return (
    <nav
      className={cn("flex items-center space-x-4 lg:space-x-6", className)}
      {...props}
    >
      {links(auth?.personalTeam).map((link) => (
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
