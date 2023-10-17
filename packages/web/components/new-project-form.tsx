"use client";

import { newProject, projectNameAvailable } from "@/app/actions";
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
import { zodResolver } from "@hookform/resolvers/zod";
import { schema } from "@tableland/studio-store";
import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { useFieldArray, useForm } from "react-hook-form";
import * as z from "zod";
import InputWithCheck from "./input-with-check";

const formSchema = z.object({
  name: z.string().trim().min(3),
  description: z.string().trim().nonempty(),
  environments: z.array(z.object({ name: z.string().trim().min(3) })),
});

export default function NewProjectForm({ team }: { team: schema.Team }) {
  const [nameAvailable, setNameAvailable] = useState<boolean | undefined>(
    undefined,
  );
  const [pending, startTransition] = useTransition();

  const router = useRouter();

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
  } = form;

  const { fields, append, prepend, remove, swap, move, insert } = useFieldArray(
    {
      control,
      name: "environments",
    },
  );

  function onSubmit(values: z.infer<typeof formSchema>) {
    startTransition(async () => {
      // TODO: A default env is being created in the store when the Project is created.
      // Undo this later.
      const res = await newProject(team.id, values.name, values.description);
      // TODO: Should probably do this within "new project action"
      // await Promise.all(
      //   values.environments.map((env) => newEnvironment(res.id, env.name)),
      // );
      router.push(`/${team.slug}/${res.slug}`);
    });
  }

  const checkProjectName = async (name: string) => {
    return await projectNameAvailable(team.id, name);
  };

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
                  check={checkProjectName}
                  onCheckResult={setNameAvailable}
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
        <Button type="submit" disabled={pending || !nameAvailable}>
          {pending && <Loader2 className="mr-2 h-5 w-5 animate-spin" />}
          Submit
        </Button>
      </form>
    </Form>
  );
}
