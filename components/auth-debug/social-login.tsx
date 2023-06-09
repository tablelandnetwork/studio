"use client";

import { useAtom } from "jotai";

import { socialLoginAtom } from "@/store/login";

export default function SocialLogin() {
  const [socialLogin] = useAtom(socialLoginAtom);
  return (
    <div>
      <p>Social login client id: {socialLogin.clientId}</p>
    </div>
  );
}
