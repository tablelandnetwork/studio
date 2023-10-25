"use client";

import { Button } from "@/components/ui/button";
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
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import * as z from "zod";
import InputWithCheck from "./input-with-check";
import TagInput from "./tag-input";

const schema = z.object({
  name: z.string().trim().nonempty(),
  emailInvites: z.array(z.string().trim().email()),
});

export default function NewTeamForm() {
  const [teamName, setTeamName] = useState("");
  const [pendingEmail, setPendingEmail] = useState("");
  const router = useRouter();

  const teamNameAvailable = api.teams.nameAvailable.useQuery(
    { name: teamName },
    { enabled: !!teamName },
  );

  const newTeam = api.teams.newTeam.useMutation({
    onSuccess: (res) => {
      router.push(`/${res.slug}`);
      router.refresh();
    },
  });

  const form = useForm<z.infer<typeof schema>>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: "",
      emailInvites: [],
    },
  });

  function onSubmit(values: z.infer<typeof schema>) {
    if (!!pendingEmail) {
      values.emailInvites = [...values.emailInvites, pendingEmail];
    }
    newTeam.mutate(values);
  }

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="mx-auto max-w-lg space-y-8"
      >
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Name</FormLabel>
              <FormControl>
                <InputWithCheck
                  placeholder="Team name"
                  onCheck={setTeamName}
                  checkPending={teamNameAvailable.isLoading}
                  checkPassed={teamNameAvailable.data}
                  {...field}
                />
              </FormControl>
              <FormDescription>Team name must be unique.</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="emailInvites"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Invite emails</FormLabel>
              <FormControl>
                <TagInput
                  id="emails"
                  placeholder="Email addresses"
                  tags={form.getValues().emailInvites}
                  setTags={(tags) => {
                    form.setValue("emailInvites", tags);
                    // form.trigger("emailInvites");
                  }}
                  pendingValue={pendingEmail}
                  setPendingValue={setPendingEmail}
                  {...field}
                />
              </FormControl>
              <FormDescription>
                Optionally enter a comma-separated list of email addresses to
                invite others to your new Team.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button
          type="submit"
          disabled={newTeam.isLoading || !teamNameAvailable.data}
        >
          {newTeam.isLoading && (
            <Loader2 className="mr-2 h-5 w-5 animate-spin" />
          )}
          Submit
        </Button>
      </form>
    </Form>
  );
}
