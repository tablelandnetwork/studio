"use client";

import { importTable } from "@/app/actions";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Environment, Project, Team } from "@/db/schema";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { useForm } from "react-hook-form";
import * as z from "zod";

const schema = z.object({
  chainId: z.coerce.number().gt(0),
  tableId: z.string().nonempty(),
  name: z.string().nonempty(),
  description: z.string().optional(),
  environment: z
    .string()
    .optional()
    .refine((v) => !!v, "Environment is required")
    .transform((v) => v!),
});

interface Props {
  team: Team;
  project: Project;
  envs: Environment[];
}

export default function ImportTableForm({ project, team, envs }: Props) {
  const [pending, startTransition] = useTransition();
  const router = useRouter();

  const form = useForm<z.infer<typeof schema>>({
    resolver: zodResolver(schema),
    defaultValues: {
      chainId: 0,
      tableId: "",
      name: "",
      description: undefined,
      environment: undefined,
    },
  });

  const { handleSubmit, control } = form;

  function onSubmit(values: z.infer<typeof schema>) {
    console.log("values", values);
    startTransition(async () => {
      const res = await importTable(
        project,
        values.chainId,
        values.tableId,
        values.name,
        values.environment,
        values.description
      );
      console.log("res", res);
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
          name="chainId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Chain ID</FormLabel>
              <FormControl>
                <Input placeholder="eg. 8001" {...field} />
              </FormControl>
              <FormDescription>
                The chain ID where the existing Tableland table exists.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={control}
          name="tableId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Table ID</FormLabel>
              <FormControl>
                <Input placeholder="eg. 345" {...field} />
              </FormControl>
              <FormDescription>
                The ID of the existing Tableland table.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Table Name</FormLabel>
              <FormControl>
                <Input placeholder="eg. users" {...field} />
              </FormControl>
              <FormDescription>
                The name of the Table to create in your Studio project. This
                Table&apos;s name must be unique within your Project.
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
                This is the description for your imported Table and it&apos;s
                optional. It is only used in Studio.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={control}
          name="environment"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Environment</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger className="w-auto gap-x-2">
                    <SelectValue placeholder="Select Environment" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {envs.map((env) => (
                    <SelectItem key={env.id} value={env.id}>
                      {env.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormDescription>
                You must choose an Environment to import the Table to. You can
                deploy the resulting Project Table to other Environments at a
                later time on the Deployments screen.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" disabled={pending}>
          {pending && <Loader2 className="mr-2 h-5 w-5 animate-spin" />}
          Import
        </Button>
      </form>
    </Form>
  );
}
