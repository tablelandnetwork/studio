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

export function UndeployTableDialog({
  open,
  onOpenChange,
  defId,
  envId,
  onSuccess,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  defId: string;
  envId: string;
  onSuccess: () => void;
}) {
  const undeployTable = api.deployments.deleteDeployments.useMutation({
    onSuccess,
  });

  const onUndeployTable = () => {
    undeployTable.mutate({ defId, envId });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        closeDisabled={undeployTable.isPending}
        onPointerDownOutside={
          undeployTable.isPending ? (e) => e.preventDefault() : undefined
        }
        onEscapeKeyDown={
          undeployTable.isPending ? (e) => e.preventDefault() : undefined
        }
      >
        <DialogHeader>
          <DialogTitle>Are you absolutely sure?</DialogTitle>
          <DialogDescription>
            Information related to this deployed table will be deleted from
            Studio&apos;s database. The deployed table that was created on
            Tableland will continue to exist, but Studio will not be aware of
            it. The table definition will remain in the project.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <DialogClose asChild>
            <Button
              type="button"
              variant="secondary"
              disabled={undeployTable.isPending}
            >
              Cancel
            </Button>
          </DialogClose>
          <Button
            variant="destructive"
            onClick={onUndeployTable}
            disabled={undeployTable.isPending}
          >
            {undeployTable.isPending && (
              <Loader2 className="mr-2 h-5 w-5 animate-spin" />
            )}
            Yes, un-deploy table
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
