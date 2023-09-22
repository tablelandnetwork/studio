import { CrumbProject } from "@/components/crumb-project";
import NavProject from "@/components/nav-project";

export default async function ProjectLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-1 flex-col">
      <CrumbProject className="px-4 pb-1 pt-3" />
      <header className="sticky top-0 flex flex-col space-y-4 border-b bg-white px-4 py-3">
        <div className="flex">
          <NavProject />
        </div>
      </header>
      {children}
    </div>
  );
}
