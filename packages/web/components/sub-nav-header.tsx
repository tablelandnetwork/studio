export default function SubNavHeader({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <header className="sticky top-0 flex flex-col space-y-4 border-b border-[#080A1E] bg-[#202132] px-4 py-3">
      <div className="flex">{children}</div>
    </header>
  );
}
