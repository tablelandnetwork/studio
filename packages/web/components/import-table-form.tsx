import { zodResolver } from "@hookform/resolvers/zod";
import { type schema } from "@tableland/studio-store";
import { Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { type z } from "zod";
import { skipToken } from "@tanstack/react-query";
import { importTableSchema } from "@tableland/studio-validators";
import { Validator, helpers } from "@tableland/sdk";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "./ui/sheet";
import TeamSwitcher from "./team-switcher";
import ProjectSwitcher from "./project-switcher";
import ChainSelector from "@/components/chain-selector";
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
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { api } from "@/trpc/react";
import { tablePrefix } from "@/lib/table-prefix";

export interface ImportTableFormProps {
  teamPreset?: schema.Team;
  projectPreset?: schema.Project;
  envPreset?: schema.Environment;
  showSelectors?: boolean;
  chainIdPreset?: number;
  tableIdPreset?: string;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  trigger?: React.ReactNode;
  onSuccess: (
    team: schema.Team,
    project: schema.Project,
    def: schema.Def,
    environment: schema.Environment,
    deployment: schema.Deployment,
  ) => void;
}

export default function ImportTableForm({
  teamPreset,
  projectPreset,
  envPreset,
  showSelectors,
  chainIdPreset,
  tableIdPreset,
  open,
  onOpenChange,
  trigger,
  onSuccess,
}: ImportTableFormProps) {
  const [openSheet, setOpenSheet] = useState(open ?? false);
  const [team, setTeam] = useState<schema.Team | undefined>(teamPreset);
  const [project, setProject] = useState<schema.Project | undefined>(
    projectPreset,
  );
  const [env, setEnv] = useState<schema.Environment | undefined>(envPreset);
  const [defName, setDefName] = useState("");

  const { data: teams } = api.teams.userTeams.useQuery(
    !teamPreset ? undefined : skipToken,
  );
  const { data: projects } = api.projects.teamProjects.useQuery(
    !projectPreset && team ? { teamId: team.id } : skipToken,
  );
  const { data: envs } = api.environments.projectEnvironments.useQuery(
    !envPreset && project ? { projectId: project.id } : skipToken,
  );

  const form = useForm<z.infer<typeof importTableSchema>>({
    resolver: zodResolver(importTableSchema),
    defaultValues: {
      chainId: chainIdPreset ?? 0,
      tableId: tableIdPreset ?? "",
      defName: "",
      defDescription: undefined,
      environmentId: envPreset?.id ?? "",
    },
  });

  const { handleSubmit, control, register, setValue, setError, watch } = form;

  const chainId = watch("chainId");
  const tableId = watch("tableId");

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

  // TODO: Display UI to choose environment.
  useEffect(() => {
    const env = envs?.[0];
    if (!env) return;
    setValue("environmentId", env.id);
    setEnv(env);
  }, [envs, setValue]);

  useEffect(() => {
    if (!(!!chainId && !!tableId)) {
      setValue("defName", "");
      return;
    }
    const validator = new Validator({ baseUrl: helpers.getBaseUrl(chainId) });
    validator
      .getTableById({ chainId, tableId })
      .then((table) => {
        const prefix = tablePrefix(table.name);
        setValue("defName", prefix);
        setDefName(prefix);
      })
      .catch((_) => {
        setValue("defName", "");
      });
  }, [chainId, tableId, setValue]);

  const nameAvailableQuery = api.defs.nameAvailable.useQuery(
    project && defName
      ? {
          projectId: project.id,
          name: defName,
        }
      : skipToken,
    { retry: false },
  );

  const importTable = api.tables.importTable.useMutation({
    onSuccess: ({ def, deployment }) => {
      if (!team || !project || !env) return;
      onSuccess(team, project, def, env, deployment);
      setOpenSheet(false);
    },
  });

  const handleTeamSelected = (team: schema.Team) => {
    setTeam(team);
    setProject(undefined);
  };

  function onSubmit(values: z.infer<typeof importTableSchema>) {
    if (!project) return;
    importTable.mutate(
      {
        projectId: project.id,
        ...values,
      },
      {
        onError: (err) => {
          setError("root", { message: err.message });
        },
      },
    );
  }

  return (
    <Sheet open={openSheet} onOpenChange={setOpenSheet}>
      {trigger && <SheetTrigger asChild>{trigger}</SheetTrigger>}
      <SheetContent
        className="overflow-scroll sm:max-w-xl"
        closeDisabled={importTable.isPending}
        onPointerDownOutside={
          importTable.isPending ? (e) => e.preventDefault() : undefined
        }
        onEscapeKeyDown={
          importTable.isPending ? (e) => e.preventDefault() : undefined
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
              <SheetTitle>Import Table</SheetTitle>
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
                    variant="select"
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
              name="chainId"
              render={({ field }) => {
                const { value, ...rest } = field;
                return (
                  <FormItem>
                    <FormLabel>Chain ID</FormLabel>
                    <FormControl>
                      <ChainSelector
                        onValueChange={(val) => {
                          if (typeof val === "number") {
                            setValue("chainId", val);
                          }
                        }}
                        value={value ? `${value}` : ""}
                        disabled={!!chainIdPreset}
                        {...rest}
                      />
                    </FormControl>
                    <FormDescription>
                      The chain ID where the existing Tableland table
                      exists.&nbsp;
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
                );
              }}
            />
            <FormField
              control={control}
              name="tableId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Table ID</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="eg. 345"
                      disabled={!!tableIdPreset}
                      {...field}
                    />
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
              name="defName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Definition name</FormLabel>
                  <FormControl>
                    <InputWithCheck
                      disabled={!project}
                      placeholder="eg. users"
                      updateQuery={setDefName}
                      queryStatus={nameAvailableQuery}
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    The name of the definition to create in your Studio project.
                    This name must be unique within your project.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={control}
              name="defDescription"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Definition description" {...field} />
                  </FormControl>
                  <FormDescription>
                    Provide a description for the imported table so others can
                    understand the role it plays in your project.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={control}
              name="environmentId"
              render={({ field }) => (
                <Input
                  type="hidden"
                  {...field}
                  {...register("environmentId")}
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
            <FormRootMessage />
            <Button
              type="submit"
              disabled={importTable.isPending || !nameAvailableQuery.data}
            >
              {importTable.isPending && (
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
              )}
              Import
            </Button>
          </form>
        </Form>
      </SheetContent>
    </Sheet>
  );
}
