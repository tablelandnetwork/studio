import { type HTMLAttributes } from "react";
import { cn } from "@/lib/utils";

export function SidebarContainer({
  className,
  children,
  ...props
}: HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn(className)} {...props}>
      {children}
    </div>
  );
}

export function SidebarSection({
  className,
  children,
  ...props
}: HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn("flex flex-col gap-3 p-3", className)} {...props}>
      {children}
    </div>
  );
}
