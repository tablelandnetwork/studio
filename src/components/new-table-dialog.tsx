import { DialogProps } from "@radix-ui/react-dialog";
import { Loader2 } from "lucide-react";
import { useRouter } from "next/router";
import React, { useEffect } from "react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Project, Team } from "@/db/schema";
import { trpc } from "@/utils/trpc";
import SchemaBuilder from "./schema-builder";

interface Props extends DialogProps {
  project: Project;
  team: Team;
}

export default function NewTableDialog({
  project,
  team,
  children,
  ...props
}: Props) {
  const [newTableName, setNewTableName] = React.useState("");
  const [newTableSchema, setNewTableSchema] = React.useState("");
  const [newTableDescription, setNewTableDescription] = React.useState("");

  function createNewTableSchema() {}

  const newTable = trpc.tables.newTable.useMutation();

  const router = useRouter();

  useEffect(() => {
    if (newTable.isSuccess) {
      // TODO: Route to new table page, if it comes to exist
      router.replace(router.asPath);
      setNewTableName("");
      setNewTableDescription("");
      setNewTableSchema("");
      if (props.onOpenChange) {
        props.onOpenChange(false);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [newTable.isSuccess]);

  const handleNewTable = () => {
    if (!newTableName.length) return;
    newTable.mutate({
      projectId: project.id,
      name: newTableName,
      description: newTableDescription.length ? newTableDescription : undefined,
      schema: newTableSchema,
    });
  };

  const handleCancel = () => {
    setNewTableName("");
    setNewTableDescription("");
    setNewTableSchema("");
    if (props.onOpenChange) {
      props.onOpenChange(false);
    }
  };

  return (
    <Dialog {...props}>
      {children}
      <DialogContent className="sm:max-w-[40rem]">
        <DialogHeader>
          <DialogTitle>Create a new table</DialogTitle>
          <DialogDescription>
            Name your table and eventually do some more.
          </DialogDescription>
        </DialogHeader>
        <div>
          <div className="space-y-4 py-2 pb-4">
            <div className="space-y-2">
              <Label htmlFor="name">Table Name</Label>
              <Input
                id="name"
                placeholder="Table Name"
                value={newTableName}
                onChange={(e) => setNewTableName(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="message">Schema</Label>
              <SchemaBuilder />
            </div>
          </div>
          {newTable.isError && (
            <p>Error creating table: {newTable.error.message}</p>
          )}
        </div>
        <DialogFooter>
          <Button
            variant="outline"
            onClick={handleCancel}
            disabled={newTable.isLoading}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            onClick={handleNewTable}
            disabled={newTable.isLoading}
          >
            {newTable.isLoading && (
              <Loader2 className="mr-2 h-5 w-5 animate-spin" />
            )}
            Submit
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
