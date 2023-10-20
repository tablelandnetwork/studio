"use client";

import { newTable, tableNameAvailable } from "@/app/actions";
import InputWithCheck from "@/components/input-with-check";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import { cleanSchema, setConstraint } from "@/lib/schema";
import { zodResolver } from "@hookform/resolvers/zod";
import { sqliteKeywords } from "@tableland/studio-client";
import { Schema, schema } from "@tableland/studio-store";
import { HelpCircle, Loader2, Plus, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { useFieldArray, useForm } from "react-hook-form";
import * as z from "zod";

const formSchema = z.object({
  name: z
    .string()
    .nonempty()
    .regex(
      /^(?!\d)[a-z0-9_]+$/,
      "Table name can't start with a number and can contain any combination of lowercase letters, numbers, and underscores.",
    )
    .refine((val) => !sqliteKeywords.includes(val.toUpperCase()), {
      message: "You can't use a SQL keyword as a table name.",
    }),
  description: z.string().trim().nonempty(),
  columns: z.array(
    z.object({
      id: z.string(),
      name: z
        .string()
        .trim()
        .nonempty()
        .regex(
          /^(?!\d)[a-z0-9_]+$/,
          "Column name can't start with a number and can contain any combination of lowercase letters, numbers, and underscores.",
        )
        .refine((val) => !sqliteKeywords.includes(val.toUpperCase()), {
          message: "You can't use a SQL keyword as a column name.",
        }),
      type: z.enum(["int", "integer", "text", "blob"]),
      notNull: z.boolean(),
      primaryKey: z.boolean(),
      unique: z.boolean(),
    }),
  ),
  deployments: z.array(
    z.object({ env: z.string().trim(), chain: z.string().trim() }),
  ),
});

interface Props {
  team: schema.Team;
  project: schema.Project;
  envs: schema.Environment[];
}

export default function NewTable({ project, team, envs }: Props) {
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
      columns: [],
      deployments: envs.map((env) => ({ env: env.name, chain: "no-deploy" })),
    },
  });

  const { handleSubmit, register, control, watch } = form;

  const { fields } = useFieldArray({
    control,
    name: "deployments",
  });

  const { fields: columnFields } = useFieldArray({
    control,
    name: "columns",
  });

  const addColumn = () => {
    form.setValue("columns", [
      ...form.getValues("columns"),
      {
        id: new Date().getTime().toString(),
        name: "",
        type: "integer",
        notNull: false,
        primaryKey: false,
        unique: false,
      },
    ]);
  };

  const removeColumn = (index: number) => {
    const cols = [...form.getValues("columns")];
    form.setValue("columns", cols.toSpliced(index, 1));
  };

  function onSubmit(values: z.infer<typeof formSchema>) {
    const schemaCols = values.columns.map(
      (column): Schema["columns"][number] => {
        let schemaColumn: Schema["columns"][number] = {
          name: column.name || "",
          type: column.type,
        };
        if (column.notNull) {
          schemaColumn = setConstraint(schemaColumn, "not null", true);
        }
        if (column.primaryKey) {
          schemaColumn = setConstraint(schemaColumn, "primary key", true);
        }
        if (column.unique) {
          schemaColumn = setConstraint(schemaColumn, "unique", true);
        }
        return schemaColumn;
      },
    );
    startTransition(async () => {
      await newTable(
        project,
        values.name,
        values.description,
        cleanSchema({ columns: schemaCols }),
      );
      router.replace(`/${team.slug}/${project.slug}`);
    });
  }

  const checkTableName = async (name: string) => {
    return await tableNameAvailable(project.id, name);
  };

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
                <InputWithCheck
                  placeholder="Table name"
                  check={checkTableName}
                  onCheckResult={setNameAvailable}
                  {...field}
                />
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
          {!!columnFields.length ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead className="flex items-center gap-2">
                    Type
                    <HoverCard>
                      <HoverCardTrigger>
                        <HelpCircle className="h-5 w-5 text-gray-200 hover:text-gray-400" />
                      </HoverCardTrigger>
                      <HoverCardContent className="w-80">
                        <Table>
                          <TableCaption className="text-xs font-normal text-muted-foreground">
                            Explanation of supported column types.
                          </TableCaption>
                          <TableHeader>
                            <TableRow>
                              <TableHead>Type</TableHead>
                              <TableHead>Description</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            <TableRow>
                              <TableCell className="font-medium">Int</TableCell>
                              <TableCell className="font-normal">
                                Signed integer values, stored in 0, 1, 2, 3, 4,
                                6, or 8 bytes depending on the magnitude of the
                                value.
                              </TableCell>
                            </TableRow>
                            <TableRow>
                              <TableCell className="font-medium">
                                Integer
                              </TableCell>
                              <TableCell className="font-normal">
                                Same as Int, except it may also be used to
                                represent an auto-incrementing primary key
                                field.
                              </TableCell>
                            </TableRow>
                            <TableRow>
                              <TableCell className="font-medium">
                                Text
                              </TableCell>
                              <TableCell className="font-normal">
                                Text string, stored using the database encoding
                                (UTF-8).
                              </TableCell>
                            </TableRow>
                            <TableRow>
                              <TableCell className="font-medium">
                                Blob
                              </TableCell>
                              <TableCell className="font-normal">
                                A blob of data, stored exactly as it was input.
                                Useful for byte slices etc.
                              </TableCell>
                            </TableRow>
                          </TableBody>
                        </Table>
                      </HoverCardContent>
                    </HoverCard>
                  </TableHead>
                  <TableHead>Not Null</TableHead>
                  <TableHead>Primary Key</TableHead>
                  <TableHead>Unique</TableHead>
                  <TableHead></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {columnFields.map((column, index) => (
                  <TableRow key={column.id}>
                    <TableCell>
                      <FormField
                        control={control}
                        name={`columns.${index}.name`}
                        render={({ field }) => (
                          <FormItem>
                            <FormControl>
                              <Input
                                key={column.id}
                                id={index.toString()}
                                placeholder="column_name"
                                {...register(`columns.${index}.name`)}
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </TableCell>
                    <TableCell>
                      <FormField
                        control={control}
                        name={`columns.${index}.type`}
                        render={({ field }) => (
                          <FormItem>
                            <Select
                              key={column.id}
                              onValueChange={field.onChange}
                              defaultValue={field.value}
                            >
                              <FormControl>
                                <SelectTrigger
                                  className="w-auto gap-x-2"
                                  key={column.id}
                                  // {...register(`columns.${index}.type`)} // TODO: Not sure how to register this select.
                                >
                                  <SelectValue placeholder="Select column type" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="int">Int</SelectItem>
                                <SelectItem value="integer">Integer</SelectItem>
                                <SelectItem value="text">Text</SelectItem>
                                <SelectItem value="blob">Blob</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </TableCell>
                    <TableCell>
                      <FormField
                        control={control}
                        name={`columns.${index}.notNull`}
                        render={({ field }) => (
                          <FormItem>
                            <FormControl>
                              <Checkbox
                                key={column.id}
                                checked={field.value}
                                onCheckedChange={field.onChange}
                                {...register(`columns.${index}.notNull`)}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </TableCell>
                    <TableCell>
                      <FormField
                        control={control}
                        name={`columns.${index}.primaryKey`}
                        render={({ field }) => (
                          <FormItem>
                            <FormControl>
                              <Checkbox
                                key={column.id}
                                checked={field.value}
                                onCheckedChange={field.onChange}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </TableCell>
                    <TableCell>
                      <FormField
                        control={control}
                        name={`columns.${index}.unique`}
                        render={({ field }) => (
                          <FormItem>
                            <FormControl>
                              <Checkbox
                                key={column.id}
                                checked={field.value}
                                onCheckedChange={field.onChange}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </TableCell>
                    <TableCell>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          removeColumn(index);
                        }}
                      >
                        <X />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <p className="text-center text-[0.8rem] text-muted-foreground">
              No columns to display, go ahead and add one.
            </p>
          )}
          <Button
            className="my-4"
            type="button"
            variant="outline"
            size="sm"
            onClick={addColumn}
          >
            <Plus className="mr-2" />
            Add Column
          </Button>
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
                          {chains().map((chain) => (
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
        <Button type="submit" disabled={pending || !nameAvailable}>
          {pending && <Loader2 className="mr-2 h-5 w-5 animate-spin" />}
          Submit
        </Button>
      </form>
    </Form>
  );
}
