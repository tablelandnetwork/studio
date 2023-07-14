"use client";

import { socialLoginSDKAtom } from "@/store/social-login";
import { useAtomValue } from "jotai";
import { Button } from "../ui/button";

export default function SocialLogin() {
  const socialLoginSDK = useAtomValue(socialLoginSDKAtom);
  return (
    <div>
      <p>Social login client id: {socialLoginSDK.clientId}</p>
      <Button onClick={async () => await socialLoginSDK.logout()}>
        Force logout
      </Button>
    </div>
  );
}
