import { zodResolver } from "@hookform/resolvers/zod";
import { type Schema, type schema } from "@tableland/studio-store";
import { Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { type z } from "zod";
import { skipToken } from "@tanstack/react-query";
import { updateDefFormSchema } from "@tableland/studio-validators";
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
import { ensureError } from "@/lib/ensure-error";

export interface EditDefProps {
  projectId: string;
  def: {
    id: string;
    name: string;
    description: string;
    schema: Schema;
  };
  onPendingChanged: (pending: boolean) => void;
  onEditDefSuccess: (def: schema.Def) => void;
  disabled?: boolean;
}

export default function EditDef({
  projectId,
  def,
  onPendingChanged,
  onEditDefSuccess,
  disabled = false,
}: EditDefProps) {
  const [query, setQuery] = useState(def.name);

  const form = useForm<z.infer<typeof updateDefFormSchema>>({
    resolver: zodResolver(updateDefFormSchema),
    defaultValues: {
      name: def.name,
      description: def.description,
    },
  });

  useEffect(() => {
    form.reset({ name: def.name, description: def.description });
  }, [def, form]);

  const { handleSubmit, control, setError } = form;

  const nameAvailableQuery = api.defs.nameAvailable.useQuery(
    query !== def.name ? { projectId, name: query, defId: def.id } : skipToken,
    { retry: false },
  );

  const updateDef = api.defs.updateDef.useMutation({
    onMutate: () => {
      onPendingChanged(true);
    },
    onSettled: () => {
      onPendingChanged(false);
    },
    onSuccess: (def) => {
      onEditDefSuccess(def);
    },
    onError: (err: any) => {
      const error = ensureError(err);
      setError("root", { message: error.message });
    },
  });

  function onSubmit(values: z.infer<typeof updateDefFormSchema>) {
    updateDef.mutate({
      defId: def.id,
      name: form.formState.dirtyFields.name ? values.name : undefined,
      description: form.formState.dirtyFields.description
        ? values.description
        : undefined,
    });
  }

  const onReset = () => {
    setQuery(def.name);
    form.reset();
  };

  return (
    <Form {...form}>
      <form
        // TODO: `handleSubmit` creates a floating promise, as a result the linter is complaining
        //    we should figure out if this is ok or not and either change this or the lint config
        // eslint-disable-next-line @typescript-eslint/no-misused-promises
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
                  placeholder="Definition name"
                  updateQuery={setQuery}
                  queryStatus={nameAvailableQuery}
                  disabled={disabled || updateDef.isPending}
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
                <Textarea
                  placeholder="Definition description"
                  {...field}
                  disabled={updateDef.isPending || disabled}
                />
              </FormControl>
              <FormDescription>
                Provide a description of your new definition so others can
                understand the role it plays in your Project.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormRootMessage />
        <div className="flex gap-4">
          <Button
            variant="outline"
            type="reset"
            onClick={onReset}
            disabled={
              !form.formState.isDirty || updateDef.isPending || disabled
            }
          >
            Reset
          </Button>
          <Button
            type="submit"
            disabled={
              disabled ||
              !form.formState.isDirty ||
              (!!form.formState.dirtyFields.name && !nameAvailableQuery.data) ||
              updateDef.isPending
            }
          >
            {updateDef.isPending && (
              <Loader2 className="mr-2 h-5 w-5 animate-spin" />
            )}
            Submit
          </Button>
        </div>
      </form>
    </Form>
  );
}
