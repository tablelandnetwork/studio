"use client";

import { useRouter } from "next/navigation";
import * as React from "react";

import { Button } from "@/components/ui/button";
import { Team } from "@/db/schema";
import { cn } from "@/lib/utils";

interface TeamButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  team: Team;
}

export default function TeamButton({
  className,
  team,
  ...props
}: TeamButtonProps) {
  const router = useRouter();

  return (
    <Button
      variant="ghost"
      size="sm"
      role="navigation"
      aria-label="Go to team"
      className={cn("justify-between", className)}
      onClick={() => router.push(`/${team.slug}`)}
      {...props}
    >
      {team.name}
    </Button>
  );
}
