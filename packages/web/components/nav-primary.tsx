"use client";

import { type schema } from "@tableland/studio-store";
import { useAtomValue } from "jotai";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { authAtom } from "@/store/auth";
import { cn } from "@/lib/utils";

function links(team?: schema.Team): Array<{
  label: string;
  href: string;
  isActive: (pathname: string) => boolean;
}> {
  const links = [
    {
      label: "Tableland",
      href: "https://tableland.xyz",
      isActive: (_: string) => false,
    },
    {
      label: "Docs",
      href: "https://docs.tableland.xyz",
      isActive: (_: string) => false,
    },
  ];
  if (team) {
    links.unshift({
      label: "Home",
      href: `/${team?.slug}`,
      isActive: (pathname: string) => pathname === `/${team.slug}`,
    });
  }
  return links;
}

export function NavPrimary({
  className,
  ...props
}: React.HTMLAttributes<HTMLElement>) {
  const auth = useAtomValue(authAtom);
  const pathname = usePathname();

  return (
    <nav
      className={cn("flex items-center space-x-4 lg:space-x-6", className)}
      {...props}
    >
      {links(auth?.personalTeam).map((link) => (
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
