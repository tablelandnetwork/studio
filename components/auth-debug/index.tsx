import Session from "@/lib/session";
import dynamic from "next/dynamic";
import { cookies } from "next/headers";
import { Suspense } from "react";
import Provider from "./provider";
import UserId from "./user-id";

const SocialLogin = dynamic(
  () =>
    import("@/components/auth-debug/social-login").then((res) => res.default),
  { ssr: false }
);

export default async function AuthDebug() {
  const { auth } = await Session.fromCookies(cookies());
  return (
    <div>
      <h1>AuthDebug</h1>
      <p>User id (server): {auth ? auth.user.teamId : "null"}</p>
      <Suspense fallback={<p>Loading user id (client)...</p>}>
        <UserId />
      </Suspense>
      <Suspense fallback={<p>Loading social login...</p>}>
        <SocialLogin />
      </Suspense>
      <Suspense fallback={<p>Loading provider...</p>}>
        <Provider />
      </Suspense>
    </div>
  );
}
