import { Sidebar } from "./_components/sidebar";

export default async function ProjectLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-1">
      <div className="sticky top-[3.5rem] h-[calc(100vh-3.55rem)] w-52 flex-shrink-0 overflow-y-auto overflow-x-hidden bg-card">
        <Sidebar />
      </div>
      <div className="mx-auto w-full min-w-0">{children}</div>
    </div>
  );
}
