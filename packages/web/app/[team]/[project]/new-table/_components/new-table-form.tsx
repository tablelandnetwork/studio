"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { sqliteKeywords } from "@tableland/studio-client";
import {
  cleanSchema,
  setConstraint,
  type Schema,
  type schema,
} from "@tableland/studio-store";
import { Loader2, Plus } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useFieldArray, useForm } from "react-hook-form";
import * as z from "zod";
import { skipToken } from "@tanstack/react-query";
import Columns from "./columns";
import { FormRootMessage } from "@/components/form-root";
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
import { Textarea } from "@/components/ui/textarea";
import { api } from "@/trpc/react";
import TeamSwitcher from "@/components/team-switcher";
import ProjectSwitcher from "@/components/project-switcher";
import { ensureError } from "@/lib/ensure-error";
import TableColumns from "@/components/table-columns";

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
  team?: schema.Team;
  project?: schema.Project;
  envs?: schema.Environment[];
  showSelectors?: boolean;
  schema?: Schema;
}

export default function NewTableForm({ project, team, envs, schema }: Props) {
  const [selectedTeam, setSelectedTeam] = useState<schema.Team | undefined>(
    team,
  );
  const [selectedProject, setSelectedProject] = useState<
    schema.Project | undefined
  >(undefined);
  const [tableName, setTableName] = useState("");
  const [nameAvailable, setNameAvailable] = useState<boolean | undefined>();
  const router = useRouter();

  useEffect(() => {
    setSelectedProject(undefined);
  }, [selectedTeam]);

  console.log("selectedTeam", selectedTeam);

  const { data: teams } = api.teams.userTeams.useQuery();
  const { data: projects } = api.projects.teamProjects.useQuery(
    selectedTeam ? { teamId: selectedTeam.id } : skipToken,
  );

  const nameAvailableQuery = api.tables.nameAvailable.useQuery(
    project && !!tableName
      ? { projectId: project.id, name: tableName }
      : skipToken,
  );

  const newTable = api.tables.newTable.useMutation({
    onSuccess: () => {
      if (!team || !project) return;
      router.refresh();
      router.replace(`/${team.slug}/${project.slug}`);
    },
    onError: (err: any) => {
      const error = ensureError(err);
      setError("root", { message: error.message });
    },
  });

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      description: "",
      columns: [],
      deployments: envs?.map((env) => ({ env: env.name, chain: "no-deploy" })),
    },
  });

  const { handleSubmit, register, control, setError } = form;

  // const { fields } = useFieldArray({
  //   control,
  //   name: "deployments",
  // });

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

    if (!project) return;

    newTable.mutate({
      projectId: project.id,
      name: values.name,
      description: values.description,
      schema: cleanSchema({ columns: schemaCols }),
    });
  }

  return (
    <>
      <Form {...form}>
        <form
          // TODO: `handleSubmit` creates a floating promise, as a result the linter is complaining
          //    we should figure out if this is ok or not and either change this or the lint config
          // eslint-disable-next-line @typescript-eslint/no-misused-promises
          onSubmit={handleSubmit(onSubmit)}
          className="mx-auto max-w-2xl space-y-8"
        >
          <TeamSwitcher
            teams={teams}
            selectedTeam={selectedTeam}
            onTeamSelected={setSelectedTeam}
          />
          <ProjectSwitcher
            variant="select"
            team={selectedTeam}
            projects={projects}
            selectedProject={selectedProject}
            onProjectSelected={setSelectedProject}
          />
          <FormField
            control={control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Name</FormLabel>
                <FormControl>
                  <InputWithCheck
                    placeholder="Table name"
                    updateQuery={setTableName}
                    queryStatus={nameAvailableQuery}
                    onResult={setNameAvailable}
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
                  Provide a description of your new Table so others can
                  understand the role it plays in your Project Blueprint.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          <div className="space-y-2">
            <FormLabel>Columns</FormLabel>
            {schema ? <TableColumns columns={schema.columns} /> : null}
            {columnFields.length ? (
              <Columns
                columns={columnFields}
                control={control}
                register={register}
                removeColumn={removeColumn}
              />
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
          <FormRootMessage />
          <Button type="submit" disabled={newTable.isPending || !nameAvailable}>
            {newTable.isPending && (
              <Loader2 className="mr-2 h-5 w-5 animate-spin" />
            )}
            Submit
          </Button>
        </form>
      </Form>
    </>
  );
}
