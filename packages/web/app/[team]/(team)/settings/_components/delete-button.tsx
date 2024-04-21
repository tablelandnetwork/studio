"use client";

import { Button, ButtonProps } from "@/components/ui/button";
import { api } from "@/trpc/react";
import { schema } from "@tableland/studio-store";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";

export default function DeleteButton({
  team,
  ...props
}: Omit<ButtonProps, "onClick"> & { team: schema.Team }) {
  const router = useRouter();

  const deleteTeam = api.teams.deleteTeam.useMutation({
    onSuccess: () => {
      router.refresh();
      router.replace("/");
    },
  });

  const handleClick = () => {
    deleteTeam.mutate({ teamId: team.id });
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="secondary" {...props}>
          Delete team
        </Button>
      </DialogTrigger>
      <DialogContent
        closeDisabled={deleteTeam.isPending}
        onPointerDownOutside={
          deleteTeam.isPending ? (e) => e.preventDefault() : undefined
        }
        onEscapeKeyDown={
          deleteTeam.isPending ? (e) => e.preventDefault() : undefined
        }
      >
        <DialogHeader>
          <DialogTitle>Are you absolutely sure?</DialogTitle>
          <DialogDescription>
            This action cannot be undone. All data related to this team will be
            deleted from Studio's database. This includes all projects, table
            definitions, and table metadata. Any tables that were created on
            Tableland by this team will continue to exist, but Studio will not
            be aware of them.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <DialogClose asChild>
            <Button
              type="button"
              variant="secondary"
              disabled={deleteTeam.isPending}
            >
              Cancel
            </Button>
          </DialogClose>
          <Button
            variant="destructive"
            onClick={handleClick}
            disabled={deleteTeam.isPending}
          >
            {deleteTeam.isPending && (
              <Loader2 className="mr-2 h-5 w-5 animate-spin" />
            )}
            Yes, delete team
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
