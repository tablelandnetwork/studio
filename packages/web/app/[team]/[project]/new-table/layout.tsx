import NavNewTable from "@/components/nav-new-table";

export default async function NewTableLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div>
      <header className="sticky top-0 flex flex-col space-y-4 border-b bg-white px-4 py-3">
        <NavNewTable crumbTitle="New Table" />
      </header>
      {children}
    </div>
  );
}
