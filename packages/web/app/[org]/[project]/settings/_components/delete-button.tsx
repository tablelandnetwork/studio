"use client";

import { type schema } from "@tableland/studio-store";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
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

export default function DeleteButton({
  org,
  project,
  ...props
}: Omit<ButtonProps, "onClick"> & {
  org: schema.Org;
  project: schema.Project;
}) {
  const router = useRouter();

  const deleteProject = api.projects.deleteProject.useMutation({
    onSuccess: async () => {
      router.replace(`/${org.slug}`);
      router.refresh();
    },
  });

  const handleClick = () => {
    deleteProject.mutate({ projectId: project.id });
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="secondary" {...props}>
          Delete project
        </Button>
      </DialogTrigger>
      <DialogContent
        closeDisabled={deleteProject.isPending}
        onPointerDownOutside={
          deleteProject.isPending ? (e) => e.preventDefault() : undefined
        }
        onEscapeKeyDown={
          deleteProject.isPending ? (e) => e.preventDefault() : undefined
        }
      >
        <DialogHeader>
          <DialogTitle>Are you absolutely sure?</DialogTitle>
          <DialogDescription>
            This action cannot be undone. All data related to this project will
            be deleted from Studio&apos;s database. This includes all table
            definitions, and table metadata. Any tables that were created on
            Tableland in this project will continue to exist, but Studio will
            not be aware of them.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <DialogClose asChild>
            <Button
              type="button"
              variant="outline"
              disabled={deleteProject.isPending}
            >
              Cancel
            </Button>
          </DialogClose>
          <Button
            variant="destructive"
            onClick={handleClick}
            disabled={deleteProject.isPending}
          >
            {deleteProject.isPending && (
              <Loader2 className="mr-2 h-5 w-5 animate-spin" />
            )}
            Yes, delete project
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
