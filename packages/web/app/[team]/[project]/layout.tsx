import { Sidebar } from "./_components/sidebar";

export default async function ProjectLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-1">
      <div className="sticky top-[3.55rem] h-[calc(100vh-3.55rem)] w-52 flex-shrink-0 overflow-y-auto overflow-x-hidden border-r border-[#080A1E] bg-card">
        <Sidebar />
      </div>
      <div className="mx-auto w-full min-w-0">{children}</div>
    </div>
  );
}
