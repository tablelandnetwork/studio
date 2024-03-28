"use client";

import { cn } from "@/lib/utils";
import { usePathname } from "next/navigation";
import { HTMLAttributes } from "react";

export default function PathAwareHeader({
  children,
  className,
  ...rest
}: HTMLAttributes<HTMLDivElement>) {
  const path = usePathname();

  const showBorder =
    path === "/" ||
    path.startsWith("/invite") ||
    path === "/sql-log" ||
    path.startsWith("/table");

  return (
    <header
      {...rest}
      className={cn(className, showBorder && "border-b border-[#080A1E]")}
    >
      {children}
    </header>
  );
}
