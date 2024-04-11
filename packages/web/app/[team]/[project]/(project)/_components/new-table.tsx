"use client";

import { Plus } from "lucide-react";
import { useRouter } from "next/navigation";
import NewDefForm, { type NewTableFormProps } from "@/components/new-def-form";
import { Button } from "@/components/ui/button";

export default function NewTable(
  props: Required<Pick<NewTableFormProps, "teamPreset" | "projectPreset">>,
) {
  const router = useRouter();

  return (
    <NewDefForm
      trigger={
        <Button variant="ghost" className="mr-2">
          <Plus className="mr-2" />
          New Table
        </Button>
      }
      onSuccess={() => {
        router.refresh();
      }}
      {...props}
    />
  );
}
