"use client";

import { Ellipsis } from "lucide-react";
import { useState } from "react";
import { Button } from "./ui/button";
import NewTableSheet from "./new-table-sheet";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export default function TablelandTableMenu() {
  const [newTableOpen, setNewTableOpen] = useState(false);

  return (
    <>
      <NewTableSheet open={newTableOpen} onOpenChange={setNewTableOpen} />
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon">
            <Ellipsis />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuItem onSelect={() => console.log("asdf")}>
            Import into Studio project
          </DropdownMenuItem>
          <DropdownMenuItem onSelect={() => setNewTableOpen(true)}>
            Use table schema
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </>
  );
}
