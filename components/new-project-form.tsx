"use client";

import { newEnvironment, newProject } from "@/app/actions";
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
import { Textarea } from "@/components/ui/textarea";
import { Team } from "@/db/schema";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, Plus, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { useFieldArray, useForm } from "react-hook-form";
import * as z from "zod";

const schema = z.object({
  name: z.string().min(3),
  description: z
    .string()
    .optional()
    .transform((v) => (!v ? undefined : v)),
  environments: z.array(z.object({ name: z.string().min(3) })),
});

export default function NewProjectForm({ team }: { team: Team }) {
  const [pending, startTransition] = useTransition();

  const router = useRouter();

  const form = useForm<z.infer<typeof schema>>({
    resolver: zodResolver(schema),
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
    }
  );

  function onSubmit(values: z.infer<typeof schema>) {
    startTransition(async () => {
      const res = await newProject(team.id, values.name, values.description);
      // TODO: Should probably do this within "new project action"
      await Promise.all(
        values.environments.map((env) => newEnvironment(res.id, env.name))
      );
      router.push(`/${team.slug}/${res.slug}`);
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
                <Input placeholder="Project name" {...field} />
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
                This is the description for your new Project and it&apos;s
                optional.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <div>
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
                <FormItem>
                  <FormLabel></FormLabel>
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
                            }
                          );
                        }}
                      />
                      <Button
                        variant="ghost"
                        type="button"
                        className="px-0"
                        onClick={() => remove(index)}
                      >
                        <X />
                      </Button>
                    </div>
                  </FormControl>
                  <FormDescription></FormDescription>
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
        </div>
        <Button type="submit" disabled={pending}>
          {pending && <Loader2 className="mr-2 h-5 w-5 animate-spin" />}
          Submit
        </Button>
      </form>
    </Form>
  );
}
