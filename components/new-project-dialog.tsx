"use client";

import { newProject } from "@/app/actions";
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
import { Team } from "@/db/schema";
import { DialogProps } from "@radix-ui/react-dialog";
import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import React from "react";

interface Props extends DialogProps {
  team: Team;
}

export default function NewProjectDialog({ team, children, ...props }: Props) {
  const [newProjectName, setNewProjectName] = React.useState("");
  const [newProjectDescription, setNewProjectDescription] = React.useState("");
  const [isPending, startTransition] = React.useTransition();

  const router = useRouter();

  const handleNewProject = () => {
    if (!newProjectName.length) return;
    startTransition(async () => {
      const res = await newProject(
        team.id,
        newProjectName,
        newProjectDescription
      );
      router.push(`/${team.slug}/${res.slug}`);
      router.refresh();
      setNewProjectName("");
      setNewProjectDescription("");
    });
  };

  const handleCancel = () => {
    setNewProjectName("");
    setNewProjectDescription("");
    props.onOpenChange && props.onOpenChange(false);
  };

  return (
    <Dialog {...props}>
      {children}
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create a new project</DialogTitle>
          <DialogDescription>
            Name your project and eventually do some more.
          </DialogDescription>
        </DialogHeader>
        <div>
          <div className="space-y-4 py-2 pb-4">
            <div className="space-y-2">
              <Label htmlFor="name">Project Name</Label>
              <Input
                id="name"
                placeholder="Project Name"
                value={newProjectName}
                onChange={(e) => setNewProjectName(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="message">Description</Label>
              <Textarea
                placeholder="Type your project description here."
                id="description"
                value={newProjectDescription}
                onChange={(e) => setNewProjectDescription(e.target.value)}
              />
            </div>
          </div>
          {/* {!!newProject.error && (
            <p>Error creating project: {newProject.error.message}</p>
          )} */}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={handleCancel} disabled={isPending}>
            Cancel
          </Button>
          <Button type="submit" onClick={handleNewProject} disabled={isPending}>
            {isPending && <Loader2 className="mr-2 h-5 w-5 animate-spin" />}
            Submit
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
