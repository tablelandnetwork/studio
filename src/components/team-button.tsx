"use client";

import { useRouter } from "next/router";
import * as React from "react";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
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
      onClick={() => router.push(`/${team.slug}/projects`)}
      {...props}
    >
      <Avatar className="mr-2 h-5 w-5">
        <AvatarImage
          src={`https://avatar.vercel.sh/${team.slug}.png`}
          alt={team.name}
        />
        <AvatarFallback>{team.name.charAt(0)}</AvatarFallback>
      </Avatar>
      {team.name}
    </Button>
  );
}
