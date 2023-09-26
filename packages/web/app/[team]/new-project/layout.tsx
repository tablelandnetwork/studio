import NavNewProject from "@/components/nav-new-project";

export default async function NewProjectLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div>
      <header className="sticky top-0 flex flex-col space-y-4 border-b bg-white px-4 py-3">
        <NavNewProject />
      </header>
      {children}
    </div>
  );
}
