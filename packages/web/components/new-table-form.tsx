import { zodResolver } from "@hookform/resolvers/zod";
import { sqliteKeywords } from "@tableland/studio-api";
import {
  cleanSchema,
  setConstraint,
  type Schema,
  type schema,
  slugify,
} from "@tableland/studio-store";
import { helpers } from "@tableland/sdk";
import { Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import { useFieldArray, useForm } from "react-hook-form";
import * as z from "zod";
import { skipToken } from "@tanstack/react-query";
import { restrictedTableSlugs } from "@tableland/studio-api";
import Columns from "./columns";
import { FormRootMessage } from "./form-root";
import InputWithCheck from "./input-with-check";
import { Button } from "./ui/button";
import TableConstraints from "./table-constraints";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "./ui/sheet";
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
    .refine((val) => !sqliteKeywords.includes(val.toUpperCase()), {
      message: "You can't use a SQL keyword as a table name.",
    })
    .refine((val) => !restrictedTableSlugs.includes(slugify(val)), {
      message: "You can't use a restricted word as a table name.",
    })
    .refine(
      async (val) => {
        try {
          await helpers.validateTableName(`${val}_1_1`, true);
          return true;
        } catch (_) {
          return false;
        }
      },
      { message: "Table name invalid." },
    ),
  description: z.string().trim().nonempty(),
  columns: z
    .array(
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
    )
    .min(1, "At least one column is required."),
});

export interface NewTableFormProps {
  teamPreset?: schema.Team;
  projectPreset?: schema.Project;
  showSelectors?: boolean;
  schemaPreset?: Schema;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  trigger?: React.ReactNode;
  onSuccess: (
    team: schema.Team,
    project: schema.Project,
    table: schema.Table,
  ) => void;
}

export default function NewTableForm({
  teamPreset,
  projectPreset,
  showSelectors,
  schemaPreset,
  open,
  onOpenChange,
  trigger,
  onSuccess,
}: NewTableFormProps) {
  const [openSheet, setOpenSheet] = useState(open ?? false);
  const [team, setTeam] = useState<schema.Team | undefined>(teamPreset);
  const [project, setProject] = useState<schema.Project | undefined>(
    projectPreset,
  );
  const [tableName, setTableName] = useState("");
  const [nameAvailable, setNameAvailable] = useState<boolean | undefined>();

  const { data: teams } = api.teams.userTeams.useQuery(
    !teamPreset ? undefined : skipToken,
  );
  const { data: projects } = api.projects.teamProjects.useQuery(
    !projectPreset && team ? { teamId: team.id } : skipToken,
  );

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      description: "",
      columns: [],
    },
  });

  useEffect(() => {
    if (!openSheet) {
      setTeam(teamPreset);
      setProject(projectPreset);
      form.reset();
    }
    onOpenChange?.(openSheet);
  }, [openSheet, teamPreset, projectPreset, onOpenChange, form]);

  useEffect(() => {
    setOpenSheet(open ?? false);
  }, [open]);

  const nameAvailableQuery = api.tables.nameAvailable.useQuery(
    project && !!tableName
      ? { projectId: project.id, name: tableName }
      : skipToken,
  );

  const newTable = api.tables.newTable.useMutation({
    onSuccess: (table) => {
      if (!team || !project) return;
      onSuccess(team, project, table);
      setOpenSheet(false);
    },
    onError: (err: any) => {
      const error = ensureError(err);
      setError("root", { message: error.message });
    },
  });

  const { handleSubmit, register, control, setError } = form;

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

  const handleTeamSelected = (team: schema.Team) => {
    setTeam(team);
    setProject(undefined);
  };

  function onSubmit(values: z.infer<typeof formSchema>) {
    if (!project) return;
    const schema =
      schemaPreset ??
      cleanSchema({
        columns: values.columns.map((column): Schema["columns"][number] => {
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
        }),
      });
    newTable.mutate({
      projectId: project.id,
      name: values.name,
      description: values.description,
      schema,
    });
  }

  return (
    <Sheet open={openSheet} onOpenChange={setOpenSheet}>
      {trigger && <SheetTrigger asChild>{trigger}</SheetTrigger>}
      <SheetContent
        className="overflow-scroll sm:max-w-xl"
        closeDisabled={newTable.isPending}
        onPointerDownOutside={
          newTable.isPending ? (e) => e.preventDefault() : undefined
        }
        onEscapeKeyDown={
          newTable.isPending ? (e) => e.preventDefault() : undefined
        }
      >
        <Form {...form}>
          <form
            // TODO: `handleSubmit` creates a floating promise, as a result the linter is complaining
            //    we should figure out if this is ok or not and either change this or the lint config
            // eslint-disable-next-line @typescript-eslint/no-misused-promises
            onSubmit={handleSubmit(onSubmit)}
            className="mx-auto max-w-2xl space-y-8"
          >
            <SheetHeader>
              <SheetTitle>New Table</SheetTitle>
              {/* <SheetDescription>
                This action cannot be undone. This will permanently delete your
                account and remove your data from our servers.
              </SheetDescription> */}
            </SheetHeader>
            {(showSelectors ?? !teamPreset ?? !projectPreset) && (
              <>
                <div className="space-y-2">
                  <FormLabel>Team</FormLabel>
                  <TeamSwitcher
                    teams={teams}
                    selectedTeam={team}
                    onTeamSelected={handleTeamSelected}
                  />
                </div>
                <div className="space-y-2">
                  <FormLabel>Project</FormLabel>
                  <ProjectSwitcher
                    variant="select"
                    team={team}
                    projects={projects}
                    selectedProject={project}
                    onProjectSelected={setProject}
                    disabled={!team}
                  />
                </div>
              </>
            )}
            <FormField
              control={control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Name</FormLabel>
                  <FormControl>
                    <InputWithCheck
                      disabled={!project}
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

            {schemaPreset ? (
              <>
                <div className="space-y-2">
                  <FormLabel>Columns</FormLabel>
                  <TableColumns columns={schemaPreset.columns} />
                </div>
                {schemaPreset.tableConstraints && (
                  <div className="space-y-2">
                    <FormLabel>Table constraints</FormLabel>
                    <TableConstraints
                      tableConstraints={schemaPreset?.tableConstraints}
                    />
                  </div>
                )}
              </>
            ) : (
              <FormField
                control={control}
                name="columns"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Columns</FormLabel>
                    <FormControl>
                      <Columns
                        columns={columnFields}
                        control={control}
                        register={register}
                        addColumn={addColumn}
                        removeColumn={removeColumn}
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>
                      Specify at least one column for your table&apos;s schema.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}
            <FormRootMessage />
            <Button
              type="submit"
              disabled={newTable.isPending || !nameAvailable}
            >
              {newTable.isPending && (
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
              )}
              Submit
            </Button>
          </form>
        </Form>
      </SheetContent>
    </Sheet>
  );
}
