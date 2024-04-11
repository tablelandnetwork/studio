"use client";

import { Ellipsis } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "./ui/button";
import NewDefForm, { type NewTableFormProps } from "./new-def-form";
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
  props: Omit<NewTableFormProps, "open" | "onOpenChange" | "onSuccess"> &
    Omit<ImportTableFormProps, "open" | "onOpenChange" | "onSuccess">,
) {
  const [newTableFormOpen, setNewTableFormOpen] = useState(false);
  const [importTableFormOpen, setImportTableFormOpen] = useState(false);
  const router = useRouter();

  return (
    <>
      <NewDefForm
        {...props}
        open={newTableFormOpen}
        onOpenChange={setNewTableFormOpen}
        onSuccess={(team, project, table) => {
          router.refresh();
          router.push(`/${team.slug}/${project.slug}/${table.slug}`);
        }}
      />
      <ImportTableForm
        {...props}
        open={importTableFormOpen}
        onOpenChange={setImportTableFormOpen}
        onSuccess={(team, project, table, env) => {
          router.refresh();
          router.push(
            `/${team.slug}/${project.slug}/deployments/${env.slug}/${table.slug}`,
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
          <DropdownMenuItem onSelect={() => setNewTableFormOpen(true)}>
            Use table schema in Studio project
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </>
  );
}