import NavNewProject from "@/components/nav-new-project";
import SubNavHeader from "@/components/sub-nav-header";

export default async function NewProjectLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div>
      <SubNavHeader>
        <NavNewProject />
      </SubNavHeader>
      {children}
    </div>
  );
}
