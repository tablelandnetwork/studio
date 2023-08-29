import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

export interface SearchProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "type"> {}

export function Search({ className, ...props }: SearchProps) {
  return (
    <div>
      <Input
        type="search"
        placeholder="Search..."
        className={cn("h-9 md:w-[100px] lg:w-[300px]", className)}
        {...props}
      />
    </div>
  );
}
