import NavProject from "./_components/nav-project";

export default async function ProjectLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-1 flex-col">
      <header className="sticky top-0 flex flex-col space-y-4 border-b bg-background px-4 py-3">
        <div className="flex">
          <NavProject />
        </div>
      </header>
      {children}
    </div>
  );
}
