import NavTable from "@/components/nav-table";

export default async function ImportTableLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div>
      <header className="sticky top-0 flex flex-col space-y-4 border-b bg-background px-4 py-3">
        <NavTable />
      </header>
      {children}
    </div>
  );
}
