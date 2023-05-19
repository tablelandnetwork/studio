import { Suspense } from "react";

import { Auth } from "@/lib/withSession";
import Provider from "./provider";
import SmartAccount from "./smart-account";
import SocialLogin from "./social-login";

export default function AuthDebug({ auth }: { auth: Auth | null }) {
  return (
    <div>
      <h1>AuthDebug</h1>
      <p>User id: {auth ? auth.user.teamId : "null"}</p>
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
