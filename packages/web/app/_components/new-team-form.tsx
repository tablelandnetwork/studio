import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import type * as z from "zod";
import { skipToken } from "@tanstack/react-query";
import { type schema } from "@tableland/studio-store";
import { newTeamSchema } from "@tableland/studio-validators";
import { FormRootMessage } from "@/components/form-root";
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

export interface NewTeamFormProps {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  trigger?: React.ReactNode;
  onSuccess: (team: schema.Team) => void;
}

export default function NewTeamForm({
  open,
  onOpenChange,
  trigger,
  onSuccess,
}: NewTeamFormProps) {
  const [openSheet, setOpenSheet] = useState(open ?? false);
  const [teamName, setTeamName] = useState("");
  const [nameAvailable, setNameAvailable] = useState<boolean | undefined>();
  const [pendingEmail, setPendingEmail] = useState("");

  const form = useForm<z.infer<typeof newTeamSchema>>({
    resolver: zodResolver(newTeamSchema),
    defaultValues: {
      name: "",
      emailInvites: [],
    },
  });

  useEffect(() => {
    if (!openSheet) {
      setTeamName("");
      form.reset();
    }
    onOpenChange?.(openSheet);
  }, [openSheet, onOpenChange, form]);

  useEffect(() => {
    setOpenSheet(open ?? false);
  }, [open]);

  const nameAvailableQuery = api.teams.nameAvailable.useQuery(
    teamName ? { name: teamName } : skipToken,
  );

  const newTeam = api.teams.newTeam.useMutation({
    onSuccess: (team) => {
      setOpenSheet(false);
      onSuccess(team);
    },
    onError: (err) => {
      setError("root", { message: err.message });
    },
  });

  const { setError } = form;

  function onSubmit(values: z.infer<typeof newTeamSchema>) {
    if (pendingEmail) {
      values.emailInvites = [...values.emailInvites, pendingEmail];
    }
    newTeam.mutate(values);
  }

  return (
    <Sheet open={openSheet} onOpenChange={setOpenSheet}>
      {trigger && <SheetTrigger asChild>{trigger}</SheetTrigger>}
      <SheetContent
        className="overflow-scroll sm:max-w-xl"
        closeDisabled={newTeam.isPending}
        onPointerDownOutside={
          newTeam.isPending ? (e) => e.preventDefault() : undefined
        }
        onEscapeKeyDown={
          newTeam.isPending ? (e) => e.preventDefault() : undefined
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
              <SheetTitle>New Team</SheetTitle>
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
                      placeholder="Team name"
                      updateQuery={setTeamName}
                      queryStatus={nameAvailableQuery}
                      onResult={setNameAvailable}
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>Team name must be unique.</FormDescription>
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
                    to invite others to your new Team.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormRootMessage />
            <Button
              type="submit"
              disabled={newTeam.isPending || !nameAvailable}
            >
              {newTeam.isPending && (
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
