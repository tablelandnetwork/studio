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
  invite: schema.TeamInvite;
  inviter: schema.Team;
  user: schema.Team;
  membership: schema.TeamMembership;
};

export default function InviteActions({
  className,
  invite,
  inviter,
  user,
  membership,
  ...props
}: Props) {
  const router = useRouter();
  const { toast } = useToast();

  const resendInvite = api.invites.resendInvite.useMutation({
    onSuccess: () => {
      toast({
        title: "Done!",
        description: "The invite has been re-sent.",
      });
    },
  });

  const deleteInvite = api.invites.deleteInvite.useMutation({
    onSuccess: () => {
      router.refresh();
      toast({
        title: "Done!",
        description: "The invite has been deleted.",
      });
    },
  });

  return (
    <DropdownMenu>
      <DropdownMenuTrigger className={cn(className)} {...props} asChild>
        <Button
          variant="ghost"
          disabled={resendInvite.isLoading || deleteInvite.isLoading}
        >
          <MoreHorizontal
            className={cn(
              (resendInvite.isLoading || deleteInvite.isLoading) &&
                "animate-pulse",
            )}
          />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuLabel>{invite.email}</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onClick={() =>
            resendInvite.mutate({ teamId: invite.teamId, inviteId: invite.id })
          }
        >
          Re-send invite
        </DropdownMenuItem>
        {(!!membership.isOwner || inviter.id === user.id) && (
          <DropdownMenuItem
            onClick={() =>
              deleteInvite.mutate({
                teamId: invite.teamId,
                inviteId: invite.id,
              })
            }
          >
            Delete invite
          </DropdownMenuItem>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
