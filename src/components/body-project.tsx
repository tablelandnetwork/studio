import dynamic from "next/dynamic";

import { Project, Team } from "@/db/schema";
import { DialogProps } from "@radix-ui/react-dialog";
import React from "react";
import NewTableDialog from "./new-table-dialog";
import { Button } from "./ui/button";

const UserNav = dynamic(() => import("./nav-user").then((res) => res.UserNav), {
  ssr: false,
});

interface TableDialogProps extends DialogProps {
  project: Project;
  team: Team;
  personalTeam: Team;
}

export default function Body(props: TableDialogProps) {
  const { project, team, personalTeam } = props;

  const [showNewTableDialog, setShowNewTableDialog] = React.useState(false);

  function handleNewTable() {
    console.log("new deployment");
  }

  return (
    <main className="sticky top-0 flex flex-col space-y-4 border-b bg-white px-4 py-3">
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-start gap-x-4">
          <NewTableDialog
            {...props}
            open={showNewTableDialog}
            onOpenChange={setShowNewTableDialog}
          >
            <Button onClick={() => setShowNewTableDialog(true)}>
              New Table
            </Button>
          </NewTableDialog>
        </div>
      </div>
    </main>
  );
}
