"use client";

import { Import } from "lucide-react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import ImportTableForm, {
  type ImportTableFormProps,
} from "@/components/import-table-form";

export default function ImportTable(
  props: Required<
    Pick<
      ImportTableFormProps,
      "teamPreset" | "projectPreset" | "envPreset" | "onSuccess"
    >
  >,
) {
  const router = useRouter();

  return (
    <ImportTableForm
      trigger={
        <Button variant="ghost" size="icon">
          <Import />
        </Button>
      }
      {...props}
    />
  );
}
