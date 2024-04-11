"use client";

import { Ellipsis } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "./ui/button";
import NewDefForm, { type NewDefFormProps } from "./new-def-form";
import ImportTableForm, {
  type ImportTableFormProps,
} from "./import-table-form";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export default function TableMenu(
  props: Omit<NewDefFormProps, "open" | "onOpenChange" | "onSuccess"> &
    Omit<ImportTableFormProps, "open" | "onOpenChange" | "onSuccess">,
) {
  const [newDefFormOpen, setNewDefFormOpen] = useState(false);
  const [importTableFormOpen, setImportTableFormOpen] = useState(false);
  const router = useRouter();

  return (
    <>
      <NewDefForm
        {...props}
        open={newDefFormOpen}
        onOpenChange={setNewDefFormOpen}
        onSuccess={(team, project, def) => {
          router.refresh();
          router.push(`/${team.slug}/${project.slug}/${def.slug}`);
        }}
      />
      <ImportTableForm
        {...props}
        open={importTableFormOpen}
        onOpenChange={setImportTableFormOpen}
        onSuccess={(team, project, def, env) => {
          router.refresh();
          router.push(
            `/${team.slug}/${project.slug}/tables/${env.slug}/${def.slug}`,
          );
        }}
      />
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon">
            <Ellipsis />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuItem onSelect={() => setImportTableFormOpen(true)}>
            Import table into Studio project
          </DropdownMenuItem>
          <DropdownMenuItem onSelect={() => setNewDefFormOpen(true)}>
            Use table schema in Studio project
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </>
  );
}
