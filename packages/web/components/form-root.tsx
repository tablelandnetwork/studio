import { cn } from "@/lib/utils";
import * as React from "react";
import { useFormContext } from "react-hook-form";

const FormRootMessage = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, children, ...props }, ref) => {
  const { formState } = useFormContext();
  const body = formState.errors.root
    ? String(formState.errors.root.message)
    : children;

  if (!body) {
    return null;
  }

  return (
    <p
      ref={ref}
      className={cn("text-[0.8rem] font-medium text-destructive", className)}
      {...props}
    >
      {body}
    </p>
  );
});
FormRootMessage.displayName = "FormRootMessage";

export { FormRootMessage };
