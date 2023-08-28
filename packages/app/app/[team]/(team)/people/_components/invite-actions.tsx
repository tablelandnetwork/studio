"use client";

import { deleteInvite, resendInvite } from "@/app/actions";
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
  const { toast } = useToast();

  async function onResendInvite() {
    await resendInvite(invite);
    toast({
      title: "Done!",
      description: "The invite has been re-sent.",
    });
  }

  async function onDeleteInvite() {
    await deleteInvite(invite);
    toast({
      title: "Done!",
      description: "The invite has been deleted.",
    });
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger className={cn(className)} {...props} asChild>
        <Button variant="ghost">
          <MoreHorizontal />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuLabel>{invite.email}</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={onResendInvite}>
          Re-send invite
        </DropdownMenuItem>
        {(!!membership.isOwner || inviter.id === user.id) && (
          <DropdownMenuItem onClick={onDeleteInvite}>
            Delete invite
          </DropdownMenuItem>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
