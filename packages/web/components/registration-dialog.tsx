import { zodResolver } from "@hookform/resolvers/zod";
import { type Auth } from "@tableland/studio-api";
import { Loader2 } from "lucide-react";
import { useForm } from "react-hook-form";
import { useState } from "react";
import { skipToken } from "@tanstack/react-query";
import { registerSchema } from "@tableland/studio-validators";
import { type z } from "zod";
import InputWithCheck from "./input-with-check";
import { Button } from "./ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "./ui/dialog";
import { Input } from "./ui/input";
import { FormRootMessage } from "./form";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { api } from "@/trpc/react";

export default function RegistrationDialog({
  showDialog,
  onOpenChange,
  onSuccess,
}: {
  showDialog: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: (auth: Auth) => void;
}) {
  const [teamName, setTeamName] = useState("");

  const form = useForm<z.infer<typeof registerSchema>>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      username: "",
      email: "",
    },
  });

  const { setError } = form;

  const nameAvailableQuery = api.teams.nameAvailable.useQuery(
    teamName ? { name: teamName } : skipToken,
    { retry: false },
  );

  const register = api.auth.register.useMutation({
    onSuccess: (res) => {
      onSuccess(res);
      form.reset();
    },
    onError: (err) => {
      setError("root", { message: err.message });
    },
  });

  function onSubmit(values: z.infer<typeof registerSchema>) {
    register.mutate(values);
  }

  const handleOnOpenChange = (open: boolean) => {
    onOpenChange(open);
    form.reset();
  };

  return (
    <Dialog open={showDialog} onOpenChange={handleOnOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Studio Registration</DialogTitle>
          <DialogDescription>
            To use Studio, you&apos;ll need to choose a username. Email
            isn&apos;t required, but if you do share it with us, we&apos;ll only
            use it to send you important updates about Studio.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form
            // TODO: `form.handleSubmit` creates a floating promise, as a result the linter is complaining
            //    we should figure out if this is ok or not and either change this or the lint config
            // eslint-disable-next-line @typescript-eslint/no-misused-promises
            onSubmit={form.handleSubmit(onSubmit)}
            className="space-y-4"
          >
            <FormField
              control={form.control}
              name="username"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Username</FormLabel>
                  <FormControl>
                    <InputWithCheck
                      placeholder="myusername"
                      updateQuery={setTeamName}
                      queryStatus={nameAvailableQuery}
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>Username must be unique.</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email address</FormLabel>
                  <FormControl>
                    <Input placeholder="me@me.com" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormRootMessage />
            <DialogFooter>
              <DialogClose asChild>
                <Button
                  type="button"
                  variant="outline"
                  disabled={register.isPending}
                >
                  Cancel
                </Button>
              </DialogClose>
              <Button
                type="submit"
                disabled={register.isPending || !nameAvailableQuery.data}
              >
                {register.isPending && (
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                )}
                Continue
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
