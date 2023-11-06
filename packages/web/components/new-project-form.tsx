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
import { Textarea } from "@/components/ui/textarea";
import { api } from "@/trpc/react";
import { zodResolver } from "@hookform/resolvers/zod";
import { schema } from "@tableland/studio-store";
import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useFieldArray, useForm } from "react-hook-form";
import * as z from "zod";
import { FormRootMessage } from "./form-root";
import InputWithCheck from "./input-with-check";

const formSchema = z.object({
  name: z.string().trim().min(3),
  description: z.string().trim().nonempty(),
  environments: z.array(z.object({ name: z.string().trim().min(3) })),
});

export default function NewProjectForm({ team }: { team: schema.Team }) {
  const [projectName, setProjectName] = useState("");
  const [nameAvailable, setNameAvailable] = useState<boolean | undefined>();
  const router = useRouter();

  const nameAvailableQuery = api.projects.nameAvailable.useQuery(
    { teamId: team.id, name: projectName },
    { enabled: !!projectName },
  );

  const newProject = api.projects.newProject.useMutation({
    onSuccess: (res) => {
      router.refresh();
      router.push(`/${team.slug}/${res.slug}`);
    },
    onError: (err) => {
      setError("root", { message: err.message });
    },
  });

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      description: "",
      environments: [],
    },
  });

  const {
    handleSubmit,
    register,
    control,
    formState: { isValid, errors, isValidating, isDirty },
    reset,
    setError,
  } = form;

  const { fields, append, prepend, remove, swap, move, insert } = useFieldArray(
    {
      control,
      name: "environments",
    },
  );

  function onSubmit(values: z.infer<typeof formSchema>) {
    newProject.mutate({
      teamId: team.id,
      name: values.name,
      description: values.description,
    });
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
                  placeholder="Project name"
                  updateQuery={setProjectName}
                  queryStatus={nameAvailableQuery}
                  onResult={setNameAvailable}
                  {...field}
                />
              </FormControl>
              <FormDescription>
                Project name must be unique within your team and at least three
                characters long.
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
                <Textarea placeholder="Project description" {...field} />
              </FormControl>
              <FormDescription>
                Provide a description of your Project so others can understand
                what you&apos;re up to.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        {/* <div>
          <FormItem>
            <FormLabel>Environments</FormLabel>
            <FormDescription className="pb-2">
              Environments provide logical groupings of tables you can use
              however you&apos;d like. Optionally add environments here now, or
              add them later in your Project&apos;s settings.
            </FormDescription>
          </FormItem>
          {fields.map((env, index) => (
            <FormField
              control={form.control}
              name={`environments.${index}.name`}
              key={env.id}
              render={({ field }) => (
                <FormItem className="pb-3">
                  <FormControl key={index}>
                    <div className="flex gap-2">
                      <Input
                        {...form.register(`environments.${index}.name`)}
                        placeholder="Environment name"
                      />
                      <Button
                        className="hidden"
                        onClick={(e) => {
                          e.preventDefault();
                          append(
                            { name: "" },
                            {
                              shouldFocus: true,
                            },
                          );
                        }}
                      />
                      <Button
                        variant="ghost"
                        type="button"
                        className="px-0"
                        size="sm"
                        onClick={() => remove(index)}
                      >
                        <X />
                      </Button>
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          ))}
          <Button
            type="button"
            variant="outline"
            disabled={pending}
            onClick={(e) => {
              e.preventDefault();
              append({ name: "" });
            }}
          >
            <Plus className="mr-2 h-5 w-5" />
            Add Environment
          </Button>
        </div> */}
        <FormRootMessage />
        <Button type="submit" disabled={newProject.isLoading || !nameAvailable}>
          {newProject.isLoading && (
            <Loader2 className="mr-2 h-5 w-5 animate-spin" />
          )}
          Submit
        </Button>
      </form>
    </Form>
  );
}
