import Link from "next/link";
import { type LucideIcon } from "lucide-react";
import { Button } from "./ui/button";

export default function SidebarLink({
  title,
  subtitle,
  icon: Icon,
  href,
  selected,
  showIndicator = false,
}: {
  title: string;
  subtitle?: string;
  icon: LucideIcon;
  href: string;
  selected: boolean;
  showIndicator?: boolean;
}) {
  return (
    <Link href={href} title={title}>
      <Button
        variant={selected ? "secondary" : "ghost"}
        className="flex h-auto w-full justify-start gap-x-2 px-3 py-2 font-normal"
      >
        <Icon className="size-5 shrink-0" />
        <div className="min-w-0 shrink text-left">
          <div className="truncate" title={title}>
            {title}
          </div>
          {subtitle && (
            <div
              className="truncate text-xs text-muted-foreground"
              title={subtitle}
            >
              {subtitle}
            </div>
          )}
        </div>
        {showIndicator && (
          <div className="ml-auto size-2 shrink-0 rounded-full bg-foreground" />
        )}
      </Button>
    </Link>
  );
}
