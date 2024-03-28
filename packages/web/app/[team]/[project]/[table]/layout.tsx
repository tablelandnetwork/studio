import NavTable from "@/components/nav-table";
import SubNavHeader from "@/components/sub-nav-header";

export default async function ImportTableLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div>
      <SubNavHeader>
        <NavTable />
      </SubNavHeader>
      {children}
    </div>
  );
}
