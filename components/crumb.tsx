import { cn } from "@/lib/utils";
import { ChevronLeft } from "lucide-react";
import { Button } from "./ui/button";

export function Crumb({
  className,
  title,
  subtitle,
  onBack,
  ...props
}: React.HTMLAttributes<HTMLElement> & {
  title: string;
  subtitle?: string;
  onBack: () => void;
}) {
  return (
    <div className={cn("flex flex-col", className)} {...props}>
      <div className="flex items-center space-x-1">
        <Button variant="ghost" size="sm" className="px-0" onClick={onBack}>
          <ChevronLeft />
        </Button>
        <h1 className="text-2xl">{title}</h1>
      </div>
      {subtitle && <p>{subtitle}</p>}
    </div>
  );
}
