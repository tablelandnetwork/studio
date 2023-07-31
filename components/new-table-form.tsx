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
import { useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import * as z from "zod";
import SchemaBuilder, {
  createTableStatementFromObject,
} from "./schema-builder";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";

const schema = z.object({
  name: z.string(),
  description: z
    .string()
    .optional()
    .transform((v) => (!v ? undefined : v)),
  table: z.string(),
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

  const envs = ["staging", "production"];

  // Initial state for chain selections is an object where the keys are the
  // environment names and the values are the chain selections.
  const initialChainSelections = envs.reduce((acc: any, env) => {
    acc[env] = "";
    return acc;
  }, {});
  const [chainSelections, setChainSelections] = useState(
    initialChainSelections
  );

  const handleChainChange = (env, value) => {
    setChainSelections((prev) => ({
      ...prev,
      [env]: value,
    }));
  };

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="mx-auto max-w-2xl space-y-8"
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
        <div className="space-y-2">
          <FormLabel>Columns</FormLabel>
          <SchemaBuilder />
          <pre>{createTableStatementFromObject(createTable, name)}</pre>
        </div>

        <div className="space-y-2">
          <FormField
            control={form.control}
            name="table"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Table Deployments</FormLabel>
                {envs.map((env) => (
                  <div key={env}>
                    <label>{env}</label>
                    <Select
                      defaultValue={chainSelections[env]}
                      onValueChange={(value) => handleChainChange(env, value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select a chain" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="arbitrum">Arbitrum</SelectItem>
                        <SelectItem value="maticmum">Maticmum</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                ))}
                <FormDescription>
                  Select a chain for each environment where the table will be
                  deployed.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <Button type="submit" disabled={pending}>
          {pending && <Loader2 className="mr-2 h-5 w-5 animate-spin" />}
          Submit
        </Button>
      </form>
    </Form>
  );
}
