import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { type z } from "zod";
import { skipToken } from "@tanstack/react-query";
import { type schema } from "@tableland/studio-store";
import { newTeamSchema } from "@tableland/studio-validators";
import { FormRootMessage } from "@/components/form-root";
import InputWithCheck from "@/components/input-with-check";
import TagInput from "@/components/tag-input";
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

export interface TeamFormProps {
  team?: schema.Team;
  onSubmit: (values: z.infer<typeof newTeamSchema>) => void;
  isPending: boolean;
  error?: string;
}

export default function TeamForm({
  team,
  onSubmit,
  isPending,
  error,
}: TeamFormProps) {
  const [teamName, setTeamName] = useState("");
  const [pendingEmail, setPendingEmail] = useState("");

  const form = useForm<z.infer<typeof newTeamSchema>>({
    resolver: zodResolver(newTeamSchema),
    defaultValues: {
      name: team?.name ?? "",
      emailInvites: [],
    },
  });

  const nameAvailableQuery = api.teams.nameAvailable.useQuery(
    teamName ? { name: teamName } : skipToken,
    { retry: false },
  );

  const { setError } = form;

  useEffect(() => {
    if (error) {
      setError("root", { message: error });
    }
  }, [error]);

  function handleOnSubmit(values: z.infer<typeof newTeamSchema>) {
    if (pendingEmail) {
      values.emailInvites = [...values.emailInvites, pendingEmail];
    }
    onSubmit(values);
  }

  return (
    <Form {...form}>
      <form
        // TODO: `form.handleSubmit` creates a floating promise, as a result the linter is complaining
        //    we should figure out if this is ok or not and either change this or the lint config
        // eslint-disable-next-line @typescript-eslint/no-misused-promises
        onSubmit={form.handleSubmit(handleOnSubmit)}
        className="max-w-lg space-y-8"
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
                  updateQuery={setTeamName}
                  queryStatus={nameAvailableQuery}
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
        <FormRootMessage />
        <Button type="submit" disabled={isPending || !nameAvailableQuery.data}>
          {isPending && <Loader2 className="mr-2 h-5 w-5 animate-spin" />}
          Submit
        </Button>
      </form>
    </Form>
  );
}
