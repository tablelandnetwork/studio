"use client";

import { Plus } from "lucide-react";
import { useRouter } from "next/navigation";
import NewDefForm, { type NewDefFormProps } from "@/components/new-def-form";
import { Button } from "@/components/ui/button";

export default function NewDef(
  props: Required<Pick<NewDefFormProps, "teamPreset" | "projectPreset">>,
) {
  const router = useRouter();

  return (
    <NewDefForm
      trigger={
        <Button variant="ghost" className="mr-2">
          <Plus className="mr-2" />
          New definition
        </Button>
      }
      onSuccess={() => {
        router.refresh();
      }}
      {...props}
    />
  );
}
