import HeaderSecondary from "@/components/header-secondary";
import Session from "@/lib/session";
import { cookies } from "next/headers";

export default async function LayoutTeam({
  children,
}: {
  children: React.ReactNode;
}) {
  const { auth } = await Session.fromCookies(cookies());
  return (
    <div>
      <HeaderSecondary />
      {children}
    </div>
  );
}
