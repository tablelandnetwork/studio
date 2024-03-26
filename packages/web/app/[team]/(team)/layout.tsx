import NavTeam from "@/components/nav-team";

export default async function LayoutTeam({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-1 flex-col">
      <header className="sticky top-0 flex flex-col space-y-4 border-b bg-background px-4 py-3">
        <div className="flex">
          <NavTeam />
        </div>
      </header>
      {children}
    </div>
  );
}
