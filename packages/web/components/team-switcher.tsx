"use client";

import { type schema } from "@tableland/studio-store";
import { Check, ChevronsUpDown, PlusCircle } from "lucide-react";
import * as React from "react";
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
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";

type PopoverTriggerProps = React.ComponentPropsWithoutRef<
  typeof PopoverTrigger
>;

interface TeamSwitcherProps extends PopoverTriggerProps {
  selectedTeam?: schema.Team;
  teams?: schema.Team[];
  onTeamSelected?: (team: schema.Team) => void;
  onNewTeamSelected?: () => void;
}

export default function TeamSwitcher({
  className,
  selectedTeam,
  teams,
  onTeamSelected,
  onNewTeamSelected,
}: TeamSwitcherProps) {
  const [open, setOpen] = React.useState(false);

  const teamGroups: Array<{ label: string; teams: schema.Team[] }> = [
    {
      label: "Personal Team",
      teams: [],
    },
    {
      label: "Teams",
      teams: [],
    },
  ];
  teams?.forEach((team) => {
    if (team.personal) {
      teamGroups[0].teams.push(team);
    } else {
      teamGroups[1].teams.push(team);
    }
  });

  return (
    <div className="flex items-center gap-1">
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            aria-label="Select a team"
            className={cn("justify-between", className)}
          >
            {selectedTeam?.name ?? "Select a team..."}
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
                  return undefined;
                }
                return (
                  <CommandGroup key={group.label} heading={group.label}>
                    {group.teams.map((groupTeam) => (
                      <CommandItem
                        key={groupTeam.id}
                        onSelect={() => {
                          onTeamSelected?.(groupTeam);
                          setOpen(false);
                        }}
                        className="text-sm"
                      >
                        {groupTeam.name}
                        <Check
                          className={cn(
                            "ml-auto h-4 w-4",
                            selectedTeam?.id === groupTeam.id
                              ? "opacity-100"
                              : "opacity-0",
                          )}
                        />
                      </CommandItem>
                    ))}
                  </CommandGroup>
                );
              })}
            </CommandList>
            {onNewTeamSelected && (
              <>
                <CommandSeparator />
                <CommandList>
                  <CommandGroup>
                    <CommandItem
                      onSelect={() => {
                        setOpen(false);
                        onNewTeamSelected();
                      }}
                    >
                      <PlusCircle className="mr-2 h-5 w-5" />
                      New Team
                    </CommandItem>
                  </CommandGroup>
                </CommandList>
              </>
            )}
          </Command>
        </PopoverContent>
      </Popover>
    </div>
  );
}
