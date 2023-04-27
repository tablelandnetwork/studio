import "@biconomy-sdk-dev/web3-auth/dist/src/style.css";
import * as React from "react";
import { useAtom } from "jotai";
import { loadable } from "jotai/utils";

import { Button } from "./ui/button";
import { registerAtom } from "@/store/auth";
import { loginAtom, socialLoginAtom } from "@/store/login";
import { useRouter } from "next/router";
import { UserNav } from "./user-nav";
import { Team } from "@/db/schema";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { userTeamsAtom } from "@/store/teams";

// TODO: Remember we can get social/email info from:
// const info = await socialLoginSDK?.getUserInfo();

const socialLoginLoader = loadable(socialLoginAtom);

export default function Login({ personalTeam }: { personalTeam?: Team }) {
  const [socialLogin] = useAtom(socialLoginLoader);
  const [, login] = useAtom(loginAtom);
  const [, register] = useAtom(registerAtom);
  const [teams] = useAtom(userTeamsAtom);

  const [showRegisterDialog, setShowRegisterDialog] = React.useState(false);
  const usernameInput = React.useRef<HTMLInputElement>(null);
  const emailInput = React.useRef<HTMLInputElement>(null);

  const router = useRouter();

  const handleLogin = async () => {
    // TODO: This can be null or undefined, so we need to fix that.
    const res = await login();
    if (!res) {
      setShowRegisterDialog(true);
    } else {
      router.push(`/dashboard/${res.personalTeam.slug}`);
    }
  };

  const handleRegister = async () => {
    if (!usernameInput.current) return;
    const res = await register({
      username: usernameInput.current?.value,
      email: emailInput.current?.value,
    });
    setShowRegisterDialog(false);
    router.push(`/dashboard/${res.personalTeam.slug}`);
  };

  const buttonDisabled = socialLogin.state === "loading";

  return (
    <Dialog open={showRegisterDialog} onOpenChange={setShowRegisterDialog}>
      <div className="flex items-center space gap-4">
        {!personalTeam && (
          <Button onClick={handleLogin} disabled={buttonDisabled}>
            Sign In
          </Button>
        )}
        {personalTeam && <UserNav team={personalTeam} />}
      </div>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create team</DialogTitle>
          <DialogDescription>
            Create a new team to manage collaborators, projects, and table
            deployments.
          </DialogDescription>
        </DialogHeader>
        <div>
          <div className="space-y-4 py-2 pb-4">
            <div className="space-y-2">
              <Label htmlFor="name">Team name</Label>
              <Input id="name" placeholder="Acme Inc." ref={usernameInput} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="name">Email address</Label>
              <Input id="name" placeholder="me@me.com" ref={emailInput} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="plan">Subscription plan</Label>
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="Select a plan" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="free">
                    <span className="font-medium">Free</span> -{" "}
                    <span className="text-muted-foreground">
                      Trial for two weeks
                    </span>
                  </SelectItem>
                  <SelectItem value="pro">
                    <span className="font-medium">Pro</span> -{" "}
                    <span className="text-muted-foreground">
                      $9/month per user
                    </span>
                  </SelectItem>
                </SelectContent>
              </Select>
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
