import { Loader2 } from "lucide-react";
import { Button } from "./ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { api } from "@/trpc/react";

export function DeleteTableDialog({
  open,
  onOpenChange,
  defId,
  onSuccess,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  defId: string;
  onSuccess: () => void;
}) {
  const deleteTable = api.defs.deleteDef.useMutation({
    onSuccess,
  });

  const onDeleteTable = () => {
    deleteTable.mutate({ defId });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        closeDisabled={deleteTable.isPending}
        onPointerDownOutside={
          deleteTable.isPending ? (e) => e.preventDefault() : undefined
        }
        onEscapeKeyDown={
          deleteTable.isPending ? (e) => e.preventDefault() : undefined
        }
      >
        <DialogHeader>
          <DialogTitle>Are you absolutely sure?</DialogTitle>
          <DialogDescription>
            This action cannot be undone. All data related to this table will be
            deleted from Studio&apos;s database. Any table that was created on
            Tableland by deploying this table continue to exist, but Studio will
            not be aware of it.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <DialogClose asChild>
            <Button
              type="button"
              variant="secondary"
              disabled={deleteTable.isPending}
            >
              Cancel
            </Button>
          </DialogClose>
          <Button
            variant="destructive"
            onClick={onDeleteTable}
            disabled={deleteTable.isPending}
          >
            {deleteTable.isPending && (
              <Loader2 className="mr-2 h-5 w-5 animate-spin" />
            )}
            Yes, delete table
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
