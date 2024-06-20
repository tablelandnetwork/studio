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

type PopoverTriggerProps = React.ComponentPropsWithoutRef<
  typeof PopoverTrigger
>;

interface EnvSwitcherProps extends PopoverTriggerProps {
  variant?: "navigation" | "select";
  team?: schema.Team;
  project?: schema.Project;
  selectedEnv?: schema.Environment;
  envs?: schema.Environment[];
  onEnvSelected?: (env: schema.Environment) => void;
  onNewEnvSelected?: () => void;
}

export default function EnvSwitcher({
  className,
  variant = "navigation",
  team,
  project,
  selectedEnv,
  envs,
  onEnvSelected,
  onNewEnvSelected,
  disabled,
}: EnvSwitcherProps) {
  const [open, setOpen] = React.useState(false);

  return (
    <div className="flex items-center gap-1">
      {variant === "navigation" && team && project && selectedEnv && (
        <Link
          href={`/${team.slug}/${project.slug}/${selectedEnv.slug}`}
          className="text-sm underline-offset-2 hover:underline"
        >
          {selectedEnv.name}
        </Link>
      )}
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild disabled={disabled}>
          <Button
            variant={variant === "navigation" ? "ghost" : "outline"}
            size={variant === "navigation" ? "sm" : "default"}
            role="combobox"
            aria-expanded={open}
            aria-label="Select an environment"
            className={cn(
              "justify-between",
              variant === "navigation" && "px-0",
              className,
            )}
          >
            {variant === "select" &&
              (selectedEnv?.name ?? "Select an environment...")}
            <ChevronsUpDown className="m-1 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[200px] p-0">
          <Command>
            <CommandList>
              <CommandEmpty>No environments found.</CommandEmpty>
              <CommandGroup heading="Environments">
                {!envs?.length && (
                  <p className="text-center text-sm">No environments found</p>
                )}
                {envs?.map((env) => (
                  <CommandItem
                    key={env.id}
                    onSelect={() => {
                      onEnvSelected?.(env);
                      setOpen(false);
                    }}
                    className="text-sm"
                  >
                    {env.name}
                    <Check
                      className={cn(
                        "ml-auto h-4 w-4",
                        env.id === selectedEnv?.id
                          ? "opacity-100"
                          : "opacity-0",
                      )}
                    />
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
            {onNewEnvSelected && (
              <>
                <CommandSeparator />
                <CommandList>
                  <CommandGroup>
                    <CommandItem onSelect={onNewEnvSelected}>
                      <PlusCircle className="mr-2 h-5 w-5" />
                      New Environment
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
