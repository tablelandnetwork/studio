"use client";

import { inviteEmails } from "@/app/actions";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
import { Team } from "@/db/schema";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, Plus } from "lucide-react";
import { useEffect, useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Avatar, AvatarFallback } from "./ui/avatar";
import { Button } from "./ui/button";
import { Input } from "./ui/input";

const schema = z.object({
  email: z.string().email(),
});

export default function NewInvite({ team }: { team: Team }) {
  const [showForm, setShowForm] = useState(false);
  const [pending, startTransition] = useTransition();

  const form = useForm<z.infer<typeof schema>>({
    resolver: zodResolver(schema),
    defaultValues: {
      email: "",
    },
  });

  const email = form.watch("email");

  function onNewInvite() {
    setShowForm(true);
  }

  function onSubmit(values: z.infer<typeof schema>) {
    startTransition(async () => {
      await inviteEmails(team, [values.email]);
      setShowForm(false);
      form.reset();
    });
  }

  function onCancel() {
    setShowForm(false);
    form.reset();
  }

  useEffect(() => {
    if (showForm) {
      form.setFocus("email", { shouldSelect: true });
    }
  }, [form, showForm]);

  return (
    <>
      {showForm && (
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="flex">
            <Avatar>
              <AvatarFallback>{email.charAt(0)}</AvatarFallback>
            </Avatar>
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <Input
                      placeholder="Email address"
                      className="ml-4"
                      disabled={pending}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage className="ml-4" />
                </FormItem>
              )}
            />
            <Button type="submit" disabled={pending} className="ml-auto">
              {pending && <Loader2 className="mr-2 h-5 w-5 animate-spin" />}
              Submit
            </Button>
            <Button
              variant="ghost"
              disabled={pending}
              onClick={onCancel}
              className="ml-2"
            >
              Cancel
            </Button>
          </form>
        </Form>
      )}
      <Button
        variant="outline"
        className="self-start"
        disabled={showForm}
        onClick={onNewInvite}
      >
        <Plus className="mr-2" />
        New Invite
      </Button>
    </>
  );
}