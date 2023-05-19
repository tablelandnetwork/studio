import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Team } from "@/db/schema";
import { trpc } from "@/utils/trpc";
import TimeAgo from "javascript-time-ago";
import en from "javascript-time-ago/locale/en";
import { Loader2, Plus } from "lucide-react";
import { useRouter } from "next/router";
import React from "react";
import TagInput from "./tag-input";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
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
  personalTeam: Team;
};

export function Invites({ invites, team, personalTeam }: Props) {
  const inviteEmails = trpc.teams.inviteEmails.useMutation();
  const [showInviteDialog, setShowInviteDialog] = React.useState(false);
  const [emailInvites, setEmailInvites] = React.useState<string[]>([]);
  const router = useRouter();

  const handleNewTeam = async () => {
    if (!emailInvites.length) return;
    inviteEmails.mutate({ teamId: team.id, emails: emailInvites });
  };

  const handleCancel = () => {
    setShowInviteDialog(false);
    setEmailInvites([]);
  };

  React.useEffect(() => {
    router.replace(router.asPath);
    setShowInviteDialog(false);
    setEmailInvites([]);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [inviteEmails.isSuccess]);

  invites.sort((a, b) => {
    const aVal = a.invite.claimedAt || a.invite.createdAt;
    const bVal = b.invite.claimedAt || b.invite.createdAt;
    return new Date(bVal).getTime() - new Date(aVal).getTime();
  });

  return (
    <Dialog open={showInviteDialog} onOpenChange={setShowInviteDialog}>
      <Card>
        <div className="flex items-center pr-6">
          <CardHeader>
            <CardTitle>Invites</CardTitle>
            <CardDescription>
              Invite your team members to collaborate.
            </CardDescription>
          </CardHeader>
          <Button
            variant="outline"
            className="ml-auto"
            onClick={() => setShowInviteDialog(true)}
          >
            <Plus className="" />
          </Button>
        </div>
        <CardContent className="grid gap-6">
          {invites.map(({ invite, inviter, claimedBy }) => (
            <div
              key={invite.id}
              className="flex items-center justify-between space-x-4"
            >
              <div className="flex items-center space-x-4">
                <Avatar>
                  {claimedBy && (
                    <AvatarImage
                      src={`https://avatar.vercel.sh/${claimedBy.slug}.png`}
                      alt={claimedBy.name}
                    />
                  )}
                  <AvatarFallback>
                    {claimedBy
                      ? claimedBy.name.charAt(0)
                      : invite.email.charAt(0)}
                  </AvatarFallback>
                </Avatar>

                <div>
                  <p className="text-sm font-medium leading-none">
                    {invite.email}
                  </p>

                  {claimedBy && invite.claimedAt && (
                    <p className="text-sm text-muted-foreground">
                      Claimed by{" "}
                      <span className="font-medium">
                        {claimedBy.id === personalTeam.id
                          ? "you"
                          : claimedBy.name}
                      </span>{" "}
                      {timeAgo.format(new Date(invite.claimedAt))}
                    </p>
                  )}
                  {!claimedBy && (
                    <p className="text-sm text-muted-foreground">
                      Invited by{" "}
                      <span className="font-medium">
                        {inviter.id === personalTeam.id ? "you" : inviter.name}
                      </span>{" "}
                      {timeAgo.format(new Date(invite.createdAt))}
                    </p>
                  )}
                </div>
              </div>
              {/* <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="ml-auto">
                    Owner{" "}
                    <ChevronDown className="ml-2 h-4 w-4 text-muted-foreground" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="p-0" align="end">
                  <Command>
                    <CommandInput placeholder="Select new role..." />
                    <CommandList>
                      <CommandEmpty>No roles found.</CommandEmpty>
                      <CommandGroup>
                        <CommandItem className="teamaspace-y-1 flex flex-col items-start px-4 py-2">
                          <p>Viewer</p>
                          <p className="text-sm text-muted-foreground">
                            Can view and comment.
                          </p>
                        </CommandItem>
                        <CommandItem className="teamaspace-y-1 flex flex-col items-start px-4 py-2">
                          <p>Developer</p>
                          <p className="text-sm text-muted-foreground">
                            Can view, comment and edit.
                          </p>
                        </CommandItem>
                        <CommandItem className="teamaspace-y-1 flex flex-col items-start px-4 py-2">
                          <p>Billing</p>
                          <p className="text-sm text-muted-foreground">
                            Can view, comment and manage billing.
                          </p>
                        </CommandItem>
                        <CommandItem className="teamaspace-y-1 flex flex-col items-start px-4 py-2">
                          <p>Owner</p>
                          <p className="text-sm text-muted-foreground">
                            Admin-level access to all resources.
                          </p>
                        </CommandItem>
                      </CommandGroup>
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover> */}
            </div>
          ))}
        </CardContent>
      </Card>
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
          {inviteEmails.error && (
            <p>Error sending invites: {inviteEmails.error.message}</p>
          )}
        </div>
        <DialogFooter>
          <Button
            variant="outline"
            onClick={handleCancel}
            disabled={inviteEmails.isLoading}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            onClick={handleNewTeam}
            disabled={inviteEmails.isLoading}
          >
            {inviteEmails.isLoading && (
              <Loader2 className="mr-2 h-5 w-5 animate-spin" />
            )}
            Submit
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
