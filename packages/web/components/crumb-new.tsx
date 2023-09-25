export default function Crumb({
  className,
  title,
  items = [],
}: React.HTMLAttributes<HTMLElement> & {
  title: string;
  items?: {
    label: string;
    href: string;
  }[];
}) {
  return (
    <div>
      {items.map((item, index) => (
        <p key={item.label}>{item.label}</p>
      ))}
      <p>{title}</p>
    </div>
  );
}
