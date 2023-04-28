import { useAtom } from "jotai";

import { Suspense } from "react";
import SocialLogin from "./social-login";
import Provider from "./provider";
import SmartAccount from "./smart-account";
import { authAtom } from "@/store/auth";

export default function AuthDebug() {
  const [auth] = useAtom(authAtom);

  return (
    <div>
      <h1>AuthDebug</h1>
      <p>User id: {auth ? auth.user.id : "undefined"}</p>
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
