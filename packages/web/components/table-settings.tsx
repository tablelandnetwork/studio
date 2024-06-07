import { useEffect, useState } from "react";
import { OctagonAlert } from "lucide-react";
import EditDef, { type EditDefProps } from "./edit-def";
import { Button } from "./ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { cn } from "@/lib/utils";

export type TableSettingsProps = Omit<EditDefProps, "onPendingChanged"> & {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  isAdmin: boolean;
  showUndeploy: boolean;
  onDeleteTable: () => void;
  onUndeployTable: () => void;
};

export default function TableSettings({
  open,
  onOpenChange,
  isAdmin,
  showUndeploy,
  onDeleteTable,
  onUndeployTable,
  ...props
}: TableSettingsProps) {
  const [openSheet, setOpenSheet] = useState(open ?? false);
  const [updateDefPending, setUpdateDefPending] = useState(false);

  useEffect(() => {
    onOpenChange?.(openSheet);
  }, [openSheet, onOpenChange]);

  useEffect(() => {
    setOpenSheet(open ?? false);
  }, [open]);

  return (
    <Sheet open={openSheet} onOpenChange={setOpenSheet}>
      <SheetContent
        className="overflow-scroll sm:max-w-xl"
        closeDisabled={updateDefPending}
        onPointerDownOutside={
          updateDefPending ? (e) => e.preventDefault() : undefined
        }
        onEscapeKeyDown={
          updateDefPending ? (e) => e.preventDefault() : undefined
        }
      >
        <SheetHeader>
          <SheetTitle>Table settings</SheetTitle>
          {/* <SheetDescription>
                This action cannot be undone. This will permanently delete your
                account and remove your data from our servers.
              </SheetDescription> */}
        </SheetHeader>
        <div className="space-y-12 py-12">
          {!isAdmin && (
            <Alert>
              <OctagonAlert className="h-4 w-4" />
              <AlertTitle>Hold on</AlertTitle>
              <AlertDescription>
                You need to be an admin to access table settings. An existing
                admin can make this happen.
              </AlertDescription>
            </Alert>
          )}
          <Card className={cn(!isAdmin && "opacity-50")}>
            <CardHeader>
              <CardTitle>Table definition</CardTitle>
              <CardDescription>
                Update general information about the {props.def.name} table
                definition.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <EditDef
                {...props}
                disabled={!isAdmin}
                onPendingChanged={setUpdateDefPending}
              />
            </CardContent>
          </Card>
          <Card className={cn(!isAdmin && "opacity-50")}>
            <CardHeader>
              <CardTitle>Danger zone</CardTitle>
              <CardDescription>
                Think twice before doing anything here.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-8">
              <div className="space-y-2">
                <p className="text-sm font-medium">
                  Delete the {props.def.name} table from your project:
                </p>
                <Button variant="secondary" onClick={onDeleteTable}>
                  Delete table
                </Button>
              </div>
              {showUndeploy && (
                <div className="space-y-2">
                  <p className="text-sm font-medium">
                    Undeploy the {props.def.name} table:
                  </p>
                  <Button variant="secondary" onClick={onUndeployTable}>
                    Undeploy table
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </SheetContent>
    </Sheet>
  );
}
