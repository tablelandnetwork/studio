"use client";

import { Loader2 } from "lucide-react";

import { newTable } from "@/app/actions";
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
import { Project, Team } from "@/db/schema";
import { createTableAtom } from "@/store/create-table";
import { zodResolver } from "@hookform/resolvers/zod";
import { useAtom } from "jotai";
import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { useForm } from "react-hook-form";
import * as z from "zod";
import SchemaBuilder, {
  createTableStatementFromObject,
} from "./schema-builder";

const schema = z.object({
  name: z.string(),
  description: z
    .string()
    .optional()
    .transform((v) => (!v ? undefined : v)),
});

interface Props {
  team: Team;
  project: Project;
}

export default function NewTable({ project, team }: Props) {
  const [pending, startTransition] = useTransition();
  const router = useRouter();

  const [createTable, setCreateTable] = useAtom(createTableAtom);

  const form = useForm<z.infer<typeof schema>>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: "",
      description: "",
    },
  });

  const name = form.watch("name");

  function onSubmit(values: z.infer<typeof schema>) {
    startTransition(async () => {
      const statement = createTableStatementFromObject(
        createTable,
        values.name
      );
      if (!statement) return;
      await newTable(project, values.name, statement, values.description);
      router.replace(`/${team.slug}/${project.slug}`);
      setCreateTable({ columns: [] });
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
                <Input placeholder="Table name" {...field} />
              </FormControl>
              <FormDescription>
                Table name must be unique within your Project.
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
                <Textarea placeholder="Table description" {...field} />
              </FormControl>
              <FormDescription>
                This is the description for your new Table and it&apos;s
                optional.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <SchemaBuilder />
        <pre>{createTableStatementFromObject(createTable, name)}</pre>
        <Button type="submit" disabled={pending}>
          {pending && <Loader2 className="mr-2 h-5 w-5 animate-spin" />}
          Submit
        </Button>
      </form>
    </Form>
  );
}
