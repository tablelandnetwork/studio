"use client";

import { type DropdownMenuTriggerProps } from "@radix-ui/react-dropdown-menu";
import { type schema } from "@tableland/studio-store";
import { MoreHorizontal } from "lucide-react";
import { useRouter } from "next/navigation";
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

type Props = DropdownMenuTriggerProps & {
  invite: schema.OrgInvite;
  inviter: schema.Org;
  user: schema.Org;
  membership: schema.OrgMembership;
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
          disabled={resendInvite.isPending || deleteInvite.isPending}
        >
          <MoreHorizontal
            className={cn(
              (resendInvite.isPending || deleteInvite.isPending) &&
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
            resendInvite.mutate({ orgId: invite.orgId, inviteId: invite.id })
          }
        >
          Re-send invite
        </DropdownMenuItem>
        {(!!membership.isOwner || inviter.id === user.id) && (
          <DropdownMenuItem
            onClick={() =>
              deleteInvite.mutate({
                orgId: invite.orgId,
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
