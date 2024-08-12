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
import OrgSwitcher from "./org-switcher";
import ProjectSwitcher from "./project-switcher";
import EnvSwitcher from "./env-switcher";
import ChainSelector from "@/components/chain-selector";
import { FormRootMessage } from "@/components/form";
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
  orgPreset?: schema.Org;
  projectPreset?: schema.Project;
  envPreset?: schema.Environment;
  chainIdPreset?: number;
  tableIdPreset?: string;
  descriptionPreset?: string;
  defId?: string;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  trigger?: React.ReactNode;
  onSuccess: (
    org: schema.Org,
    project: schema.Project,
    def: schema.Def,
    environment: schema.Environment,
    deployment: schema.Deployment,
  ) => void;
}

export default function ImportTableForm({
  orgPreset,
  projectPreset,
  envPreset,
  chainIdPreset,
  tableIdPreset,
  descriptionPreset,
  defId,
  open,
  onOpenChange,
  trigger,
  onSuccess,
}: ImportTableFormProps) {
  const [org, setOrg] = useState<schema.Org | undefined>(orgPreset);
  const [project, setProject] = useState<schema.Project | undefined>(
    projectPreset,
  );
  const [env, setEnv] = useState<schema.Environment | undefined>(envPreset);
  const [defName, setDefName] = useState("");

  const { data: orgs } = api.orgs.userOrgs.useQuery(
    !orgPreset ? undefined : skipToken,
  );
  const { data: projects } = api.projects.orgProjects.useQuery(
    !projectPreset && org ? { orgId: org.id } : skipToken,
  );
  const { data: envs } = api.environments.projectEnvironments.useQuery(
    !envPreset && project ? { projectId: project.id } : skipToken,
  );

  const form = useForm<z.infer<typeof importTableSchema>>({
    resolver: zodResolver(importTableSchema),
    defaultValues: {
      chainId: chainIdPreset ?? 0,
      tableId: tableIdPreset ?? "",
      def: defId ?? { name: "", description: descriptionPreset ?? "" },
      environmentId: envPreset?.id ?? "",
    },
  });

  const { handleSubmit, control, setValue, setError, watch, reset } = form;

  useEffect(() => {
    reset({
      chainId: chainIdPreset ?? 0,
      tableId: tableIdPreset ?? "",
      def: defId ?? { name: "", description: descriptionPreset ?? "" },
      environmentId: envPreset?.id ?? "",
    });
  }, [
    chainIdPreset,
    tableIdPreset,
    descriptionPreset,
    defId,
    envPreset,
    reset,
  ]);

  useEffect(() => {
    setOrg(orgPreset);
    setProject(projectPreset);
    setEnv(envPreset);
  }, [envPreset, projectPreset, orgPreset]);

  const chainId = watch("chainId");
  const tableId = watch("tableId");

  useEffect(() => {
    if (!open) {
      setOrg(orgPreset);
      setProject(projectPreset);
      setEnv(envPreset);
      form.reset();
    }
  }, [open, orgPreset, projectPreset, envPreset, form]);

  useEffect(() => {
    if (defId) return;
    if (!(!!chainId && !!tableId)) {
      setValue("def", { name: "", description: descriptionPreset ?? "" });
      return;
    }
    const validator = new Validator({ baseUrl: helpers.getBaseUrl(chainId) });
    validator
      .getTableById({ chainId, tableId })
      .then((table) => {
        const prefix = tablePrefix(table.name);
        setValue("def.name", prefix);
        setDefName(prefix);
      })
      .catch((_) => {
        setValue("def.name", "");
      });
  }, [chainId, tableId, descriptionPreset, defId, setValue]);

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
      if (!org || !project || !env) return;
      onSuccess(org, project, def, env, deployment);
      onOpenChange?.(false);
    },
  });

  const handleOrgSelected = (org: schema.Org) => {
    setOrg(org);
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
    <Sheet open={open} onOpenChange={onOpenChange}>
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
            {!orgPreset && (
              <div className="space-y-2">
                <FormLabel>Org</FormLabel>
                <OrgSwitcher
                  variant="select"
                  orgs={orgs}
                  selectedOrg={org}
                  onOrgSelected={handleOrgSelected}
                />
              </div>
            )}
            {!projectPreset && (
              <div className="space-y-2">
                <FormLabel>Project</FormLabel>
                <ProjectSwitcher
                  variant="select"
                  org={org}
                  projects={projects}
                  selectedProject={project}
                  onProjectSelected={setProject}
                  disabled={!org}
                />
              </div>
            )}
            {!envPreset && (
              <div className="space-y-2">
                <FormLabel>Environment</FormLabel>
                <EnvSwitcher
                  variant="select"
                  org={org}
                  project={project}
                  envs={envs}
                  selectedEnv={env}
                  onEnvSelected={(env) => {
                    setValue("environmentId", env.id);
                    setEnv(env);
                  }}
                  disabled={!project}
                />
              </div>
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
            {!defId && (
              <>
                <FormField
                  control={control}
                  name="def.name"
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
                        The name of the definition to create in your Studio
                        project. This name must be unique within your project.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={control}
                  name="def.description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Description</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Definition description"
                          {...field}
                        />
                      </FormControl>
                      <FormDescription>
                        Provide a description for the imported table so others
                        can understand the role it plays in your project.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </>
            )}
            <FormRootMessage />
            <Button
              type="submit"
              disabled={
                importTable.isPending || (!defId && !nameAvailableQuery.data)
              }
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
