import NavProject from "./_components/nav-project";
import SubNavHeader from "@/components/sub-nav-header";

export default async function ProjectLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-1 flex-col">
      <SubNavHeader>
        <NavProject />
      </SubNavHeader>
      {children}
    </div>
  );
}
