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
import { useToast } from "@/components/ui/use-toast";
import { cn } from "@/lib/utils";
import { api } from "@/trpc/react";
import { DropdownMenuTriggerProps } from "@radix-ui/react-dropdown-menu";
import { schema } from "@tableland/studio-store";
import { MoreHorizontal } from "lucide-react";
import { useRouter } from "next/navigation";

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
  const router = useRouter();
  const { toast } = useToast();

  const toggleAdmin = api.teams.toggleAdmin.useMutation({
    onSuccess: () => {
      router.refresh();
      toast({
        title: "Success!",
        description: (
          <p>
            <span className="font-semibold text-black">{member.name}</span> is{" "}
            {memberMembership.isOwner ? "no longer" : "now"} an admin.
          </p>
        ),
      });
    },
  });

  const removeUser = api.teams.removeTeamMember.useMutation({
    onSuccess: () => {
      router.refresh();
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
    },
  });

  return (
    <DropdownMenu>
      <DropdownMenuTrigger className={cn(className)} {...props} asChild>
        <Button
          variant="ghost"
          disabled={toggleAdmin.isLoading || removeUser.isLoading}
        >
          <MoreHorizontal
            className={cn(
              (toggleAdmin.isLoading || removeUser.isLoading) &&
                "animate-pulse",
            )}
          />
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
            <DropdownMenuItem
              onClick={() =>
                toggleAdmin.mutate({ teamId: team.id, userId: member.id })
              }
            >
              {!!memberMembership.isOwner ? "Remove" : "Make"} admin
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() =>
                removeUser.mutate({ teamId: team.id, userId: member.id })
              }
            >
              Remove from team
            </DropdownMenuItem>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
