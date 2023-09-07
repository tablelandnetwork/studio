"use client";

import { removeTeamMember, toggleAdmin } from "@/app/actions";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useToast } from "@/components/ui/use-toast";
import { cn } from "@/lib/utils";
import { DropdownMenuTriggerProps } from "@radix-ui/react-dropdown-menu";
import { schema } from "@tableland/studio-store";
import { MoreHorizontal } from "lucide-react";
import { useTransition } from "react";

type Props = DropdownMenuTriggerProps & {
  team: schema.Team;
  user: schema.Team;
  userMembership: schema.TeamMembership;
  member: schema.Team;
  memberMembership: schema.TeamMembership;
  claimedInviteId?: string;
};

export default function UserActions({
  className,
  team,
  user,
  userMembership,
  member,
  memberMembership,
  claimedInviteId,
  ...props
}: Props) {
  const { toast } = useToast();
  const [pending, startTransition] = useTransition();

  async function onToggleAdmin() {
    startTransition(async () => {
      await toggleAdmin(team, member);
      toast({
        title: "Success!",
        description: (
          <p>
            <span className="font-semibold text-black">{member.name}</span> is{" "}
            {memberMembership.isOwner ? "no longer" : "now"} an admin.
          </p>
        ),
      });
    });
  }

  async function onRemoveUser() {
    startTransition(async () => {
      await removeTeamMember(team, member);
      toast({
        title: "Success!",
        description: (
          <p>
            <span className="font-semibold text-black">{member.name}</span> has
            been removed from{" "}
            <span className="font-semibold text-black">{team.name}</span>.
          </p>
        ),
      });
    });
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger className={cn(className)} {...props} asChild>
        <Button variant="ghost" disabled={pending}>
          <MoreHorizontal className={cn(pending && "animate-pulse")} />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuLabel>
          {member.name}
          {user.id === member.id && " (You)"}
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        {(!userMembership.isOwner || user.id === member.id) && (
          <DropdownMenuItem disabled>No actions available</DropdownMenuItem>
        )}
        {!!userMembership.isOwner && user.id !== member.id && (
          <>
            <DropdownMenuItem onClick={onToggleAdmin}>
              {!!memberMembership.isOwner ? "Remove" : "Make"} admin
            </DropdownMenuItem>
            <DropdownMenuItem onClick={onRemoveUser}>
              Remove from team
            </DropdownMenuItem>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
