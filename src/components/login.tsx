import "@biconomy/web3-auth/dist/src/style.css";

import { useAtom } from "jotai";
import { loadable } from "jotai/utils";
import { Loader2 } from "lucide-react";
import { NextRouter, useRouter } from "next/router";
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

type Props = {
  successRouterCallback?: (router: NextRouter) => void;
};

const socialLoginLoader = loadable(socialLoginAtom);

export default function Login({ successRouterCallback }: Props) {
  const [socialLogin] = useAtom(socialLoginLoader);
  const [, login] = useAtom(loginAtom);
  const [, register] = useAtom(registerAtom);

  const [showRegisterDialog, setShowRegisterDialog] = React.useState(false);
  const [username, setUsername] = React.useState("");
  const [email, setEmail] = React.useState("");
  const [registering, setRegistering] = React.useState(false);
  const [error, setError] = React.useState("");

  const router = useRouter();

  const handleLogin = async () => {
    const res = await login(true);
    if (!res) {
      setShowRegisterDialog(true);
    } else {
      if (successRouterCallback) {
        successRouterCallback(router);
      } else {
        router.push(`/${res.personalTeam.slug}/projects`);
      }
    }
  };

  const handleRegister = async () => {
    if (!username.length) return;
    setRegistering(true);
    try {
      const res = await register({
        username,
        email: email.length ? email : undefined,
      });
      setRegistering(false);
      setShowRegisterDialog(false);
      if (successRouterCallback) {
        successRouterCallback(router);
      } else {
        router.push(`/${res.personalTeam.slug}/projects`);
      }
    } catch (err: any) {
      setError("There was an error registering your account.");
      setRegistering(false);
    }
  };

  const handleCancel = () => {
    setShowRegisterDialog(false);
    setRegistering(false);
    setUsername("");
    setEmail("");
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
              <Input
                id="name"
                placeholder="myusername"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="name">Email address</Label>
              <Input
                id="name"
                placeholder="me@me.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
          </div>
          {!!error && <p>{error}</p>}
        </div>
        <DialogFooter>
          <Button
            variant="outline"
            onClick={handleCancel}
            disabled={registering}
          >
            Cancel
          </Button>
          <Button type="submit" onClick={handleRegister} disabled={registering}>
            {registering && <Loader2 className="mr-2 h-5 w-5 animate-spin" />}
            Continue
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
