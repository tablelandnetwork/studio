import "@biconomy/web3-auth/dist/src/style.css";

import { useAtom } from "jotai";
import { loadable } from "jotai/utils";
import { useRouter } from "next/router";
import * as React from "react";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { loginAtom, socialLoginAtom } from "@/store/login";
import { registerAtom } from "@/store/register";

import { Button } from "./ui/button";

// TODO: Remember we can get social/email info from:
// const info = await socialLoginSDK?.getUserInfo();

const socialLoginLoader = loadable(socialLoginAtom);

export default function Login() {
  const [socialLogin] = useAtom(socialLoginLoader);
  const [, login] = useAtom(loginAtom);
  const [, register] = useAtom(registerAtom);

  const [showRegisterDialog, setShowRegisterDialog] = React.useState(false);
  const usernameInput = React.useRef<HTMLInputElement>(null);
  const emailInput = React.useRef<HTMLInputElement>(null);

  const router = useRouter();

  const handleLogin = async () => {
    const res = await login(true);
    if (!res) {
      setShowRegisterDialog(true);
    } else {
      router.push(`/${res.personalTeam.slug}/projects`);
    }
  };

  const handleRegister = async () => {
    if (!usernameInput.current) return;
    const res = await register({
      username: usernameInput.current?.value,
      email: emailInput.current?.value,
    });
    setShowRegisterDialog(false);
    router.push(`/${res.personalTeam.slug}/projects`);
  };

  const buttonDisabled = socialLogin.state === "loading";

  return (
    <Dialog open={showRegisterDialog} onOpenChange={setShowRegisterDialog}>
      <div className="flex items-center gap-4">
        <Button onClick={handleLogin} disabled={buttonDisabled}>
          Sign In
        </Button>
      </div>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Studio Registration</DialogTitle>
          <DialogDescription>
            To use Studio, you&apos;ll need to choose a username. Email
            isn&apos;t required, but if you do share it with us, we&apos;ll only
            use it to send you important updates about Studio.
          </DialogDescription>
        </DialogHeader>
        <div>
          <div className="space-y-4 py-2 pb-4">
            <div className="space-y-2">
              <Label htmlFor="name">Username</Label>
              <Input id="name" placeholder="myusername" ref={usernameInput} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="name">Email address</Label>
              <Input id="name" placeholder="me@me.com" ref={emailInput} />
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => setShowRegisterDialog(false)}
          >
            Cancel
          </Button>
          <Button type="submit" onClick={handleRegister}>
            Continue
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
