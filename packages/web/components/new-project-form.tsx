import { zodResolver } from "@hookform/resolvers/zod";
import { type schema } from "@tableland/studio-store";
import { Loader2, Plus, X } from "lucide-react";
import { useEffect, useState } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { type z } from "zod";
import { skipToken } from "@tanstack/react-query";
import { newProjectSchema } from "@tableland/studio-validators";
import { Input } from "./ui/input";
import { api } from "@/trpc/react";
import { Textarea } from "@/components/ui/textarea";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import InputWithCheck from "@/components/input-with-check";
import { FormRootMessage } from "@/components/form";
import { cn } from "@/lib/utils";

export interface NewProjectFormProps {
  org: schema.Org;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  trigger?: React.ReactNode;
  onSuccess: (project: schema.Project) => void;
}

export default function NewProjectForm({
  org,
  open,
  onOpenChange,
  trigger,
  onSuccess,
}: NewProjectFormProps) {
  const [openSheet, setOpenSheet] = useState(open ?? false);
  const [projectName, setProjectName] = useState("");

  const nameAvailableQuery = api.projects.nameAvailable.useQuery(
    projectName ? { orgId: org.id, name: projectName } : skipToken,
    { retry: false },
  );

  const newProject = api.projects.newProject.useMutation({
    onSuccess: (res) => {
      setOpenSheet(false);
      onSuccess(res);
    },
    onError: (err) => {
      setError("root", { message: err.message });
    },
  });

  const form = useForm<z.infer<typeof newProjectSchema>>({
    resolver: zodResolver(newProjectSchema),
    defaultValues: {
      name: "",
      description: "",
      nativeMode: false,
      envNames: [{ name: "default" }],
    },
  });

  const { setError, control, register, watch } = form;

  const envsCount = watch("envNames").length;

  const {
    fields: envNamesFields,
    append: appendEnvName,
    remove: removeEnvName,
  } = useFieldArray({
    control,
    name: "envNames",
  });

  useEffect(() => {
    if (!openSheet) {
      setProjectName("");
      form.reset();
    }
    onOpenChange?.(openSheet);
  }, [openSheet, onOpenChange, form]);

  useEffect(() => {
    setOpenSheet(open ?? false);
  }, [open]);

  function onSubmit(values: z.infer<typeof newProjectSchema>) {
    newProject.mutate({
      orgId: org.id,
      ...values,
    });
  }

  return (
    <Sheet open={openSheet} onOpenChange={setOpenSheet}>
      {trigger && <SheetTrigger asChild>{trigger}</SheetTrigger>}
      <SheetContent
        className="overflow-scroll sm:max-w-xl"
        closeDisabled={newProject.isPending}
        onPointerDownOutside={
          newProject.isPending ? (e) => e.preventDefault() : undefined
        }
        onEscapeKeyDown={
          newProject.isPending ? (e) => e.preventDefault() : undefined
        }
      >
        <Form {...form}>
          <form
            // TODO: `form.handleSubmit` creates a floating promise, as a result the linter is complaining
            //    we should figure out if this is ok or not and either change this or the lint config
            // eslint-disable-next-line @typescript-eslint/no-misused-promises
            onSubmit={form.handleSubmit(onSubmit)}
            className="mx-auto max-w-lg space-y-8"
          >
            <SheetHeader>
              <SheetTitle>New Project</SheetTitle>
              {/* <SheetDescription>
                This action cannot be undone. This will permanently delete your
                account and remove your data from our servers.
              </SheetDescription> */}
            </SheetHeader>
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Name</FormLabel>
                  <FormControl>
                    <InputWithCheck
                      placeholder="Project name"
                      updateQuery={setProjectName}
                      queryStatus={nameAvailableQuery}
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    Project name must be unique within your org and at least
                    three characters long.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Project description" {...field} />
                  </FormControl>
                  <FormDescription>
                    Provide a description of your Project so others can
                    understand what you&apos;re up to.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div>
              {envNamesFields.map((envName, index) => (
                <FormField
                  key={envName.id}
                  control={control}
                  name={`envNames.${index}.name`}
                  render={({ field, formState }) => (
                    <FormItem>
                      <FormLabel className={cn(index !== 0 && "sr-only")}>
                        Environments
                      </FormLabel>
                      <FormDescription className={cn(index !== 0 && "sr-only")}>
                        Environments are logical groups of definitions. You
                        could, for example, use them to create
                        &quot;staging&quot; and &quot;production&quot; groups of
                        definitions. All of your project&apos;s definitions are
                        available in each environment, but you can deploy those
                        definitions to Tableland separately per environment.
                        Your project must have at least one environment.
                      </FormDescription>
                      <FormControl>
                        <div className="flex items-center gap-2">
                          <Input
                            placeholder="Environment name"
                            {...register(`envNames.${index}.name`)}
                            {...field}
                          />
                          {envsCount > 1 && (
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              onClick={() => removeEnvName(index)}
                            >
                              <X />
                            </Button>
                          )}
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              ))}
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="mt-2"
                onClick={() => appendEnvName({ name: "" })}
              >
                <Plus className="mr-2 size-5" />
                Add Environment
              </Button>
            </div>
            <FormRootMessage />
            <Button
              type="submit"
              disabled={newProject.isPending || !nameAvailableQuery.data}
            >
              {newProject.isPending && (
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
