import { register } from "@/app/actions";
import { Auth } from "@tableland/studio-api";
import { Loader2 } from "lucide-react";
import { useState, useTransition } from "react";
import { Button } from "./ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "./ui/dialog";
import { Input } from "./ui/input";
import { Label } from "./ui/label";

export default function RegistrationDialog({
  showDialog,
  onOpenChange,
  onSuccess,
  onCancel,
}: {
  showDialog: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: (auth: Auth) => void;
  onCancel: () => void;
}) {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [registerError, setRegisterError] = useState("");
  const [pending, startTransition] = useTransition();

  const handleRegister = async () => {
    startTransition(async () => {
      try {
        const res = await register(username, email);
        if (res.error) {
          throw new Error(res.error);
        } else if (res.auth) {
          onSuccess(res.auth);
          setUsername("");
          setEmail("");
        } else {
          throw new Error("No result from register");
        }
      } catch (error) {
        setRegisterError(
          error instanceof Error ? error.message : String(error),
        );
      }
    });
  };

  const handleCancel = () => {
    onCancel();
    setUsername("");
    setEmail("");
  };

  return (
    <Dialog open={showDialog} onOpenChange={onOpenChange}>
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
          <Button variant="outline" onClick={handleCancel} disabled={pending}>
            Cancel
          </Button>
          <Button type="submit" onClick={handleRegister} disabled={pending}>
            {pending && <Loader2 className="mr-2 h-5 w-5 animate-spin" />}
            Continue
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
