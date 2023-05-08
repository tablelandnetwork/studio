import { DialogProps } from "@radix-ui/react-dialog";
import { useSetAtom } from "jotai";
import { Loader2 } from "lucide-react";
import { useRouter } from "next/router";
import React from "react";

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
import { Textarea } from "@/components/ui/textarea";
import { Project } from "@/db/schema";
import { newTableAtom } from "@/store/tables";

interface Props extends DialogProps {
  project: Project;
}

export default function NewTableDialog({ project, children, ...props }: Props) {
  const [newTableName, setNewTableName] = React.useState("");
  const [newTableSchema, setNewTableSchema] = React.useState("");
  const [newTableDescription, setNewTableDescription] = React.useState("");
  const newTable = useSetAtom(newTableAtom);
  const [creatingTable, setCreatingTable] = React.useState(false);
  const [error, setError] = React.useState("");
  const router = useRouter();

  const handleNewTable = async () => {
    if (!newTableName.length) return;
    setError("");
    setCreatingTable(true);
    try {
      const Table = await newTable([
        {
          projectId: project.id,
          name: newTableName,
          description: newTableDescription.length
            ? newTableDescription
            : undefined,
          schema: newTableSchema,
        },
      ]);
      setCreatingTable(false);
      setNewTableName("");
      setNewTableDescription("");
      setNewTableSchema("");
      if (props.onOpenChange) {
        props.onOpenChange(false);
      }
      // TODO: Maybe restore below and add route for individual tables?
      // router.push(`/${team.slug}/${Table.slug}`);
    } catch (err: any) {
      // TODO: Figure out how to handle this error from tRPC.
      setError("There was an error creating your Table.");
      setCreatingTable(false);
    }
  };

  const handleCancel = () => {
    setCreatingTable(false);
    setNewTableName("");
    setNewTableDescription("");
    setError("");
    if (props.onOpenChange) {
      props.onOpenChange(false);
    }
  };

  return (
    <Dialog {...props}>
      {children}
      <DialogContent>
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
              <Label htmlFor="message">Description</Label>
              <Textarea
                placeholder="Type your Table description here."
                id="description"
                value={newTableDescription}
                onChange={(e) => setNewTableDescription(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="message">Schema</Label>
              <Textarea
                placeholder="Type your schema here."
                id="schema"
                value={newTableSchema}
                onChange={(e) => setNewTableSchema(e.target.value)}
              />
            </div>
          </div>
          {!!error && <p>{error}</p>}
        </div>
        <DialogFooter>
          <Button
            variant="outline"
            onClick={handleCancel}
            disabled={creatingTable}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            onClick={handleNewTable}
            disabled={creatingTable}
          >
            {creatingTable && <Loader2 className="mr-2 h-5 w-5 animate-spin" />}
            Submit
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
