"use client";

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
import { schema } from "@tableland/studio-store";
import { Check, ChevronsUpDown, PlusCircle } from "lucide-react";
import { useRouter } from "next/navigation";
import * as React from "react";

type PopoverTriggerProps = React.ComponentPropsWithoutRef<
  typeof PopoverTrigger
>;

interface TeamSwitcherProps extends PopoverTriggerProps {
  team: schema.Team;
  teams: schema.Team[];
}

export default function TeamSwitcher({
  className,
  team,
  teams,
}: TeamSwitcherProps) {
  const router = useRouter();
  const [open, setOpen] = React.useState(false);

  const teamGroups: { label: string; teams: schema.Team[] }[] = [
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

  return (
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
                            : "opacity-0",
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
              <CommandItem
                onSelect={() => {
                  setOpen(false);
                  router.push("/new-team");
                }}
              >
                <PlusCircle className="mr-2 h-5 w-5" />
                New Team
              </CommandItem>
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}