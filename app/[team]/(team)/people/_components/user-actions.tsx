"use client";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Team, TeamMembership } from "@/db/schema";
import { cn } from "@/lib/utils";
import { DropdownMenuTriggerProps } from "@radix-ui/react-dropdown-menu";
import { MoreHorizontal } from "lucide-react";

type Props = DropdownMenuTriggerProps & {
  user: Team;
  userMembership: TeamMembership;
  member: Team;
  memberMembership: TeamMembership;
};

export default function UserActions({
  className,
  user,
  userMembership,
  member,
  memberMembership,
  ...props
}: Props) {
  async function toggleAdmin() {}

  async function removeUser() {}

  return (
    <DropdownMenu>
      <DropdownMenuTrigger className={cn(className)} {...props} asChild>
        <Button variant="ghost">
          <MoreHorizontal />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuLabel>{member.name}</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {(!userMembership.isOwner || user.id === member.id) && (
          <DropdownMenuItem disabled>No actions available</DropdownMenuItem>
        )}
        {userMembership.isOwner && user.id !== member.id && (
          <>
            <DropdownMenuItem onClick={toggleAdmin}>
              {memberMembership.isOwner ? "Remove" : "Make"} admin
            </DropdownMenuItem>
            <DropdownMenuItem onClick={removeUser}>
              Remove from team
            </DropdownMenuItem>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
