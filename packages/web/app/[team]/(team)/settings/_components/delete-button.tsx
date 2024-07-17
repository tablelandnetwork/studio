"use client";

import { type schema } from "@tableland/studio-store";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { useSetAtom } from "jotai";
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
import { api } from "@/trpc/react";
import { Button, type ButtonProps } from "@/components/ui/button";
import { authAtom } from "@/store/auth";

export default function DeleteButton({
  team,
  ...props
}: Omit<ButtonProps, "onClick"> & { team: schema.Team }) {
  const router = useRouter();
  const logout = api.auth.logout.useMutation();
  const setAuth = useSetAtom(authAtom);

  const deleteTeam = api.teams.deleteTeam.useMutation({
    onSuccess: async () => {
      router.replace("/");
      if (team.personal) {
        await logout.mutateAsync();
        setAuth(undefined);
      }
      router.refresh();
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
            deleted from Studio&apos;s database. This includes all projects,
            table definitions, and table metadata. Any tables that were created
            on Tableland by this team will continue to exist, but Studio will
            not be aware of them.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <DialogClose asChild>
            <Button
              type="button"
              variant="outline"
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
