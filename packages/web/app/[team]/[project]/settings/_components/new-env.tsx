"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { type schema } from "@tableland/studio-store";
import { Loader2, Plus } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { type z } from "zod";
import { skipToken } from "@tanstack/react-query";
import { envNameSchema } from "@tableland/studio-validators";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
import { api } from "@/trpc/react";
import InputWithCheck from "@/components/input-with-check";

export default function NewEnv({
  project,
  disabled,
}: {
  project: schema.Project;
  disabled?: boolean;
}) {
  const router = useRouter();
  const [showForm, setShowForm] = useState(false);
  const [query, setQuery] = useState("");
  const nameAvailable = api.environments.nameAvailable.useQuery(
    query ? { projectId: project.id, name: query } : skipToken,
    { retry: false },
  );
  const newEnv = api.environments.newEnvironment.useMutation({
    onSuccess: () => {
      router.refresh();
      setShowForm(false);
      form.reset();
    },
  });

  const form = useForm<z.infer<typeof envNameSchema>>({
    resolver: zodResolver(envNameSchema),
    defaultValues: {
      name: "",
    },
  });

  function onNewEnv() {
    setShowForm(true);
  }

  function onSubmit(values: z.infer<typeof envNameSchema>) {
    newEnv.mutate({ projectId: project.id, ...values });
  }

  function onCancel() {
    setShowForm(false);
    form.reset();
  }

  useEffect(() => {
    if (showForm) {
      form.setFocus("name", { shouldSelect: true });
    }
  }, [form, showForm]);

  return (
    <>
      {showForm ? (
        <Form {...form}>
          {
            // TODO: `form.handleSubmit` creates a floating promise, as a result the linter is complaining
            //    we should figure out if this is ok or not and either change this or the lint config
          }
          {/* eslint-disable-next-line @typescript-eslint/no-misused-promises */}
          <form onSubmit={form.handleSubmit(onSubmit)} className="flex">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <InputWithCheck
                      placeholder="Environment name"
                      disabled={newEnv.isPending}
                      updateQuery={setQuery}
                      queryStatus={nameAvailable}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage className="ml-4" />
                </FormItem>
              )}
            />

            <Button
              size="sm"
              variant="secondary"
              disabled={newEnv.isPending}
              onClick={onCancel}
              className="ml-auto"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              size="sm"
              disabled={newEnv.isPending}
              className="ml-3"
            >
              {newEnv.isPending && (
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
              )}
              Submit
            </Button>
          </form>
        </Form>
      ) : (
        <Button
          variant="outline"
          className="self-end"
          disabled={showForm || disabled}
          onClick={onNewEnv}
        >
          <Plus className="mr-2" />
          New environment
        </Button>
      )}
    </>
  );
}
