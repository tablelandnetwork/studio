import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Team } from "@/db/schema";
import { ChevronDown, Loader2, Plus } from "lucide-react";
import React from "react";
import TagInput from "./tag-input";
import { Label } from "./ui/label";

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
  }[];
  team: Team;
};

export function Invites({ invites, team }: Props) {
  const [showNewTeamDialog, setShowNewTeamDialog] = React.useState(false);
  const [emailInvites, setEmailInvites] = React.useState<string[]>([]);
  const [creatingTeam, setCreatingTeam] = React.useState(false);
  const [error, setError] = React.useState("");

  const handleNewTeam = async () => {
    console.log(emailInvites);
    // if (!newTeamName.length) return;
    // setError("");
    // setCreatingTeam(true);
    // try {
    //   const team = await newTeam([{ name: newTeamName, emailInvites }]);
    //   setCreatingTeam(false);
    //   setNewTeamName("");
    //   setShowNewTeamDialog(false);
    //   router.push(`/${team.slug}/projects`);
    // } catch (err: any) {
    //   // TODO: Figure out how to handle this error from tRPC.
    //   setError("There was an error creating your team.");
    //   setCreatingTeam(false);
    // }
  };

  const handleCancel = () => {
    setShowNewTeamDialog(false);
    setCreatingTeam(false);
    setEmailInvites([]);
  };

  return (
    <Dialog open={showNewTeamDialog} onOpenChange={setShowNewTeamDialog}>
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
            onClick={() => setShowNewTeamDialog(true)}
          >
            <Plus className="ml-auto" />
          </Button>
        </div>
        <CardContent className="grid gap-6">
          <div className="flex items-center justify-between space-x-4">
            <div className="flex items-center space-x-4">
              <Avatar>
                <AvatarImage src="/avatars/01.png" />
                <AvatarFallback>OM</AvatarFallback>
              </Avatar>
              <div>
                <p className="text-sm font-medium leading-none">Sofia Davis</p>
                <p className="text-sm text-muted-foreground">m@example.com</p>
              </div>
            </div>
            <Popover>
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
            </Popover>
          </div>
          <div className="flex items-center justify-between space-x-4">
            <div className="flex items-center space-x-4">
              <Avatar>
                <AvatarImage src="/avatars/02.png" />
                <AvatarFallback>JL</AvatarFallback>
              </Avatar>
              <div>
                <p className="text-sm font-medium leading-none">Jackson Lee</p>
                <p className="text-sm text-muted-foreground">p@example.com</p>
              </div>
            </div>
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className="ml-auto">
                  Member{" "}
                  <ChevronDown className="ml-2 h-4 w-4 text-muted-foreground" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="p-0" align="end">
                <Command>
                  <CommandInput placeholder="Select new role..." />
                  <CommandList>
                    <CommandEmpty>No roles found.</CommandEmpty>
                    <CommandGroup className="p-1.5">
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
            </Popover>
          </div>
        </CardContent>
      </Card>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Invite others to the {team.name} team</DialogTitle>
          <DialogDescription>
            You can invite other by email address.
          </DialogDescription>
        </DialogHeader>
        <div>
          <div className="space-y-4 py-2 pb-4">
            <div className="space-y-2">
              <Label htmlFor="emails">Invite others by email</Label>
              <TagInput
                id="emails"
                placeholder="Enter email address, press enter"
                tags={emailInvites}
                setTags={setEmailInvites}
              />
            </div>
          </div>
          {!!error && <p>{error}</p>}
        </div>
        <DialogFooter>
          <Button
            variant="outline"
            onClick={handleCancel}
            disabled={creatingTeam}
          >
            Cancel
          </Button>
          <Button type="submit" onClick={handleNewTeam} disabled={creatingTeam}>
            {creatingTeam && <Loader2 className="mr-2 h-5 w-5 animate-spin" />}
            Submit
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
