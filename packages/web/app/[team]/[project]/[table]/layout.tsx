import NavDef from "@/components/nav-def";
import SubNavHeader from "@/components/sub-nav-header";

export default async function DefLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div>
      <SubNavHeader>
        <NavDef />
      </SubNavHeader>
      {children}
    </div>
  );
}
