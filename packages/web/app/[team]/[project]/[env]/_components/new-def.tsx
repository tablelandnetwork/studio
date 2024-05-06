"use client";

import { Plus } from "lucide-react";
import { useRouter } from "next/navigation";
import NewDefForm, { type NewDefFormProps } from "@/components/new-def-form";
import { Button } from "@/components/ui/button";

export default function NewDef(
  props: Required<
    Pick<NewDefFormProps, "teamPreset" | "projectPreset" | "onSuccess">
  >,
) {
  const router = useRouter();

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
