import { Team } from "@/db/schema";
import { Auth } from "@/lib/withSession";
import { NextRouter } from "next/router";
import Header from "./header";
import LayoutBase from "./layout-base";

export default function LayoutMain({
  children,
  auth,
  personalTeam,
  loginSuccessRouterCallback,
}: {
  children: React.ReactNode;
  auth: Auth | null;
  personalTeam?: Team;
  loginSuccessRouterCallback?: (router: NextRouter) => void;
}) {
  return (
    <LayoutBase auth={auth}>
      <Header
        personalTeam={personalTeam}
        loginSuccessRouterCallback={loginSuccessRouterCallback}
      />
      {children}
    </LayoutBase>
  );
}
