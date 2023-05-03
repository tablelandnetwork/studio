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
import { Team } from "@/db/schema";
import { newProjectAtom } from "@/store/projects";

interface Props extends DialogProps {
  team: Team;
}

export default function NewProjectDialog({ team, children, ...props }: Props) {
  const [newProjectName, setNewProjectName] = React.useState("");
  const [newProjectDescription, setNewProjectDescription] = React.useState("");
  const newProject = useSetAtom(newProjectAtom);
  const [creatingProject, setCreatingProject] = React.useState(false);
  const [error, setError] = React.useState("");
  const router = useRouter();

  const handleNewProject = async () => {
    if (!newProjectName.length) return;
    setError("");
    setCreatingProject(true);
    try {
      const project = await newProject([
        {
          teamId: team.id,
          name: newProjectName,
          description: newProjectDescription,
        },
      ]);
      setCreatingProject(false);
      setNewProjectName("");
      setNewProjectDescription("");
      if (props.onOpenChange) {
        props.onOpenChange(false);
      }
      router.push(`/${team.slug}/${project.slug}`);
    } catch (err: any) {
      // TODO: Figure out how to handle this error from tRPC.
      setError("There was an error creating your project.");
      setCreatingProject(false);
    }
  };

  const handleCancel = () => {
    setCreatingProject(false);
    setNewProjectName("");
    setNewProjectDescription("");
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
          {!!error && <p>{error}</p>}
        </div>
        <DialogFooter>
          <Button
            variant="outline"
            onClick={handleCancel}
            disabled={creatingProject}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            onClick={handleNewProject}
            disabled={creatingProject}
          >
            {creatingProject && (
              <Loader2 className="mr-2 h-5 w-5 animate-spin" />
            )}
            Submit
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
