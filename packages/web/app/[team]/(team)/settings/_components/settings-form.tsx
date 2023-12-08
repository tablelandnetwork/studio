"use client";

import EditableInput from "@/components/editable-input";
import { api } from "@/trpc/react";
import { schema } from "@tableland/studio-store";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { HTMLAttributes, useState } from "react";
import { useForm } from "react-hook-form";
import * as z from "zod";
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
import { cn } from "@/lib/utils";

const formSchema = z.object({
  name: z.string().trim().nonempty(),
});

export default function SettingsForm({
  team,
  className,
}: HTMLAttributes<HTMLFormElement> & { team: schema.Team }) {
  const [teamName, setTeamName] = useState("");
  const [nameAvailable, setNameAvailable] = useState<boolean | undefined>();
  const router = useRouter();

  const nameAvailableQuery = api.teams.nameAvailable.useQuery(
    { name: teamName },
    { enabled: !!teamName },
  );

  const updateTeam = api.teams.updateTeam.useMutation({
    onSuccess: (res) => {
      router.replace(`/${res.slug}/settings`);
      router.refresh();
    },
    onError: (err) => {
      setError("root", { message: err.message });
    },
  });

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: team.name,
    },
  });

  const { setError } = form;

  function onSubmit(values: z.infer<typeof formSchema>) {
    updateTeam.mutate({ teamId: team.id, name: values.name });
  }

  const onCancel = () => {};

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className={cn("mx-auto space-y-8", className)}
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
                  onResult={setNameAvailable}
                  {...field}
                />
              </FormControl>
              <FormDescription>Team name must be unique.</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormRootMessage />
        <div className="flex gap-2">
          <Button
            type="submit"
            disabled={updateTeam.isLoading || !nameAvailable}
          >
            {updateTeam.isLoading && (
              <Loader2 className="mr-2 h-5 w-5 animate-spin" />
            )}
            Save
          </Button>
          <Button
            type="button"
            variant="secondary"
            disabled={updateTeam.isLoading}
            onClick={onCancel}
          >
            Cancel
          </Button>
        </div>
      </form>
    </Form>
  );
}
