"use client";

import { inviteEmails } from "@/app/actions";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Team } from "@/db/schema";
import TimeAgo from "javascript-time-ago";
import en from "javascript-time-ago/locale/en";
import { Loader2, Plus } from "lucide-react";
import React from "react";
import TagInput from "./tag-input";
import { Label } from "./ui/label";

TimeAgo.addDefaultLocale(en);
const timeAgo = new TimeAgo("en-US");

type Props = {
  invites: {
    inviter: {
      id: string;
      name: string;
      slug: string;
      personal: number;
    };
    invite: {
      email: string;
      id: string;
      teamId: string;
      inviterTeamId: string;
      createdAt: string;
      claimedByTeamId: string | null;
      claimedAt: string | null;
    };
    claimedBy: {
      id: string;
      name: string;
      slug: string;
      personal: number;
    } | null;
  }[];
  team: Team;
};

export function Invite({ invites, team }: Props) {
  const [showInviteDialog, setShowInviteDialog] = React.useState(false);
  const [emailInvites, setEmailInvites] = React.useState<string[]>([]);
  const [isPending, startTransition] = React.useTransition();

  const handleInvite = async () => {
    if (!emailInvites.length) return;
    startTransition(async () => {
      await inviteEmails(team, emailInvites);
      setShowInviteDialog(false);
      setEmailInvites([]);
    });
  };

  const handleCancel = () => {
    setShowInviteDialog(false);
    setEmailInvites([]);
  };

  invites.sort((a, b) => {
    const aVal = a.invite.claimedAt || a.invite.createdAt;
    const bVal = b.invite.claimedAt || b.invite.createdAt;
    return new Date(bVal).getTime() - new Date(aVal).getTime();
  });

  return (
    <Dialog open={showInviteDialog} onOpenChange={setShowInviteDialog}>
      <Button
        variant="outline"
        className="ml-auto"
        onClick={() => setShowInviteDialog(true)}
      >
        <Plus className="" />
      </Button>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            Invite others to the{" "}
            <span className="text-muted-foreground">{team.name}</span> team
          </DialogTitle>
          <DialogDescription>
            You can invite others by email address and they will be able to
            ingore your invite or accept it with any authentication mechanism
            they choose.
          </DialogDescription>
        </DialogHeader>
        <div>
          <div className="space-y-4 py-2 pb-4">
            <div className="space-y-2">
              <Label htmlFor="emails">Email addresses to invite</Label>
              <TagInput
                id="emails"
                placeholder="Enter email address, press enter"
                tags={emailInvites}
                setTags={setEmailInvites}
              />
            </div>
          </div>
          {/* {inviteEmails.error && (
            <p>Error sending invites: {inviteEmails.error.message}</p>
          )} */}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={handleCancel} disabled={isPending}>
            Cancel
          </Button>
          <Button
            type="submit"
            onClick={handleInvite}
            disabled={isPending || !emailInvites.length}
          >
            {isPending && <Loader2 className="mr-2 h-5 w-5 animate-spin" />}
            Submit
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
