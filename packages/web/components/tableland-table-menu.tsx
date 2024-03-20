"use client";

import { Ellipsis } from "lucide-react";
import { useState } from "react";
import { Button } from "./ui/button";
import NewTableForm, { type NewTableFormProps } from "./new-table-form";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export default function TablelandTableMenu(
  props: Omit<NewTableFormProps, "open" | "onOpenChange">,
) {
  const [newTableFormOpen, setNewTableFormOpen] = useState(false);
  return (
    <>
      <NewTableForm
        {...props}
        open={newTableFormOpen}
        onOpenChange={setNewTableFormOpen}
      />
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon">
            <Ellipsis />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuItem onSelect={() => {}}>
            Import into Studio project
          </DropdownMenuItem>
          <DropdownMenuItem onSelect={() => setNewTableFormOpen(true)}>
            Use table schema
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </>
  );
}
