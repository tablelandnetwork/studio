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
  org,
  ...props
}: Omit<ButtonProps, "onClick"> & { org: schema.Org }) {
  const router = useRouter();
  const logout = api.auth.logout.useMutation();
  const setAuth = useSetAtom(authAtom);

  const deleteOrg = api.orgs.deleteOrg.useMutation({
    onSuccess: async () => {
      router.replace("/");
      if (org.personal) {
        await logout.mutateAsync();
        setAuth(undefined);
      }
      router.refresh();
    },
  });

  const handleClick = () => {
    deleteOrg.mutate({ orgId: org.id });
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="secondary" {...props}>
          Delete org
        </Button>
      </DialogTrigger>
      <DialogContent
        closeDisabled={deleteOrg.isPending}
        onPointerDownOutside={
          deleteOrg.isPending ? (e) => e.preventDefault() : undefined
        }
        onEscapeKeyDown={
          deleteOrg.isPending ? (e) => e.preventDefault() : undefined
        }
      >
        <DialogHeader>
          <DialogTitle>Are you absolutely sure?</DialogTitle>
          <DialogDescription>
            This action cannot be undone. All data related to this org will be
            deleted from Studio&apos;s database. This includes all projects,
            table definitions, and table metadata. Any tables that were created
            on Tableland by this org will continue to exist, but Studio will not
            be aware of them.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <DialogClose asChild>
            <Button
              type="button"
              variant="outline"
              disabled={deleteOrg.isPending}
            >
              Cancel
            </Button>
          </DialogClose>
          <Button
            variant="destructive"
            onClick={handleClick}
            disabled={deleteOrg.isPending}
          >
            {deleteOrg.isPending && (
              <Loader2 className="mr-2 h-5 w-5 animate-spin" />
            )}
            Yes, delete org
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
