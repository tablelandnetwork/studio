"use client";

import "@biconomy/web3-auth/dist/src/style.css";

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
import { connectWeb3Atom, registerAtom } from "@/store/social-login";
import { accountAtom, authAtom } from "@/store/wallet";
import { useAtomValue, useSetAtom } from "jotai";
import { Loader2 } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState, useTransition } from "react";
import MenuUser from "./menu-user";
import { Button } from "./ui/button";

export default function UserActions() {
  const account = useAtomValue(accountAtom);
  const auth = useAtomValue(authAtom);
  const connectWeb3 = useSetAtom(connectWeb3Atom);
  const register = useSetAtom(registerAtom);

  const [showRegisterDialog, setShowRegisterDialog] = useState(false);
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [registerError, setRegisterError] = useState("");
  const [pathnameSnapshot, setPathnameSnapshot] = useState("");

  const router = useRouter();
  const pathname = usePathname();

  const [isPending, startTransition] = useTransition();

  const handleSignIn = () => {
    startTransition(async () => {
      const res = await connectWeb3(true);
      if (res.error) {
        // TODO: Display error.
      } else if (res.auth) {
        if (pathnameSnapshot === "/invite") {
          router.refresh();
        } else {
          router.push(`/${res.auth.personalTeam.slug}`);
          router.refresh();
        }
      } else {
        setShowRegisterDialog(true);
      }
    });
  };

  const handleRegister = () => {
    if (!username.length) return;
    startTransition(async () => {
      const res = await register(username, email);
      if (res.auth) {
        if (pathnameSnapshot === "/invite") {
          router.refresh();
        } else {
          router.push(`/${res.auth.personalTeam.slug}`);
        }
        setShowRegisterDialog(false);
        setUsername("");
        setEmail("");
      } else if (res.error) {
        setRegisterError(res.error);
      }
    });
  };

  const handleCancel = () => {
    setShowRegisterDialog(false);
    setUsername("");
    setEmail("");
  };

  useEffect(() => {
    setPathnameSnapshot(pathname);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <Dialog open={showRegisterDialog} onOpenChange={setShowRegisterDialog}>
      {!account && !auth?.personalTeam && (
        <Button onClick={handleSignIn}>Sign In</Button>
      )}
      {auth?.personalTeam && <MenuUser personalTeam={auth.personalTeam} />}
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
          {!!registerError && <p>Error registering: {registerError}</p>}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={handleCancel} disabled={isPending}>
            Cancel
          </Button>
          <Button type="submit" onClick={handleRegister} disabled={isPending}>
            {isPending && <Loader2 className="mr-2 h-5 w-5 animate-spin" />}
            Continue
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
