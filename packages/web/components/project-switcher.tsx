"use client";

import { type schema } from "@tableland/studio-store";
import { Check, ChevronsUpDown, PlusCircle } from "lucide-react";
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

type ProjectSwitcherProps = {
  variant?: "navigation" | "select";
  org?: schema.Org;
  selectedProject?: schema.Project;
  projects?: schema.Project[];
  onProjectSelected?: (project: schema.Project) => void;
  onNewProjectSelected?: () => void;
  disabled?: boolean;
} & React.HTMLAttributes<HTMLDivElement>;

export default function ProjectSwitcher({
  className,
  variant = "navigation",
  org,
  selectedProject,
  projects,
  onProjectSelected,
  onNewProjectSelected,
  disabled,
  ...rest
}: ProjectSwitcherProps) {
  const [open, setOpen] = React.useState(false);

  return (
    <div className={cn("flex items-center gap-1", className)} {...rest}>
      {variant === "navigation" && org && selectedProject && (
        <Link
          href={`/${org.slug}/${selectedProject.slug}`}
          className="text-sm underline-offset-2 hover:underline"
        >
          {selectedProject.name}
        </Link>
      )}
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild disabled={disabled}>
          <Button
            variant={variant === "navigation" ? "ghost" : "outline"}
            size={variant === "navigation" ? "sm" : "default"}
            role="combobox"
            aria-expanded={open}
            aria-label="Select a project"
            className={cn(
              "justify-between",
              variant === "navigation" && "px-0",
            )}
          >
            {variant === "select" &&
              (selectedProject?.name ?? "Select a project...")}
            <ChevronsUpDown className="m-1 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[200px] p-0">
          <Command>
            <CommandList>
              <CommandEmpty>No project found.</CommandEmpty>
              <CommandGroup heading="Projects">
                {!projects?.length && (
                  <p className="text-center text-sm">No projects found</p>
                )}
                {projects?.map((project) => (
                  <CommandItem
                    key={project.id}
                    onSelect={() => {
                      onProjectSelected?.(project);
                      setOpen(false);
                    }}
                    className="text-sm"
                  >
                    {project.name}
                    <Check
                      className={cn(
                        "ml-auto h-4 w-4",
                        project.id === selectedProject?.id
                          ? "opacity-100"
                          : "opacity-0",
                      )}
                    />
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
            {onNewProjectSelected && (
              <>
                <CommandSeparator />
                <CommandList>
                  <CommandGroup>
                    <CommandItem onSelect={onNewProjectSelected}>
                      <PlusCircle className="mr-2 h-5 w-5" />
                      New Project
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
