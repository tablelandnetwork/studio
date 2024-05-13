import { type ComponentProps } from "react";
import TableMenu from "./table-menu";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

export default async function TableWrapper({
  displayName,
  description,
  children,
  ...props
}: ComponentProps<typeof TableMenu> & {
  displayName: string;
  description?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex-1 space-y-4">
      <div className="flex items-end justify-between">
        <div>
          <h1 className="text-3xl font-medium">{displayName}</h1>
          {description && (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <p className="line-clamp-1 max-w-md text-muted-foreground">
                    {description}
                  </p>
                </TooltipTrigger>
                <TooltipContent>
                  <p className="max-w-xs">{description}</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}
        </div>
        <TableMenu {...props} />
      </div>
      {children}
    </div>
  );
}
