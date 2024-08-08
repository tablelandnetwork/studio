import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { type z } from "zod";
import { skipToken } from "@tanstack/react-query";
import { type schema } from "@tableland/studio-store";
import { envNameSchema } from "@tableland/studio-validators";
import { FormRootMessage } from "@/components/form";
import InputWithCheck from "@/components/input-with-check";
import { Button } from "@/components/ui/button";
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
import { api } from "@/trpc/react";

export interface NewEnvFormProps {
  projectId: string;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  trigger?: React.ReactNode;
  onSuccess: (env: schema.Environment) => void;
}

export default function NewEnvForm({
  projectId,
  open,
  onOpenChange,
  trigger,
  onSuccess,
}: NewEnvFormProps) {
  const [openSheet, setOpenSheet] = useState(open ?? false);
  const [envName, setEnvName] = useState("");

  const form = useForm<z.infer<typeof envNameSchema>>({
    resolver: zodResolver(envNameSchema),
    defaultValues: {
      name: "",
    },
  });

  useEffect(() => {
    if (!openSheet) {
      setEnvName("");
      form.reset();
    }
    onOpenChange?.(openSheet);
  }, [openSheet, onOpenChange, form]);

  useEffect(() => {
    setOpenSheet(open ?? false);
  }, [open]);

  const nameAvailableQuery = api.environments.nameAvailable.useQuery(
    envName ? { projectId, name: envName } : skipToken,
    { retry: false },
  );

  const newEnv = api.environments.newEnvironment.useMutation({
    onSuccess: (env) => {
      setOpenSheet(false);
      onSuccess(env);
    },
    onError: (err) => {
      setError("root", { message: err.message });
    },
  });

  const { setError } = form;

  function onSubmit(values: z.infer<typeof envNameSchema>) {
    newEnv.mutate({ projectId, ...values });
  }

  return (
    <Sheet open={openSheet} onOpenChange={setOpenSheet}>
      {trigger && <SheetTrigger asChild>{trigger}</SheetTrigger>}
      <SheetContent
        className="overflow-scroll sm:max-w-xl"
        closeDisabled={newEnv.isPending}
        onPointerDownOutside={
          newEnv.isPending ? (e) => e.preventDefault() : undefined
        }
        onEscapeKeyDown={
          newEnv.isPending ? (e) => e.preventDefault() : undefined
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
              <SheetTitle>New Environment</SheetTitle>
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
                      placeholder="Environment name"
                      updateQuery={setEnvName}
                      queryStatus={nameAvailableQuery}
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    Environment name must be unique within your project.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormRootMessage />
            <Button
              type="submit"
              disabled={newEnv.isPending || !nameAvailableQuery.data}
            >
              {newEnv.isPending && (
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
