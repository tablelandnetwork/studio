"use client";

import { Import } from "lucide-react";
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
