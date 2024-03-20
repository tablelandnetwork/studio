"use client";

import { Plus } from "lucide-react";
import NewTableForm, { type NewTableFormProps } from "@/components/new-table-form";
import { Button } from "@/components/ui/button";

export default function NewTable(
  props: Required<Pick<NewTableFormProps, "teamPreset" | "projectPreset">>,
) {
  return (
    <NewTableForm
      trigger={
        <Button variant="ghost" className="mr-2">
          <Plus className="mr-2" />
          New Table
        </Button>
      }
      {...props}
    />
  );
}
