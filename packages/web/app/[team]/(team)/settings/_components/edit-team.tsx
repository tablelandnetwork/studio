"use client";

import { api } from "@/trpc/react";
import { zodResolver } from "@hookform/resolvers/zod";
import { schema } from "@tableland/studio-store";
import { updateTeamSchema } from "@tableland/studio-validators";
import { set, useForm } from "react-hook-form";
import { z } from "zod";
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
import { Input } from "@/components/ui/input";
import { DOMAttributes, useState } from "react";
import InputWithCheck from "@/components/input-with-check";
import { skipToken } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";

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

  const nameAvailable = api.teams.nameAvailable.useQuery(
    query !== team.name ? { name: query } : skipToken,
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
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Name</FormLabel>
              <FormControl>
                <InputWithCheck
                  placeholder="myteam"
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
            disabled={disabled || !nameAvailable.data || updateTeam.isPending}
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
