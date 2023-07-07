"use client";

import { socialLoginSDKAtom } from "@/store/wallet";
import { useAtomValue } from "jotai";

export default function SocialLogin() {
  const socialLoginSDK = useAtomValue(socialLoginSDKAtom);
  return (
    <div>
      <p>Social login client id: {socialLoginSDK?.clientId}</p>
    </div>
  );
}
