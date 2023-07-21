"use client";

import { DialogProps } from "@radix-ui/react-dialog";
import { Loader2 } from "lucide-react";
import React from "react";

import { newTable } from "@/app/actions";
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
import { createTableAtom } from "@/store/create-table";
import { useAtom } from "jotai";
import SchemaBuilder, {
  createTableStatementFromObject,
} from "./schema-builder";

interface Props extends DialogProps {
  project: Project;
}

export default function NewTable({ project, ...props }: Props) {
  const [showNewTableDialog, setShowNewTableDialog] = React.useState(false);
  const [newTableName, setNewTableName] = React.useState("");
  const [newTableSchema, setNewTableSchema] = React.useState("");
  const [newTableDescription, setNewTableDescription] = React.useState("");
  const [isPending, startTransition] = React.useTransition();
  const [createTable, setCreateTable] = useAtom(createTableAtom);

  const handleNewTable = () => {
    const statement = createTableStatementFromObject(createTable);
    if (!statement) return;
    startTransition(async () => {
      const table = await newTable(
        project,
        newTableName,
        statement,
        newTableDescription
      );
      // TODO: Maybe restore below and add route for individual tables?
      // router.push(`/${team.slug}/${project.slug}/${table.slug}`);
      setNewTableName("");
      setNewTableDescription("");
      setShowNewTableDialog(false);
    });
  };

  const handleCancel = () => {
    setNewTableName("");
    setNewTableDescription("");
    setShowNewTableDialog(false);
  };

  return (
    <Dialog
      open={showNewTableDialog}
      onOpenChange={setShowNewTableDialog}
      {...props}
    >
      <Button onClick={() => setShowNewTableDialog(true)}>New Table</Button>
      <DialogContent className="sm:max-w-min">
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
                value={createTable.name}
                onChange={(e) => {
                  setCreateTable((prev) => ({
                    ...prev,
                    name: e.target.value,
                  }));
                }}
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
              <SchemaBuilder />
            </div>
            <div className="space-y-2">
              <pre>{createTableStatementFromObject(createTable)}</pre>
            </div>
          </div>
          {/* {newTable.isError && (
            <p>Error creating table: {newTable.error.message}</p>
          )} */}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={handleCancel} disabled={isPending}>
            Cancel
          </Button>
          <Button type="submit" onClick={handleNewTable} disabled={isPending}>
            {isPending && <Loader2 className="mr-2 h-5 w-5 animate-spin" />}
            Submit
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
