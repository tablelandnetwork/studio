"use client";

import { type schema } from "@tableland/studio-store";
import { Check, ChevronsUpDown, PlusCircle } from "lucide-react";
import { useRouter } from "next/navigation";
import * as React from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command";
import { Button } from "@/components/ui/button";

type PopoverTriggerProps = React.ComponentPropsWithoutRef<
  typeof PopoverTrigger
>;

interface ProjectSwitcherProps extends PopoverTriggerProps {
  team: schema.Team;
  selectedProject: schema.Project;
  projects: schema.Project[];
}

export default function ProjectSwitcher({
  className,
  team,
  selectedProject,
  projects,
}: ProjectSwitcherProps) {
  const router = useRouter();

  const [open, setOpen] = React.useState(false);

  return (
    <div className="flex items-center gap-1">
      <Link href={`/${team.slug}/${selectedProject.slug}`}>
        {selectedProject.name}
      </Link>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="ghost"
            size="sm"
            role="combobox"
            aria-expanded={open}
            aria-label="Select a project"
            className={cn("justify-between px-0", className)}
          >
            <ChevronsUpDown className="m-1 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[200px] p-0">
          <Command>
            <CommandList>
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
                          : "opacity-0",
                      )}
                    />
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
            <CommandSeparator />
            <CommandList>
              <CommandGroup>
                <CommandItem
                  onSelect={() => {
                    setOpen(false);
                    router.push(`/${team.slug}/new-project`);
                  }}
                >
                  <PlusCircle className="mr-2 h-5 w-5" />
                  New Project
                </CommandItem>
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
    </div>
  );
}
