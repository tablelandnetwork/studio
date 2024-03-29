import NavNewTable from "@/components/nav-new-table";
import SubNavHeader from "@/components/sub-nav-header";

export default async function NewTableLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div>
      <SubNavHeader>
        <NavNewTable crumbTitle="New Table" />
      </SubNavHeader>
      {children}
    </div>
  );
}
