"use client";

import { newTable } from "@/app/actions";
import SchemaBuilder from "@/components/schema-builder";
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
import { cleanSchema, generateCreateTableStatement } from "@/lib/schema";
import { zodResolver } from "@hookform/resolvers/zod";
import { helpers } from "@tableland/sdk";
import { schema } from "@tableland/studio-store";
import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { useFieldArray, useForm } from "react-hook-form";
import * as z from "zod";

const supportedChains = Object.values(helpers.supportedChains);

const formSchema = z.object({
  name: z
    .string()
    .nonempty()
    .regex(
      /^(?!\d)[a-z0-9_]+$/,
      "Table name can't start with a number and can contain any combination of lowercase letters, numbers, and underscores.",
    ),
  description: z.string().nonempty(),
  deployments: z.array(z.object({ env: z.string(), chain: z.string() })),
});

interface Props {
  team: schema.Team;
  project: schema.Project;
  envs: schema.Environment[];
}

export default function NewTable({ project, team, envs }: Props) {
  const [pending, startTransition] = useTransition();
  const router = useRouter();

  const [schema, setSchema] = useState<schema.Schema>({ columns: [] });

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      description: "",
      deployments: envs.map((env) => ({ env: env.name, chain: "no-deploy" })),
    },
  });

  const { handleSubmit, register, control, watch } = form;

  const { fields } = useFieldArray({
    control,
    name: "deployments",
  });

  const name = watch("name");

  function onSubmit(values: z.infer<typeof formSchema>) {
    startTransition(async () => {
      await newTable(
        project,
        values.name,
        values.description,
        cleanSchema(schema),
      );
      router.replace(`/${team.slug}/${project.slug}`);
    });
  }

  return (
    <Form {...form}>
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="mx-auto max-w-2xl space-y-8"
      >
        <FormField
          control={control}
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
          control={control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description</FormLabel>
              <FormControl>
                <Textarea placeholder="Table description" {...field} />
              </FormControl>
              <FormDescription>
                Provide a description of your new Table so others can understand
                the role it plays in your Project Blueprint.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="space-y-2">
          <FormLabel>Columns</FormLabel>
          <SchemaBuilder schema={schema} setSchema={setSchema} />
          <pre>{generateCreateTableStatement(name, schema)}</pre>
        </div>
        {/* <div className="space-y-2">
          <FormLabel>Deployments</FormLabel>
          <FormDescription>
            You can optionally deploy your new table to one or more of your
            Project&apos;s Environments upon Table creation. If not, you can
            always deploy the Table later on the Deployments screen.
          </FormDescription>
          {fields.map((deployment, index) => {
            return (
              <div key={index}>
                <FormField
                  control={control}
                  name={`deployments.${index}.env`}
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <Input
                          type="hidden"
                          id={index.toString()}
                          value={deployment.env}
                          {...register(`deployments.${index}.env`)}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
                <FormField
                  key={deployment.id}
                  control={control}
                  name={`deployments.${index}.chain`}
                  render={({ field }) => (
                    <FormItem className="flex items-center gap-4">
                      <FormLabel>{deployment.env}</FormLabel>
                      <Select
                        key={deployment.id}
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger
                            className="w-auto gap-x-2"
                            {...register(`deployments.${index}.chain`)}
                          >
                            <SelectValue placeholder="Select a chain to deploy to" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="no-deploy">
                            Don&apos;t deploy
                          </SelectItem>
                          {supportedChains.map((chain) => (
                            <SelectItem
                              key={chain.chainName}
                              value={chain.chainName}
                            >
                              {chain.chainName} ({chain.chainId})
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            );
          })}
        </div> */}
        <Button type="submit" disabled={pending}>
          {pending && <Loader2 className="mr-2 h-5 w-5 animate-spin" />}
          Submit
        </Button>
      </form>
    </Form>
  );
}
