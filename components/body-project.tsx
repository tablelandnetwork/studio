import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import Link from "next/link";

import { Project, Table, Team } from "@/db/schema";
import { DialogProps } from "@radix-ui/react-dialog";
import React from "react";
import NewTableDialog from "./new-table-dialog";
import { Button } from "./ui/button";

interface TableDialogProps extends DialogProps {
  project: Project;
  team: Team;
  tables: Table[];
}

export default function Body(props: TableDialogProps) {
  const { project, team, tables } = props;

  const [showNewTableDialog, setShowNewTableDialog] = React.useState(false);

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col space-y-4 p-4">
      <div className="flex w-full max-w-3xl flex-col space-y-4">
        {tables.map((table) => (
          <Link
            key={table.id}
            href={`/${team.slug}/${project.slug}/${table.name}`}
          >
            <Card>
              <CardHeader>
                <CardTitle>{table.name}</CardTitle>
                <CardDescription>{table.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <p>{table.schema}</p>
              </CardContent>
              <CardFooter>
                <p>Card Footer</p>
              </CardFooter>
            </Card>
          </Link>
        ))}
      </div>
      <NewTableDialog
        {...props}
        open={showNewTableDialog}
        onOpenChange={setShowNewTableDialog}
      >
        <Button onClick={() => setShowNewTableDialog(true)}>New Table</Button>
      </NewTableDialog>
    </div>
  );
}
