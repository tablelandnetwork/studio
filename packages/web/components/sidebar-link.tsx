import Link from "next/link";
import { type LucideIcon } from "lucide-react";
import { Button } from "./ui/button";

export default function SidebarLink({
  title,
  Icon,
  href,
  selected,
  showIndicator = false,
}: {
  title: string;
  Icon: LucideIcon;
  href: string;
  selected: boolean;
  showIndicator?: boolean;
}) {
  return (
    <Link href={href}>
      <Button
        variant={selected ? "secondary" : "ghost"}
        className="w-full justify-start gap-x-2 px-3"
      >
        <Icon className="size-5" />
        {title}
        {showIndicator && (
          <div className="ml-auto size-2 rounded-full bg-primary" />
        )}
      </Button>
    </Link>
  );
}
