import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { type z } from "zod";
import { skipToken } from "@tanstack/react-query";
import { type schema } from "@tableland/studio-store";
import { newOrgSchema } from "@tableland/studio-validators";
import { FormRootMessage } from "@/components/form";
import InputWithCheck from "@/components/input-with-check";
import TagInput from "@/components/tag-input";
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

export interface NewOrgFormProps {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  trigger?: React.ReactNode;
  onSuccess: (org: schema.Org) => void;
}

export default function NewOrgForm({
  open,
  onOpenChange,
  trigger,
  onSuccess,
}: NewOrgFormProps) {
  const [openSheet, setOpenSheet] = useState(open ?? false);
  const [orgName, setOrgName] = useState("");
  const [pendingEmail, setPendingEmail] = useState("");

  const form = useForm<z.infer<typeof newOrgSchema>>({
    resolver: zodResolver(newOrgSchema),
    defaultValues: {
      name: "",
      emailInvites: [],
    },
  });

  useEffect(() => {
    if (!openSheet) {
      setOrgName("");
      form.reset();
    }
    onOpenChange?.(openSheet);
  }, [openSheet, onOpenChange, form]);

  useEffect(() => {
    setOpenSheet(open ?? false);
  }, [open]);

  const nameAvailableQuery = api.orgs.nameAvailable.useQuery(
    orgName ? { name: orgName } : skipToken,
    { retry: false },
  );

  const newOrg = api.orgs.newOrg.useMutation({
    onSuccess: (org) => {
      setOpenSheet(false);
      onSuccess(org);
    },
    onError: (err) => {
      setError("root", { message: err.message });
    },
  });

  const { setError } = form;

  function onSubmit(values: z.infer<typeof newOrgSchema>) {
    if (pendingEmail) {
      values.emailInvites = [...values.emailInvites, pendingEmail];
    }
    newOrg.mutate(values);
  }

  return (
    <Sheet open={openSheet} onOpenChange={setOpenSheet}>
      {trigger && <SheetTrigger asChild>{trigger}</SheetTrigger>}
      <SheetContent
        className="overflow-scroll sm:max-w-xl"
        closeDisabled={newOrg.isPending}
        onPointerDownOutside={
          newOrg.isPending ? (e) => e.preventDefault() : undefined
        }
        onEscapeKeyDown={
          newOrg.isPending ? (e) => e.preventDefault() : undefined
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
              <SheetTitle>New Org</SheetTitle>
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
                      placeholder="Org name"
                      updateQuery={setOrgName}
                      queryStatus={nameAvailableQuery}
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>Org name must be unique.</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="emailInvites"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Invite emails</FormLabel>
                  <FormControl>
                    <TagInput
                      id="emails"
                      placeholder="Email addresses"
                      tags={form.getValues().emailInvites}
                      setTags={(tags) => {
                        form.setValue("emailInvites", tags);
                        // form.trigger("emailInvites");
                      }}
                      pendingValue={pendingEmail}
                      setPendingValue={setPendingEmail}
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    Optionally enter a comma-separated list of email addresses
                    to invite others to your new Org.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormRootMessage />
            <Button
              type="submit"
              disabled={newOrg.isPending || !nameAvailableQuery.data}
            >
              {newOrg.isPending && (
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
