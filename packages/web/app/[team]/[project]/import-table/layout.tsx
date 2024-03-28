import NavNewTable from "@/components/nav-new-table";
import SubNavHeader from "@/components/sub-nav-header";

export default async function ImportTableLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div>
      <SubNavHeader>
        <NavNewTable crumbTitle="Import Table" />
      </SubNavHeader>
      {children}
    </div>
  );
}
