"use client";

import { type schema } from "@tableland/studio-store";
import { Check, ChevronsUpDown, PlusCircle } from "lucide-react";
import * as React from "react";
import Link from "next/link";
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

type OrgSwitcherProps = {
  variant?: "navigation" | "select";
  selectedOrg?: schema.Org;
  orgs?: schema.Org[];
  onOrgSelected?: (org: schema.Org) => void;
  onNewOrgSelected?: () => void;
  disabled?: boolean;
} & React.HTMLAttributes<HTMLDivElement>;

export default function OrgSwitcher({
  className,
  variant = "navigation",
  selectedOrg,
  orgs,
  onOrgSelected,
  onNewOrgSelected,
  disabled,
  ...rest
}: OrgSwitcherProps) {
  const [open, setOpen] = React.useState(false);

  const orgGroups: Array<{ label: string; orgs: schema.Org[] }> = [
    {
      label: "Personal Org",
      orgs: [],
    },
    {
      label: "Orgs",
      orgs: [],
    },
  ];
  orgs?.forEach((org) => {
    if (org.personal) {
      orgGroups[0].orgs.push(org);
    } else {
      orgGroups[1].orgs.push(org);
    }
  });

  return (
    <div className={cn("flex items-center gap-1", className)} {...rest}>
      {variant === "navigation" && selectedOrg && (
        <Link
          href={`/${selectedOrg.slug}`}
          className="text-sm underline-offset-2 hover:underline"
        >
          {selectedOrg.name}
        </Link>
      )}
      {orgs && (
        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild disabled={disabled}>
            <Button
              variant={variant === "navigation" ? "ghost" : "outline"}
              size={variant === "navigation" ? "sm" : "default"}
              role="combobox"
              aria-expanded={open}
              aria-label="Select a org"
              className={cn(
                "justify-between",
                variant === "navigation" && "px-0",
              )}
            >
              {variant === "select" && (selectedOrg?.name ?? "Select a org...")}
              <ChevronsUpDown className="m-1 h-4 w-4 shrink-0 opacity-50" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-[200px] p-0">
            <Command>
              <CommandList>
                {/* <CommandInput placeholder="Search org..." /> */}
                <CommandEmpty>No org found.</CommandEmpty>
                {orgGroups.map((group) => {
                  if (!group.orgs.length) {
                    return undefined;
                  }
                  return (
                    <CommandGroup key={group.label} heading={group.label}>
                      {group.orgs.map((groupOrg) => (
                        <CommandItem
                          key={groupOrg.id}
                          onSelect={() => {
                            onOrgSelected?.(groupOrg);
                            setOpen(false);
                          }}
                          className="text-sm"
                        >
                          {groupOrg.name}
                          <Check
                            className={cn(
                              "ml-auto h-4 w-4",
                              selectedOrg?.id === groupOrg.id
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
              {onNewOrgSelected && (
                <>
                  <CommandSeparator />
                  <CommandList>
                    <CommandGroup>
                      <CommandItem
                        onSelect={() => {
                          setOpen(false);
                          onNewOrgSelected();
                        }}
                      >
                        <PlusCircle className="mr-2 h-5 w-5" />
                        New Org
                      </CommandItem>
                    </CommandGroup>
                  </CommandList>
                </>
              )}
            </Command>
          </PopoverContent>
        </Popover>
      )}
    </div>
  );
}
