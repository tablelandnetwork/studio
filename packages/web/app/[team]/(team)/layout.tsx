import { Sidebar } from "./_components/sidebar";

export default async function LayoutTeam({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-1 items-stretch">
      <div className="sticky top-[3.55rem] h-[calc(100vh-3.55rem)] min-w-40 flex-shrink-0 overflow-y-auto overflow-x-hidden border-r border-[#080A1E] bg-card">
        <Sidebar />
      </div>
      <div className="flex w-full">{children}</div>
    </div>
  );
}
