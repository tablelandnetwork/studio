import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface SidebarProps extends React.HTMLAttributes<HTMLDivElement> {}

export function Sidebar({ className }: SidebarProps) {
  return (
    <div className={cn("pb-12", className)}>
      <div className="space-y-4 py-4">
        <div className="px-3 py-2">
          <h2 className="mb-2 px-4 text-lg font-semibold tracking-tight">
            Tables
          </h2>
          <div className="flex flex-col space-y-1">
            <Button variant="secondary" className="w-full justify-start">
              users
            </Button>
            <Button variant="ghost" className="w-full justify-start">
              teams
            </Button>
            <Button variant="ghost" className="w-full justify-start">
              projects
            </Button>
          </div>
        </div>
        {/* <div className="px-3 py-2">
          <h2 className="mb-2 px-4 text-lg font-semibold tracking-tight">
            Production
          </h2>
          <div className="flex flex-col space-y-1">
            <Button variant="ghost" className="w-full justify-start">
              users
            </Button>
            <Button variant="ghost" className="w-full justify-start">
              teams
            </Button>
            <Button variant="ghost" className="w-full justify-start">
              projects
            </Button>
            <Button variant="ghost" className="w-full justify-start">
              receipts
            </Button>
          </div>
        </div> */}
      </div>
    </div>
  );
}
