"use client";

import { cn } from "@/lib/utils";
import { authAtom } from "@/store/wallet";
import { schema } from "@tableland/studio-store";
import { useAtomValue } from "jotai";
import Link from "next/link";
import { usePathname } from "next/navigation";

function links(
  team?: schema.Team,
): { label: string; href: string; isActive: (pathname: string) => boolean }[] {
  const links = [
    {
      label: "Home",
      href: "/",
      isActive: (pathname: string) => pathname === "/",
    },
    {
      label: "Tableland",
      href: "https://tableland.xyz",
      isActive: () => false,
    },
    {
      label: "Docs",
      href: "https://docs.tableland.xyz",
      isActive: () => false,
    },
  ];
  if (team) {
    links.push({
      label: "Studio",
      href: `/${team?.slug}`,
      isActive: (pathname: string) =>
        pathname.includes(`/${team.slug}`) || pathname === "/new-team",
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
