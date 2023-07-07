import HeaderTeam from "@/components/header-team";
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
      <HeaderTeam />
      {children}
    </div>
  );
}
