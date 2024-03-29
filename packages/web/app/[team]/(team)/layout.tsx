import NavTeam from "@/components/nav-team";
import SubNavHeader from "@/components/sub-nav-header";

export default async function LayoutTeam({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-1 flex-col">
      <SubNavHeader>
        <NavTeam />
      </SubNavHeader>
      {children}
    </div>
  );
}
