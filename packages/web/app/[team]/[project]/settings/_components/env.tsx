import { zodResolver } from "@hookform/resolvers/zod";
import { type schema } from "@tableland/studio-store";
import { Loader2, Edit, Trash } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { skipToken } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
import { api } from "@/trpc/react";
import InputWithCheck from "@/components/input-with-check";
import { cn } from "@/lib/utils";

const formSchema = z.object({
  name: z.string().trim().min(1),
});

export default function Env({
  env,
  showDelete,
  onDelete,
  disabled,
}: {
  env: schema.Environment;
  showDelete: boolean;
  onDelete: () => void;
  disabled?: boolean;
}) {
  const router = useRouter();
  const [showForm, setShowForm] = useState(false);
  const [query, setQuery] = useState(env.name);
  const nameAvailable = api.environments.nameAvailable.useQuery(
    query !== env.name
      ? { projectId: env.projectId, name: query, envId: env.id }
      : skipToken,
    { retry: false },
  );
  const updateEnv = api.environments.updateEnvironment.useMutation({
    onSuccess: () => {
      router.refresh();
      setShowForm(false);
      form.reset();
    },
  });

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: env.name,
    },
  });

  function onEdit() {
    setShowForm(true);
  }

  function onSubmit(values: z.infer<typeof formSchema>) {
    updateEnv.mutate({ envId: env.id, ...values });
  }

  function onCancel() {
    setShowForm(false);
    form.reset();
  }

  useEffect(() => {
    if (showForm) {
      form.setFocus("name", { shouldSelect: true });
    }
  }, [form, showForm]);

  return (
    <div className="group px-3 py-1 hover:bg-accent">
      {showForm ? (
        <Form {...form}>
          <form
            // TODO: `form.handleSubmit` creates a floating promise, as a result the linter is complaining
            // we should figure out if this is ok or not and either change this or the lint config
            // eslint-disable-next-line @typescript-eslint/no-misused-promises
            onSubmit={form.handleSubmit(onSubmit)}
            className="flex items-center gap-x-3"
          >
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <InputWithCheck
                      placeholder="Environment name"
                      disabled={updateEnv.isPending}
                      updateQuery={setQuery}
                      queryStatus={nameAvailable}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage className="ml-4" />
                </FormItem>
              )}
            />
            <Button
              size="sm"
              variant="secondary"
              disabled={updateEnv.isPending}
              onClick={onCancel}
              className="ml-auto"
            >
              Cancel
            </Button>
            <Button type="submit" size="sm" disabled={updateEnv.isPending}>
              {updateEnv.isPending && (
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
              )}
              Save
            </Button>
          </form>
        </Form>
      ) : (
        <div className="flex items-center">
          <p className="text-sm">{env.name}</p>
          {showDelete && (
            <Button
              variant="ghost"
              size="icon"
              onClick={onDelete}
              className="ml-auto opacity-10 group-hover:opacity-100"
              disabled={disabled}
            >
              <Trash />
            </Button>
          )}
          <Button
            variant="ghost"
            size="icon"
            onClick={onEdit}
            className={cn(
              "opacity-10 group-hover:opacity-100",
              !showDelete && "ml-auto",
            )}
            disabled={disabled}
          >
            <Edit />
          </Button>
        </div>
      )}
    </div>
  );
}
