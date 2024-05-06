"use client";

import { Plus } from "lucide-react";
import NewDefForm, { type NewDefFormProps } from "@/components/new-def-form";
import { Button } from "@/components/ui/button";

export default function NewDef(
  props: Required<
    Pick<NewDefFormProps, "teamPreset" | "projectPreset" | "onSuccess">
  >,
) {
  return (
    <NewDefForm
      trigger={
        <Button variant="ghost" size="icon">
          <Plus />
        </Button>
      }
      {...props}
    />
  );
}
