import TableMenu, { type TableMenuProps } from "./table-menu";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

export default async function TableWrapper({
  displayName,
  description,
  isAuthenticated,
  children,
  ...props
}: TableMenuProps & {
  displayName: string;
  description?: string;
  isAuthenticated: boolean;
  children: React.ReactNode;
}) {
  return (
    <div className="flex-1 space-y-4">
      <div className="space-y-2">
        <div className="flex items-center gap-4">
          <h1 className="text-3xl font-medium">{displayName}</h1>
          {isAuthenticated && <TableMenu {...props} />}
        </div>
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
      {children}
    </div>
  );
}
