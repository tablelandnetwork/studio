import { useEffect, useState } from "react";
import { type z } from "zod";
import { type schema } from "@tableland/studio-store";
import { type newTeamSchema } from "@tableland/studio-validators";
import TeamForm from "./team-form";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { api } from "@/trpc/react";

export interface NewTeamSheetProps {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  trigger?: React.ReactNode;
  onSuccess: (team: schema.Team) => void;
}

export default function NewTeamSheet({
  open,
  onOpenChange,
  trigger,
  onSuccess,
}: NewTeamSheetProps) {
  const [openSheet, setOpenSheet] = useState(open ?? false);

  useEffect(() => {
    onOpenChange?.(openSheet);
  }, [openSheet, onOpenChange]);

  useEffect(() => {
    setOpenSheet(open ?? false);
  }, [open]);

  const newTeam = api.teams.newTeam.useMutation({
    onSuccess: (team) => {
      setOpenSheet(false);
      onSuccess(team);
    },
  });

  function onSubmit(values: z.infer<typeof newTeamSchema>) {
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
        <SheetHeader className="mb-4">
          <SheetTitle>New Team</SheetTitle>
          {/* <SheetDescription>
                This action cannot be undone. This will permanently delete your
                account and remove your data from our servers.
              </SheetDescription> */}
        </SheetHeader>
        <TeamForm
          isPending={newTeam.isPending}
          error={newTeam.error?.message}
          onSubmit={onSubmit}
        />
      </SheetContent>
    </Sheet>
  );
}
