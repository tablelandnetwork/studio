"use client";

import { Check, ChevronsUpDown, Loader2, PlusCircle } from "lucide-react";
import { useRouter } from "next/router";
import * as React from "react";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Team } from "@/db/schema";
import { cn } from "@/lib/utils";
import { trpc } from "@/utils/trpc";
import TagInput from "./tag-input";

type PopoverTriggerProps = React.ComponentPropsWithoutRef<
  typeof PopoverTrigger
>;

interface TeamSwitcherProps extends PopoverTriggerProps {
  team: Team;
  teams: Team[];
}

export default function TeamSwitcher({
  className,
  team,
  teams,
}: TeamSwitcherProps) {
  const router = useRouter();
  const newTeam = trpc.teams.newTeam.useMutation();
  const [newTeamName, setNewTeamName] = React.useState("");
  const [emailInvites, setEmailInvites] = React.useState<string[]>([]);
  const [open, setOpen] = React.useState(false);
  const [showNewTeamDialog, setShowNewTeamDialog] = React.useState(false);

  const teamGroups: { label: string; teams: Team[] }[] = [
    {
      label: "Personal Team",
      teams: [],
    },
    {
      label: "Teams",
      teams: [],
    },
  ];
  teams.forEach((team) => {
    if (team.personal) {
      teamGroups[0].teams.push(team);
    } else {
      teamGroups[1].teams.push(team);
    }
  });

  const handleNewTeam = () => {
    if (!newTeamName.length) return;
    newTeam.mutate({ name: newTeamName, emailInvites });
  };

  const handleCancel = () => {
    setShowNewTeamDialog(false);
    setNewTeamName("");
    setEmailInvites([]);
  };

  React.useEffect(() => {
    if (newTeam.isSuccess) {
      router.push(`/${newTeam.data.slug}/projects`);
      setNewTeamName("");
      setEmailInvites([]);
      setShowNewTeamDialog(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [newTeam.isSuccess]);

  return (
    <Dialog open={showNewTeamDialog} onOpenChange={setShowNewTeamDialog}>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="ghost"
            size="sm"
            role="combobox"
            aria-expanded={open}
            aria-label="Select a team"
            className={cn("justify-between", className)}
          >
            <Avatar className="mr-2 h-5 w-5">
              <AvatarImage
                src={`https://avatar.vercel.sh/${team.slug}.png`}
                alt={team.name}
              />
              <AvatarFallback>{team.name.charAt(0)}</AvatarFallback>
            </Avatar>
            {team.name}
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[200px] p-0">
          <Command>
            <CommandList>
              <CommandInput placeholder="Search team..." />
              <CommandEmpty>No team found.</CommandEmpty>
              {teamGroups.map((group) => (
                <CommandGroup key={group.label} heading={group.label}>
                  {group.teams.map((groupTeam) => (
                    <CommandItem
                      key={groupTeam.id}
                      onSelect={() => {
                        router.push(`/${groupTeam.slug}/projects`);
                        setOpen(false);
                      }}
                      className="text-sm"
                    >
                      <Avatar className="mr-2 h-5 w-5">
                        <AvatarImage
                          src={`https://avatar.vercel.sh/${groupTeam.slug}.png`}
                          alt={groupTeam.name}
                        />
                        <AvatarFallback>
                          {groupTeam.name.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                      {groupTeam.name}
                      <Check
                        className={cn(
                          "ml-auto h-4 w-4",
                          team.id === groupTeam.id ? "opacity-100" : "opacity-0"
                        )}
                      />
                    </CommandItem>
                  ))}
                </CommandGroup>
              ))}
            </CommandList>
            <CommandSeparator />
            <CommandList>
              <CommandGroup>
                <DialogTrigger asChild>
                  <CommandItem
                    onSelect={() => {
                      setOpen(false);
                      setShowNewTeamDialog(true);
                    }}
                  >
                    <PlusCircle className="mr-2 h-5 w-5" />
                    Create Team
                  </CommandItem>
                </DialogTrigger>
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create team</DialogTitle>
          <DialogDescription>
            Create a new team to manage collaborators, projects, and table
            deployments.
          </DialogDescription>
        </DialogHeader>
        <div>
          <div className="space-y-4 py-2 pb-4">
            <div className="space-y-2">
              <Label htmlFor="name">Team name</Label>
              <Input
                id="name"
                placeholder="Acme Inc."
                value={newTeamName}
                onChange={(e) => setNewTeamName(e.target.value)}
              />
            </div>
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
          {newTeam.isError && (
            <p>Error creating team: {newTeam.error.message}</p>
          )}
        </div>
        <DialogFooter>
          <Button
            variant="outline"
            onClick={handleCancel}
            disabled={newTeam.isLoading}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            onClick={handleNewTeam}
            disabled={newTeam.isLoading}
          >
            {newTeam.isLoading && (
              <Loader2 className="mr-2 h-5 w-5 animate-spin" />
            )}
            Submit
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
