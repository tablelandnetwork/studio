"use client";

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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Environment, Project, Team } from "@/db/schema";
import { createTableAtom } from "@/store/create-table";
import { providerAtom } from "@/store/wallet";
import { zodResolver } from "@hookform/resolvers/zod";
import { Database, helpers } from "@tableland/sdk";
import { Signer } from "ethers";
import { useAtom, useAtomValue } from "jotai";
import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { useFieldArray, useForm } from "react-hook-form";
import * as z from "zod";
import SchemaBuilder, {
  createTableStatementFromObject,
} from "./schema-builder";

const supportedChains = Object.values(helpers.supportedChains);

const schema = z.object({
  name: z.string(),
  description: z
    .string()
    .optional()
    .transform((v) => (!v ? undefined : v)),
  deployments: z.array(z.object({ env: z.string(), chain: z.string() })),
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
  const provider = useAtomValue(providerAtom);

  const form = useForm<z.infer<typeof schema>>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: "",
      description: "",
      deployments: envs.map((env) => ({ env: env.title, chain: "no-deploy" })),
    },
  });

  const { handleSubmit, register, control, watch } = form;

  const { fields } = useFieldArray({
    control,
    name: "deployments",
  });

  const name = watch("name");

  function onSubmit(values: z.infer<typeof schema>) {
    console.log("values", values);
    if (!provider) {
      console.log("No provider");
      return;
    }
    startTransition(async () => {
      const statement = createTableStatementFromObject(
        createTable,
        values.name
      );
      if (!statement) {
        console.error("No statement");
        return;
      }
      const deployments = values.deployments.filter(
        (d) => d.chain !== "no-deploy"
      );
      console.log("deployments", deployments);
      for (const deployment of deployments) {
        console.log("deploying to", deployment.chain);
        const res = await deployTable(
          deployment.chain,
          provider.getSigner(),
          statement
        );
        console.log("res", res);
      }
      await newTable(project, values.name, statement, values.description);
      // router.replace(`/${team.slug}/${project.slug}`);
      setCreateTable({ columns: [] });
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
        </div>
        <Button type="submit" disabled={pending}>
          {pending && <Loader2 className="mr-2 h-5 w-5 animate-spin" />}
          Submit
        </Button>
      </form>
    </Form>
  );
}

async function deployTable(
  network: string,
  signer: Signer,
  createStmt: string
) {
  const db = new Database({ signer, autoWait: true });
  const res = await db.exec(createStmt);
  return res;
}
