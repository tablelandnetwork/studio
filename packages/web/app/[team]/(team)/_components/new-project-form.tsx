import { zodResolver } from "@hookform/resolvers/zod";
import { slugify, type schema } from "@tableland/studio-store";
import { Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import { /* useFieldArray, */ useForm } from "react-hook-form";
import * as z from "zod";
import { skipToken } from "@tanstack/react-query";
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
import { FormRootMessage } from "@/components/form-root";
import { restrictedProjectSlugs } from "@/lib/restricted-slugs";

const formSchema = z.object({
  name: z
    .string()
    .trim()
    .min(3)
    .refine((name) => !restrictedProjectSlugs.includes(slugify(name)), {
      message: "You can't use a restricted word as a project name.",
    }),
  description: z.string().trim().nonempty().max(1024),
  environments: z.array(z.object({ name: z.string().trim().min(3) })),
});

export interface NewProjectFormProps {
  team: schema.Team;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  trigger?: React.ReactNode;
  onSuccess: (project: schema.Project) => void;
}

export default function NewProjectForm({
  team,
  open,
  onOpenChange,
  trigger,
  onSuccess,
}: NewProjectFormProps) {
  const [openSheet, setOpenSheet] = useState(open ?? false);
  const [projectName, setProjectName] = useState("");
  const [nameAvailable, setNameAvailable] = useState<boolean | undefined>();

  const nameAvailableQuery = api.projects.nameAvailable.useQuery(
    projectName ? { teamId: team.id, name: projectName } : skipToken,
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

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      description: "",
      environments: [],
    },
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

  const { setError } = form;

  // const { fields, append, remove } = useFieldArray(
  //   {
  //     control,
  //     name: "environments",
  //   },
  // );

  function onSubmit(values: z.infer<typeof formSchema>) {
    newProject.mutate({
      teamId: team.id,
      name: values.name,
      description: values.description,
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
                      onResult={setNameAvailable}
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    Project name must be unique within your team and at least
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
            {/* <div>
          <FormItem>
            <FormLabel>Environments</FormLabel>
            <FormDescription className="pb-2">
              Environments provide logical groupings of tables you can use
              however you&apos;d like. Optionally add environments here now, or
              add them later in your Project&apos;s settings.
            </FormDescription>
          </FormItem>
          {fields.map((env, index) => (
            <FormField
              control={form.control}
              name={`environments.${index}.name`}
              key={env.id}
              render={({ field }) => (
                <FormItem className="pb-3">
                  <FormControl key={index}>
                    <div className="flex gap-2">
                      <Input
                        {...form.register(`environments.${index}.name`)}
                        placeholder="Environment name"
                      />
                      <Button
                        className="hidden"
                        onClick={(e) => {
                          e.preventDefault();
                          append(
                            { name: "" },
                            {
                              shouldFocus: true,
                            },
                          );
                        }}
                      />
                      <Button
                        variant="ghost"
                        type="button"
                        className="px-0"
                        size="sm"
                        onClick={() => remove(index)}
                      >
                        <X />
                      </Button>
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
            disabled={pending}
            onClick={(e) => {
              e.preventDefault();
              append({ name: "" });
            }}
          >
            <Plus className="mr-2 h-5 w-5" />
            Add Environment
          </Button>
        </div> */}
            <FormRootMessage />
            <Button
              type="submit"
              disabled={newProject.isPending || !nameAvailable}
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
