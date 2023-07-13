"use client";

import { Button } from "@/components/ui/button";
import { Team } from "@/db/schema";
import { DialogProps } from "@radix-ui/react-dialog";
import React from "react";
import NewProjectDialog from "./new-project-dialog";

interface Props extends DialogProps {
  team: Team;
}

export default function NewProjectButton({ team, ...props }: Props) {
  const [showNewProjectDialog, setShowNewProjectDialog] = React.useState(false);

  return (
    <NewProjectDialog
      team={team}
      open={showNewProjectDialog}
      onOpenChange={setShowNewProjectDialog}
    >
      <Button className="w-28" onClick={() => setShowNewProjectDialog(true)}>
        New project
      </Button>
    </NewProjectDialog>
  );
}
