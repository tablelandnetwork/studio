"use client";

import { usePathname } from "next/navigation";
import { type HTMLAttributes } from "react";
import { cn } from "@/lib/utils";

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
