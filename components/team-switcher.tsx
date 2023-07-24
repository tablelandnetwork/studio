"use client";

import { newTeam } from "@/app/actions";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
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
import { Check, ChevronsUpDown, Loader2, PlusCircle } from "lucide-react";
import { useRouter } from "next/navigation";
import * as React from "react";
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
  const [newTeamName, setNewTeamName] = React.useState("");
  const [emailInvites, setEmailInvites] = React.useState<string[]>([]);
  const [open, setOpen] = React.useState(false);
  const [showNewTeamDialog, setShowNewTeamDialog] = React.useState(false);
  const [isPending, startTransition] = React.useTransition();

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
    startTransition(async () => {
      const res = await newTeam(newTeamName, emailInvites);
      router.push(`/${res.slug}`);
      router.refresh();
      setNewTeamName("");
      setEmailInvites([]);
      setShowNewTeamDialog(false);
    });
  };

  const handleCancel = () => {
    setShowNewTeamDialog(false);
    setNewTeamName("");
    setEmailInvites([]);
  };

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
            {team.name}
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[200px] p-0">
          <Command>
            <CommandList>
              {/* <CommandInput placeholder="Search team..." /> */}
              <CommandEmpty>No team found.</CommandEmpty>
              {teamGroups.map((group) => {
                if (!group.teams.length) {
                  return;
                }
                return (
                  <CommandGroup key={group.label} heading={group.label}>
                    {group.teams.map((groupTeam) => (
                      <CommandItem
                        key={groupTeam.id}
                        onSelect={() => {
                          router.push(`/${groupTeam.slug}`);
                          setOpen(false);
                        }}
                        className="text-sm"
                      >
                        {groupTeam.name}
                        <Check
                          className={cn(
                            "ml-auto h-4 w-4",
                            team.id === groupTeam.id
                              ? "opacity-100"
                              : "opacity-0"
                          )}
                        />
                      </CommandItem>
                    ))}
                  </CommandGroup>
                );
              })}
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
          {/* {newTeam.isError && (
            <p>Error creating team: {newTeam.error.message}</p>
          )} */}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={handleCancel} disabled={isPending}>
            Cancel
          </Button>
          <Button type="submit" onClick={handleNewTeam} disabled={isPending}>
            {isPending && <Loader2 className="mr-2 h-5 w-5 animate-spin" />}
            Submit
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
