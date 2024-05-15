"use client";

import { Import } from "lucide-react";
import { forwardRef } from "react";
import { Button } from "@/components/ui/button";
import ImportTableForm, {
  type ImportTableFormProps,
} from "@/components/import-table-form";

type ImportTableProps = Required<
  Pick<
    ImportTableFormProps,
    "teamPreset" | "projectPreset" | "envPreset" | "onSuccess"
  >
>;

const ImportTable = forwardRef<HTMLButtonElement, ImportTableProps>(
  (props, ref) => (
    <ImportTableForm
      trigger={
        <Button ref={ref} variant="ghost" size="icon">
          <Import />
        </Button>
      }
      {...props}
    />
  ),
);
ImportTable.displayName = "ImportTable";

export default ImportTable;
