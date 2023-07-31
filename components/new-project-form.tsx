"use client";

import { newProject } from "@/app/actions";
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
import { Loader2, Plus, Trash2 } from "lucide-react";
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
  envs: z.array(z.string().min(3)),
});

export default function NewProjectForm({ team }: { team: Team }) {
  const [pending, startTransition] = useTransition();

  const router = useRouter();

  const form = useForm<z.infer<typeof schema>>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: "",
      description: "",
      envs: ["cxzc"],
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
      control: control,
      name: "envs",
      defaultValues: [""],
    }
  );

  function onSubmit(values: z.infer<typeof schema>) {
    startTransition(async () => {
      const res = await newProject(team.id, values.name, values.description);
      // await Promise.all(envs.map(env => newEnvironment(res.id, env)));
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
          <FormLabel className="text-lg">Environments</FormLabel>

          <div className="pl-4 pt-3">
            {fields.map((env, index) => (
              <FormField
                control={form.control}
                name={`envs.${index}`}
                key={env.id}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Environment {index + 1}</FormLabel>

                    <FormControl key={index}>
                      <div className="flex">
                        <Input
                          {...form.register(`envs.${index}`)}
                          placeholder="Environment name"
                        />
                        <Button variant="outline" onClick={() => remove(index)}>
                          <Trash2 />
                        </Button>
                      </div>
                    </FormControl>
                  </FormItem>
                )}
              />
            ))}
            <Button
              className="my-4"
              type="button"
              variant="outline"
              onClick={() => append("")}
            >
              <Plus className="mr-2" />
              Add environment
            </Button>
          </div>
        </div>

        <FormDescription>
          Enter environment names. You can add more by clicking Add more.
        </FormDescription>
        <FormMessage />

        <Button type="submit" disabled={pending}>
          {pending && <Loader2 className="mr-2 h-5 w-5 animate-spin" />}
          Submit
        </Button>
      </form>
    </Form>
  );
}
