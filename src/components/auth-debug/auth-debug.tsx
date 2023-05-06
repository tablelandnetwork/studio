import { useAtom } from "jotai";
import { Suspense } from "react";

import { authAtom } from "@/store/auth";

import Provider from "./provider";
import SmartAccount from "./smart-account";
import SocialLogin from "./social-login";

export default function AuthDebug() {
  const [auth] = useAtom(authAtom);

  return (
    <div>
      <h1>AuthDebug</h1>
      <p>User id: {auth ? auth.user.teamId : "undefined"}</p>
      <Suspense fallback={<p>Loading social login...</p>}>
        <SocialLogin />
      </Suspense>
      <Suspense fallback={<p>Loading provider...</p>}>
        <Provider />
      </Suspense>
      <Suspense fallback={<p>Loading smart account...</p>}>
        <SmartAccount />
      </Suspense>
    </div>
  );
}
