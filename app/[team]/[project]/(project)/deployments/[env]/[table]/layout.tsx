import { Sidebar } from "./_components/sidebar";

export default async function DeploymentsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex">
      <Sidebar className="sticky top-14 h-fit" />
      {children}
    </div>
  );
}
