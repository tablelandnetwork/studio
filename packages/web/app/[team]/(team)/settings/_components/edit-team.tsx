"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { type schema } from "@tableland/studio-store";
import { updateTeamSchema } from "@tableland/studio-validators";
import { useForm } from "react-hook-form";
import { type z } from "zod";
import { useEffect, useState } from "react";
import { skipToken } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
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
import InputWithCheck from "@/components/input-with-check";
import { api } from "@/trpc/react";

export default function EditTeam({
  team,
  disabled = false,
}: {
  team: schema.Team;
  disabled?: boolean;
}) {
  const router = useRouter();
  const [query, setQuery] = useState(team.name);
  const form = useForm<z.infer<typeof updateTeamSchema>>({
    resolver: zodResolver(updateTeamSchema),
    defaultValues: {
      name: team.name,
    },
  });

  useEffect(() => {
    form.reset({ name: team.name });
  }, [team, form]);

  const nameAvailable = api.teams.nameAvailable.useQuery(
    query !== team.name ? { teamId: team.id, name: query } : skipToken,
    { retry: false },
  );
  const updateTeam = api.teams.updateTeam.useMutation({
    onSuccess: (team) => {
      router.refresh();
      router.replace(`/${team.slug}/settings`);
    },
  });

  const onSubmit = (values: z.infer<typeof updateTeamSchema>) => {
    updateTeam.mutate({ teamId: team.id, ...values });
  };

  const onReset = () => {
    setQuery(team.name);
    form.reset();
  };

  return (
    <Form {...form}>
      {
        // TODO: `form.handleSubmit` creates a floating promise, as a result the linter is complaining
        //    we should figure out if this is ok or not and either change this or the lint config
      }
      {/* eslint-disable-next-line @typescript-eslint/no-misused-promises */}
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Name</FormLabel>
              <FormControl>
                <InputWithCheck
                  placeholder="My Team"
                  {...field}
                  queryStatus={nameAvailable}
                  updateQuery={setQuery}
                  disabled={disabled || updateTeam.isPending}
                />
              </FormControl>
              <FormDescription>
                The team name. It must be unique across all Studio teams.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="flex gap-4">
          <Button
            variant="outline"
            type="reset"
            onClick={onReset}
            disabled={!form.formState.isDirty || updateTeam.isPending}
          >
            Reset
          </Button>
          <Button
            type="submit"
            disabled={
              disabled ||
              !form.formState.isDirty ||
              (!!form.formState.dirtyFields.name && !nameAvailable.data) ||
              updateTeam.isPending
            }
          >
            {updateTeam.isPending && (
              <Loader2 className="mr-2 h-5 w-5 animate-spin" />
            )}
            Submit
          </Button>
        </div>
      </form>
    </Form>
  );
}
