import Link from "next/link";
import { type LucideIcon } from "lucide-react";
import { Button } from "./ui/button";

export default function SidebarLink({
  title,
  icon: Icon,
  href,
  selected,
  showIndicator = false,
}: {
  title: string;
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
        <div className="shrink truncate">{title}</div>
        {showIndicator && (
          <div className="ml-auto size-2 shrink-0 rounded-full bg-foreground" />
        )}
      </Button>
    </Link>
  );
}
