"use client";

import { Loader2, Trash2 } from "lucide-react";

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
import { Environment, Project, Team } from "@/db/schema";
import { createTableAtom } from "@/store/create-table";
import { zodResolver } from "@hookform/resolvers/zod";
import { useAtom } from "jotai";
import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { useFieldArray, useForm } from "react-hook-form";
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
  deployments: z
    .array(z.object({ environment: z.string().min(3), chain: z.string() }))
    .refine((values) => {
      const envs = values.map((v) => v.environment);
      return new Set(envs).size === envs.length;
    }, "Cannot deploy to the same environment twice"),
});

interface Props {
  team: Team;
  project: Project;
  envs: Environment[];
}

export default function NewTable({ project, team, envs }: Props) {
  const [pending, startTransition] = useTransition();
  const router = useRouter();

  const [createTable, setCreateTable] = useAtom(createTableAtom);

  const form = useForm<z.infer<typeof schema>>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: "",
      description: "",
      deployments: [{ environment: "", chain: "0" }],
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
      name: "deployments",
    }
  );

  const name = form.watch("name");

  function onSubmit(values: z.infer<typeof schema>) {
    console.log("values", values);
    startTransition(async () => {
      const statement = createTableStatementFromObject(
        createTable,
        values.name
      );
      if (!statement) {
        console.error("No statement");
        return;
      }
      await newTable(project, values.name, statement, values.description);
      router.replace(`/${team.slug}/${project.slug}`);
      setCreateTable({ columns: [] });
    });
  }

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
          {fields.map((deployment, index) => {
            return (
              <div key={deployment.id} className="flex">
                <FormField
                  control={form.control}
                  name={`deployments.${index}.environment`}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder=" -- select an environment -- " />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem disabled value="">
                            {" "}
                            -- select an environment --{" "}
                          </SelectItem>
                          {envs.map((env) => (
                            <SelectItem key={env.id} value={env.id}>
                              {env.title}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormDescription>
                        Select an environment to which the table will be
                        deployed.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name={`deployments.${index}.chain`}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Chain</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder=" -- select a chain -- " />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem disabled value="">
                            {" "}
                            -- select a chain --{" "}
                          </SelectItem>
                          <SelectItem value="arb">Arbitrum</SelectItem>
                        </SelectContent>
                      </Select>

                      <FormDescription>
                        Select a chain for each environment where the table will
                        be deployed.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button
                  variant="outline"
                  type="button"
                  onClick={() => remove(index)}
                >
                  <Trash2 />
                </Button>
              </div>
            );
          })}

          <Button onClick={() => append({ environment: "", chain: "0" })}>
            Add Deployment
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
