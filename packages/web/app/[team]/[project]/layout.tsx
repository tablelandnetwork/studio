import { Sidebar } from "./_components/sidebar";

export default async function ProjectLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-1 items-stretch">
      <div className="min-w-40 border-r border-[#080A1E] bg-card">
        <Sidebar />
      </div>
      <div className="w-full">{children}</div>
    </div>
  );
}
