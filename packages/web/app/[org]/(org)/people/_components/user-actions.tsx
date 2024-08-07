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
  org: schema.Org;
  user: schema.Org;
  userMembership: schema.OrgMembership;
  member: schema.Org;
  memberMembership: schema.OrgMembership;
  claimedInviteId?: string;
};

export default function UserActions({
  className,
  org,
  user,
  userMembership,
  member,
  memberMembership,
  claimedInviteId,
  ...props
}: Props) {
  const router = useRouter();
  const { toast } = useToast();

  const toggleAdmin = api.orgs.toggleAdmin.useMutation({
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

  const removeUser = api.orgs.removeOrgMember.useMutation({
    onSuccess: () => {
      router.refresh();
      toast({
        title: "Success!",
        description: (
          <p>
            <span className="font-semibold text-black">{member.name}</span> has
            been removed from{" "}
            <span className="font-semibold text-black">{org.name}</span>.
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
          disabled={toggleAdmin.isPending || removeUser.isPending}
        >
          <MoreHorizontal
            className={cn(
              (toggleAdmin.isPending || removeUser.isPending) &&
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
                toggleAdmin.mutate({ orgId: org.id, userId: member.id })
              }
            >
              {memberMembership.isOwner ? "Remove" : "Make"} admin
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() =>
                removeUser.mutate({ orgId: org.id, userId: member.id })
              }
            >
              Remove from org
            </DropdownMenuItem>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
