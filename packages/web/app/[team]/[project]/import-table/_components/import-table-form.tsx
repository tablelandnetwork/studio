"use client";

import ChainSelector from "@/components/chain-selector";
import InputWithCheck from "@/components/input-with-check";
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
import { api } from "@/trpc/react";
import { zodResolver } from "@hookform/resolvers/zod";
import { schema } from "@tableland/studio-store";
import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import * as z from "zod";

const formSchema = z.object({
  chainId: z.coerce.number().gt(0),
  tableId: z.string().trim().nonempty(),
  name: z
    .string()
    .nonempty()
    .regex(
      /^(?!\d)[a-z0-9_]+$/,
      "Table name can't start with a number and can contain any combination of lowercase letters, numbers, and underscores.",
    ),
  description: z.string().trim().nonempty(),
  environment: z
    .string()
    .optional()
    .refine((v) => !!v, "Environment is required")
    .transform((v) => v!),
});

interface Props {
  team: schema.Team;
  project: schema.Project;
  envs: schema.Environment[];
}

export default function ImportTableForm({ project, team, envs }: Props) {
  const [tableName, setTableName] = useState("");
  const [nameAvailable, setNameAvailable] = useState<boolean | undefined>();
  const router = useRouter();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      chainId: 0,
      tableId: "",
      name: "",
      description: undefined,
      environment: undefined,
    },
  });

  const { handleSubmit, control, register, setValue } = form;

  const nameAvailableQuery = api.tables.nameAvailable.useQuery(
    {
      projectId: project.id,
      name: tableName,
    },
    {
      enabled: !!tableName,
    },
  );

  const importTable = api.tables.importTable.useMutation({
    onSuccess: () => {
      router.replace(`/${team.slug}/${project.slug}`);
    },
  });

  function onSubmit(values: z.infer<typeof formSchema>) {
    importTable.mutate({
      projectId: project.id,
      chainId: values.chainId,
      tableId: values.tableId,
      name: values.name,
      environmentId: values.environment,
      description: values.description,
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
                <ChainSelector
                  onValueChange={(val) => setValue("chainId", val)}
                />
              </FormControl>
              <FormDescription>
                The chain ID where the existing Tableland table exists.&nbsp;
                <a
                  href={
                    "https://docs.tableland.xyz/smart-contracts/deployed-contracts#registry-contract"
                  }
                  className={
                    "text-sm font-medium transition-colors hover:text-primary"
                  }
                  target="_blank"
                >
                  Supported chains
                </a>
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
                <InputWithCheck
                  placeholder="eg. users"
                  updateQuery={setTableName}
                  queryStatus={nameAvailableQuery}
                  onResult={setNameAvailable}
                  {...field}
                />
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
                Provide a description for the imported Table so others can
                understand the role it plays in your Project Blueprint.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={control}
          name="environment"
          render={({ field }) => (
            <Input
              type="hidden"
              {...field}
              {...register("environment")}
              value={envs[0].id}
            />
            // <FormItem>
            //   <FormLabel>Environment</FormLabel>
            //   <Select onValueChange={field.onChange} defaultValue={field.value}>
            //     <FormControl>
            //       <SelectTrigger className="w-auto gap-x-2">
            //         <SelectValue placeholder="Select Environment" />
            //       </SelectTrigger>
            //     </FormControl>
            //     <SelectContent>
            //       {envs.map((env) => (
            //         <SelectItem key={env.id} value={env.id}>
            //           {env.name}
            //         </SelectItem>
            //       ))}
            //     </SelectContent>
            //   </Select>
            //   <FormDescription>
            //     You must choose an Environment to import the Table to. You can
            //     deploy the resulting Project Table to other Environments at a
            //     later time on the Deployments screen.
            //   </FormDescription>
            //   <FormMessage />
            // </FormItem>
          )}
        />
        <Button
          type="submit"
          disabled={importTable.isLoading || !nameAvailable}
        >
          {importTable.isLoading && (
            <Loader2 className="mr-2 h-5 w-5 animate-spin" />
          )}
          Import
        </Button>
      </form>
    </Form>
  );
}
