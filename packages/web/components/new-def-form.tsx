import { zodResolver } from "@hookform/resolvers/zod";
import {
  cleanSchema,
  setConstraint,
  type Schema,
  type schema,
} from "@tableland/studio-store";
import { Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import { useFieldArray, useForm } from "react-hook-form";
import { type z } from "zod";
import { skipToken } from "@tanstack/react-query";
import { newDefFormSchema } from "@tableland/studio-validators";
import Columns from "./columns";
import { FormRootMessage } from "./form-root";
import InputWithCheck from "./input-with-check";
import { Button } from "./ui/button";
import DefConstraints from "./def-constraints";
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
import DefColumns from "@/components/def-columns";

export interface NewDefFormProps {
  teamPreset?: schema.Team;
  projectPreset?: schema.Project;
  schemaPreset?: Schema;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  trigger?: React.ReactNode;
  onSuccess: (
    team: schema.Team,
    project: schema.Project,
    def: schema.Def,
  ) => void;
}

export default function NewDefForm({
  teamPreset,
  projectPreset,
  schemaPreset,
  open,
  onOpenChange,
  trigger,
  onSuccess,
}: NewDefFormProps) {
  const [openSheet, setOpenSheet] = useState(open ?? false);
  const [team, setTeam] = useState<schema.Team | undefined>(teamPreset);
  const [project, setProject] = useState<schema.Project | undefined>(
    projectPreset,
  );
  const [defName, setDefName] = useState("");

  const { data: teams } = api.teams.userTeams.useQuery(
    !teamPreset ? undefined : skipToken,
  );
  const { data: projects } = api.projects.teamProjects.useQuery(
    !projectPreset && team ? { teamId: team.id } : skipToken,
  );

  const form = useForm<z.infer<typeof newDefFormSchema>>({
    resolver: zodResolver(newDefFormSchema),
    defaultValues: {
      name: "",
      description: "",
      columns: schemaPreset
        ? [
            {
              id: "dummy",
              name: "dummy",
              type: "int",
              notNull: false,
              primaryKey: false,
              unique: false,
            },
          ]
        : [],
    },
  });

  useEffect(() => {
    form.reset({
      name: "",
      description: "",
      columns: schemaPreset
        ? [
            {
              id: "dummy",
              name: "dummy",
              type: "int",
              notNull: false,
              primaryKey: false,
              unique: false,
            },
          ]
        : [],
    });
  }, [schemaPreset, form]);

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

  const nameAvailableQuery = api.defs.nameAvailable.useQuery(
    project && !!defName ? { projectId: project.id, name: defName } : skipToken,
    { retry: false },
  );

  const newDef = api.defs.newDef.useMutation({
    onSuccess: (def) => {
      if (!team || !project) return;
      onSuccess(team, project, def);
      setOpenSheet(false);
    },
    onError: (err: any) => {
      const error = ensureError(err);
      setError("root", { message: error.message });
    },
  });

  const { handleSubmit, control, setError } = form;

  const { fields: columnFields } = useFieldArray({
    control,
    name: "columns",
  });

  const handleTeamSelected = (team: schema.Team) => {
    setTeam(team);
    setProject(undefined);
  };

  function onSubmit(values: z.infer<typeof newDefFormSchema>) {
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
    newDef.mutate({
      projectId: project.id,
      schema,
      ...values,
    });
  }

  return (
    <Sheet open={openSheet} onOpenChange={setOpenSheet}>
      {trigger && <SheetTrigger asChild>{trigger}</SheetTrigger>}
      <SheetContent
        className="overflow-scroll sm:max-w-xl"
        closeDisabled={newDef.isPending}
        onPointerDownOutside={
          newDef.isPending ? (e) => e.preventDefault() : undefined
        }
        onEscapeKeyDown={
          newDef.isPending ? (e) => e.preventDefault() : undefined
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
              <SheetTitle>New definition</SheetTitle>
              {/* <SheetDescription>
                This action cannot be undone. This will permanently delete your
                account and remove your data from our servers.
              </SheetDescription> */}
            </SheetHeader>
            {!teamPreset && (
              <div className="space-y-2">
                <FormLabel>Team</FormLabel>
                <TeamSwitcher
                  variant="select"
                  teams={teams}
                  selectedTeam={team}
                  onTeamSelected={handleTeamSelected}
                />
              </div>
            )}
            {!projectPreset && (
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
                      placeholder="Definition name"
                      updateQuery={setDefName}
                      queryStatus={nameAvailableQuery}
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    Definition name must be unique within your Project.
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
                    <Textarea placeholder="Definition description" {...field} />
                  </FormControl>
                  <FormDescription>
                    Provide a description of your new definition so others can
                    understand the role it plays in your Project.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {schemaPreset ? (
              <>
                <div className="space-y-2">
                  <FormLabel>Columns</FormLabel>
                  <DefColumns columns={schemaPreset.columns} />
                </div>
                {schemaPreset.tableConstraints && (
                  <div className="space-y-2">
                    <FormLabel>Constraints</FormLabel>
                    <DefConstraints
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
                      <Columns columns={columnFields} form={form} {...field} />
                    </FormControl>
                    <FormDescription>
                      Specify at least one column for your definition.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}
            <FormRootMessage />
            <Button
              type="submit"
              disabled={newDef.isPending || !nameAvailableQuery.data}
            >
              {newDef.isPending && (
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
