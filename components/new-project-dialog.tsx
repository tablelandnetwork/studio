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
import { trpc } from "@/utils/trpc";
import { DialogProps } from "@radix-ui/react-dialog";
import { Loader2 } from "lucide-react";
import { useRouter } from "next/router";
import React, { useEffect } from "react";

interface Props extends DialogProps {
  team: Team;
}

export default function NewProjectDialog({
  team,
  onOpenChange,
  children,
  ...props
}: Props) {
  const [newProjectName, setNewProjectName] = React.useState("");
  const [newProjectDescription, setNewProjectDescription] = React.useState("");

  const newProject = trpc.projects.newProject.useMutation();

  const router = useRouter();

  useEffect(() => {
    if (newProject.isSuccess) {
      router.push(`/${team.slug}/${newProject.data.slug}`);
      setNewProjectName("");
      setNewProjectDescription("");
      if (onOpenChange) {
        onOpenChange(false);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [newProject.isSuccess]);

  const handleNewProject = () => {
    if (!newProjectName.length) return;
    newProject.mutate({
      teamId: team.id,
      name: newProjectName,
      description: newProjectDescription.length
        ? newProjectDescription
        : undefined,
    });
  };

  const handleCancel = () => {
    setNewProjectName("");
    setNewProjectDescription("");
    if (onOpenChange) {
      onOpenChange(false);
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
          {!!newProject.error && (
            <p>Error creating project: {newProject.error.message}</p>
          )}
        </div>
        <DialogFooter>
          <Button
            variant="outline"
            onClick={handleCancel}
            disabled={newProject.isLoading}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            onClick={handleNewProject}
            disabled={newProject.isLoading}
          >
            {newProject.isLoading && (
              <Loader2 className="mr-2 h-5 w-5 animate-spin" />
            )}
            Submit
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
