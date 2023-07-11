"use client";

import { Check, ChevronsUpDown, PlusCircle } from "lucide-react";
import { useRouter } from "next/router";
import * as React from "react";

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
import { DialogTrigger } from "@/components/ui/dialog";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Project, Team } from "@/db/schema";
import { cn } from "@/lib/utils";

import NewProject from "./new-project";

type PopoverTriggerProps = React.ComponentPropsWithoutRef<
  typeof PopoverTrigger
>;

interface ProjectSwitcherProps extends PopoverTriggerProps {
  team: Team;
  selectedProject: Project;
  projects: Project[];
}

export default function ProjectSwitcher({
  className,
  team,
  selectedProject,
  projects,
}: ProjectSwitcherProps) {
  const router = useRouter();

  const [open, setOpen] = React.useState(false);
  const [showNewProjectDialog, setShowNewTeamDialog] = React.useState(false);

  return (
    <NewProject
      team={team}
      open={showNewProjectDialog}
      onOpenChange={setShowNewTeamDialog}
    >
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="ghost"
            size="sm"
            role="combobox"
            aria-expanded={open}
            aria-label="Select a project"
            className={cn("justify-between", className)}
          >
            {selectedProject.name}
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[200px] p-0">
          <Command>
            <CommandList>
              <CommandInput placeholder="Search projects..." />
              <CommandEmpty>No project found.</CommandEmpty>
              <CommandGroup heading="Projects">
                {projects.map((project) => (
                  <CommandItem
                    key={project.id}
                    onSelect={() => {
                      router.push(`/${team.slug}/${project.slug}`);
                      setOpen(false);
                    }}
                    className="text-sm"
                  >
                    {project.name}
                    <Check
                      className={cn(
                        "ml-auto h-4 w-4",
                        project.id === selectedProject.id
                          ? "opacity-100"
                          : "opacity-0"
                      )}
                    />
                  </CommandItem>
                ))}
              </CommandGroup>
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
                    New Project
                  </CommandItem>
                </DialogTrigger>
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
    </NewProject>
  );
}
