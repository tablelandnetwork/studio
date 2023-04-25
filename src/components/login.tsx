import "@biconomy-sdk-dev/web3-auth/dist/src/style.css";
import { useAtom } from "jotai";
import { loadable } from "jotai/utils";

import { Button } from "./ui/button";
import { authAtom } from "@/store/auth";
import {
  loginAtom,
  logoutAtom,
  socialLoginAtom,
  smartAccountAtom,
} from "@/store/login";

// TODO: Remember we can get social/email info from:
// const info = await socialLoginSDK?.getUserInfo();

const socialLoginLoader = loadable(socialLoginAtom);
const loginLoader = loadable(loginAtom);
const smartAccountLoader = loadable(smartAccountAtom);

export default function Login() {
  const [auth] = useAtom(authAtom);
  const [socialLogin] = useAtom(socialLoginLoader);
  const [smartAccount] = useAtom(smartAccountLoader);
  const [loginLoad] = useAtom(loginLoader);
  const [, login] = useAtom(loginAtom);
  const [, logout] = useAtom(logoutAtom);

  let dispAddr = "";
  if (smartAccount.state === "hasData" && smartAccount.data) {
    dispAddr =
      smartAccount.data.smartAccountWalletAddress.slice(0, 6) +
      "..." +
      smartAccount.data.smartAccountWalletAddress.slice(-6);
  }

  const buttonDisabled =
    socialLogin.state === "loading" || loginLoad.state === "loading";

  return (
    <div className="flex items-center space gap-4">
      {smartAccount.state === "loading" && <p>Loading Smart Account...</p>}
      {!!dispAddr && <p>{dispAddr}</p>}
      <Button
        onClick={!auth ? login : logout}
        variant={auth ? "outline" : "default"}
        disabled={buttonDisabled}
      >
        {!auth ? "Sign In" : "Sign Out"}
      </Button>
    </div>
  );
}
