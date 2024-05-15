"use client";

import { Plus } from "lucide-react";
import { forwardRef } from "react";
import NewDefForm, { type NewDefFormProps } from "@/components/new-def-form";
import { Button } from "@/components/ui/button";

type NewDefProps = Required<
  Pick<NewDefFormProps, "teamPreset" | "projectPreset" | "onSuccess">
>;

export const NewDef = forwardRef<HTMLButtonElement, NewDefProps>(
  (props, ref) => (
    <NewDefForm
      trigger={
        <Button ref={ref} variant="ghost" size="icon">
          <Plus />
        </Button>
      }
      {...props}
    />
  ),
);
NewDef.displayName = "NewDef";

export default NewDef;
