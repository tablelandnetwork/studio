"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { type schema } from "@tableland/studio-store";
import { updateProjectSchema } from "@tableland/studio-validators";
import { useForm } from "react-hook-form";
import { type z } from "zod";
import { useState } from "react";
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
import { Textarea } from "@/components/ui/textarea";

export default function EditProject({
  project,
  disabled = false,
}: {
  project: schema.Project;
  disabled?: boolean;
}) {
  const router = useRouter();
  const [query, setQuery] = useState(project.name);
  const form = useForm<z.infer<typeof updateProjectSchema>>({
    resolver: zodResolver(updateProjectSchema),
    defaultValues: {
      name: project.name,
      description: project.description,
    },
  });

  const nameAvailable = api.projects.nameAvailable.useQuery(
    query !== project.name ? { name: query } : skipToken,
    { retry: false },
  );
  const updateProject = api.projects.updateProject.useMutation({
    onSuccess: (team) => {
      router.refresh();
      router.replace(`/${team.slug}/${project.slug}/settings`);
    },
  });

  const onSubmit = (values: z.infer<typeof updateProjectSchema>) => {
    updateProject.mutate({ projectId: project.id, ...values });
  };

  const onReset = () => {
    setQuery(project.name);
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
                  placeholder="My Project"
                  {...field}
                  queryStatus={nameAvailable}
                  updateQuery={setQuery}
                  disabled={disabled || updateProject.isPending}
                />
              </FormControl>
              <FormDescription>
                The project name. It must be unique within your Studio team.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Project description"
                  disabled={disabled || updateProject.isPending}
                  {...field}
                />
              </FormControl>
              <FormDescription>
                A short description of your project.
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
            disabled={!form.formState.isDirty || updateProject.isPending}
          >
            Reset
          </Button>
          <Button
            type="submit"
            disabled={
              disabled || !nameAvailable.data || updateProject.isPending
            }
          >
            {updateProject.isPending && (
              <Loader2 className="mr-2 h-5 w-5 animate-spin" />
            )}
            Submit
          </Button>
        </div>
      </form>
    </Form>
  );
}
