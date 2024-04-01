import Crumb from "@/components/crumb";
import SubNavHeader from "@/components/sub-nav-header";

export default async function NewProjectLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div>
      <SubNavHeader>
        <Crumb title="New Team" />
      </SubNavHeader>
      {children}
    </div>
  );
}
