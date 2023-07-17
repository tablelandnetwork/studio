import HeaderSecondary from "@/components/header-secondary";

export default async function LayoutTeam({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div>
      <HeaderSecondary />
      {children}
    </div>
  );
}
