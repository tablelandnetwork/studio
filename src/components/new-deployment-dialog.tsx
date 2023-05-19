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
import { Project, Team } from "@/db/schema";
import { NewDeploymentAtom } from "@/store/db";
import { ChainId } from "@biconomy/core-types";

interface Props extends DialogProps {
  project: Project;
  team: Team;
}

export default function NewDeploymentDialog({
  project,
  team,
  children,
  ...props
}: Props) {
  const [NewDeploymentName, setNewDeploymentName] = React.useState("");
  const [NewDeploymentSchema, setNewDeploymentSchema] = React.useState("");
  const [NewDeploymentDescription, setNewDeploymentDescription] =
    React.useState("");
  const NewDeployment = useSetAtom(NewDeploymentAtom);
  const [creatingDeployment, setCreatingDeployment] = React.useState(false);
  const [error, setError] = React.useState("");
  const router = useRouter();

  const handleNewDeployment = async () => {
    if (!NewDeploymentName.length) return;
    setError("");
    setCreatingDeployment(true);
    try {
      const deployment = await NewDeployment([
        {
          projectId: project.id,
          name: NewDeploymentName,
          description: NewDeploymentDescription.length
            ? NewDeploymentDescription
            : undefined,
          chain: ChainId.POLYGON_MUMBAI,
        },
      ]);
      setCreatingDeployment(false);
      setNewDeploymentName("");
      setNewDeploymentDescription("");
      setNewDeploymentSchema("");
      if (props.onOpenChange) {
        props.onOpenChange(false);
      }

      router.push(`/${team.slug}/${project.slug}/${deployment?.slug}`);
    } catch (err: any) {
      // TODO: Figure out how to handle this error from tRPC.
      setError("There was an error creating your Table.");
      setCreatingDeployment(false);
    }
  };

  const handleCancel = () => {
    setCreatingDeployment(false);
    setNewDeploymentName("");
    setNewDeploymentDescription("");
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
                value={NewDeploymentName}
                onChange={(e) => setNewDeploymentName(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="message">Description</Label>
              <Textarea
                placeholder="Type your Table description here."
                id="description"
                value={NewDeploymentDescription}
                onChange={(e) => setNewDeploymentDescription(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="message">Schema</Label>
              <Textarea
                placeholder="Type your schema here."
                id="schema"
                value={NewDeploymentSchema}
                onChange={(e) => setNewDeploymentSchema(e.target.value)}
              />
            </div>
          </div>
          {!!error && <p>{error}</p>}
        </div>
        <DialogFooter>
          <Button
            variant="outline"
            onClick={handleCancel}
            disabled={creatingDeployment}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            onClick={handleNewDeployment}
            disabled={creatingDeployment}
          >
            {creatingDeployment && (
              <Loader2 className="mr-2 h-5 w-5 animate-spin" />
            )}
            Submit
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
