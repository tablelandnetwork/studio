"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { type schema } from "@tableland/studio-store";
import { updateProjectSchema } from "@tableland/studio-validators";
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
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";

export default function EditProject({
  org,
  project,
  disabled = false,
}: {
  org: schema.Org;
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
      nativeMode: !!project.nativeMode,
    },
  });

  useEffect(() => {
    form.reset({ name: project.name, description: project.description });
  }, [project, form]);

  const nameAvailable = api.projects.nameAvailable.useQuery(
    query !== project.name
      ? { orgId: org.id, projectId: project.id, name: query }
      : skipToken,
    { retry: false },
  );

  const updateProject = api.projects.updateProject.useMutation({
    onSuccess: (project) => {
      router.replace(`/${org.slug}/${project.slug}/settings`);
      router.refresh();
    },
  });

  api.projects.projectBySlug.useQuery(
    updateProject.data
      ? { slug: updateProject.data.slug, orgId: org.id }
      : skipToken,
  );

  const onSubmit = (values: z.infer<typeof updateProjectSchema>) => {
    updateProject.mutate({
      projectId: project.id,
      name: form.formState.dirtyFields.name ? values.name : undefined,
      description: form.formState.dirtyFields.description
        ? values.description
        : undefined,
      nativeMode: form.formState.dirtyFields.nativeMode
        ? values.nativeMode
        : undefined,
    });
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
                The project name. It must be unique within your Studio org.
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
        <FormField
          control={form.control}
          name="nativeMode"
          render={({ field: { value, onChange, ...field } }) => (
            <FormItem className="">
              <FormLabel>Native Mode</FormLabel>
              <FormControl>
                <Switch
                  className="block"
                  disabled={disabled || updateProject.isPending}
                  checked={value}
                  onCheckedChange={onChange}
                  {...field}
                />
              </FormControl>
              <FormDescription>
                Native mode will display native Tableland table names in your
                project&apos;s left hand panel for any definitions that have
                been deployed, and allow you to use those table names in your
                Console queries.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="flex gap-4">
          <Button
            variant="secondary"
            type="reset"
            onClick={onReset}
            disabled={
              !form.formState.isDirty || updateProject.isPending || disabled
            }
          >
            Reset
          </Button>
          <Button
            type="submit"
            disabled={
              disabled ||
              !form.formState.isDirty ||
              (!!form.formState.dirtyFields.name && !nameAvailable.data) ||
              updateProject.isPending
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
