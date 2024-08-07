"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { type schema } from "@tableland/studio-store";
import { updateOrgSchema } from "@tableland/studio-validators";
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

export default function EditOrg({
  org,
  disabled = false,
}: {
  org: schema.Org;
  disabled?: boolean;
}) {
  const router = useRouter();
  const [query, setQuery] = useState(org.name);
  const form = useForm<z.infer<typeof updateOrgSchema>>({
    resolver: zodResolver(updateOrgSchema),
    defaultValues: {
      name: org.name,
    },
  });

  useEffect(() => {
    form.reset({ name: org.name });
  }, [org, form]);

  const nameAvailable = api.orgs.nameAvailable.useQuery(
    query !== org.name ? { orgId: org.id, name: query } : skipToken,
    { retry: false },
  );
  const updateOrg = api.orgs.updateOrg.useMutation({
    onSuccess: (org) => {
      router.refresh();
      router.replace(`/${org.slug}/settings`);
    },
  });

  const onSubmit = (values: z.infer<typeof updateOrgSchema>) => {
    updateOrg.mutate({ orgId: org.id, ...values });
  };

  const onReset = () => {
    setQuery(org.name);
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
                  placeholder="My Org"
                  {...field}
                  queryStatus={nameAvailable}
                  updateQuery={setQuery}
                  disabled={disabled || updateOrg.isPending}
                />
              </FormControl>
              <FormDescription>
                The org name. It must be unique across all Studio orgs.
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
            disabled={!form.formState.isDirty || updateOrg.isPending}
          >
            Reset
          </Button>
          <Button
            type="submit"
            disabled={
              disabled ||
              !form.formState.isDirty ||
              (!!form.formState.dirtyFields.name && !nameAvailable.data) ||
              updateOrg.isPending
            }
          >
            {updateOrg.isPending && (
              <Loader2 className="mr-2 h-5 w-5 animate-spin" />
            )}
            Submit
          </Button>
        </div>
      </form>
    </Form>
  );
}
