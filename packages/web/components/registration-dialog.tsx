import { api } from "@/trpc/react";
import { Auth } from "@tableland/studio-api";
import { Loader2 } from "lucide-react";
import { useState } from "react";
import InputWithCheck from "./input-with-check";
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
  const [teamName, setTeamName] = useState("");
  const [nameAvailable, setNameAvailable] = useState<boolean | undefined>();
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");

  const nameAvailableQuery = api.teams.nameAvailable.useQuery(
    { name: teamName },
    { enabled: !!teamName },
  );

  const register = api.auth.register.useMutation({
    onSuccess: (res) => {
      onSuccess(res);
      setUsername("");
      setEmail("");
    },
  });

  const handleRegister = () => {
    register.mutate({ username, email });
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
              <InputWithCheck
                id="name"
                placeholder="myusername"
                value={username}
                updateQuery={setTeamName}
                queryStatus={nameAvailableQuery}
                onResult={setNameAvailable}
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
          {register.isError && (
            <p>Error registering: {register.error.message}</p>
          )}
        </div>
        <DialogFooter>
          <Button
            variant="outline"
            onClick={handleCancel}
            disabled={register.isLoading}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            onClick={handleRegister}
            disabled={register.isLoading || !nameAvailable}
          >
            {register.isLoading && (
              <Loader2 className="mr-2 h-5 w-5 animate-spin" />
            )}
            Continue
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
