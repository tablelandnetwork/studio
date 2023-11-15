import Link from "next/link";
import { cn } from "@/lib/utils";

export default function Crumb({
  className,
  title,
  items = [],
}: React.HTMLAttributes<HTMLElement> & {
  title: string;
  items?: Array<{
    label: string;
    href: string;
  }>;
}) {
  return (
    <div className={cn("flex", className)}>
      {items.map((item, index) => (
        <div key={item.label}>
          <Link
            href={item.href}
            className="text-lg text-muted-foreground hover:text-primary"
          >
            {item.label}
          </Link>
          <span className="mx-2 text-lg text-muted-foreground">/</span>
        </div>
      ))}
      <p className="text-lg">{title}</p>
    </div>
  );
}
