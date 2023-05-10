import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { selectedProjectAtom } from "@/store/projects";
import { tablesFromCurrentProjectAtom } from "@/store/tables";
import { selectedTeamAtom } from "@/store/teams";
import { useAtomValue, useSetAtom } from "jotai";
import Link from "next/link";

import { Project, Team } from "@/db/schema";
import { DialogProps } from "@radix-ui/react-dialog";
import React from "react";
import NewTableDialog from "./new-table-dialog";
import { Button } from "./ui/button";

interface TableDialogProps extends DialogProps {
  project: Project;
  team: Team;
  personalTeam: Team;
}

export default function Body(props: TableDialogProps) {
  const { project, team, personalTeam } = props;

  const setSelectedTeam = useSetAtom(selectedTeamAtom);
  const setSelectedProject = useSetAtom(selectedProjectAtom);
  const tables = useAtomValue(tablesFromCurrentProjectAtom);

  React.useEffect(() => {
    setSelectedTeam(team);
    setSelectedProject(project);
  }, [setSelectedTeam, team, setSelectedProject, project]);

  const [showNewTableDialog, setShowNewTableDialog] = React.useState(false);

  return (
    <main className="sticky top-0 flex flex-col space-y-4 border-b bg-white px-4 py-3">
      <div className="container mx-auto px-4 py-8">
        <div className="mx-auto flex w-full max-w-3xl flex-col space-y-4 p-4">
          <div className="flex w-full max-w-3xl flex-col space-y-4">
            {tables?.map((table) => (
              <Link
                key={table.id}
                href={`/${team.slug}/${project.slug}/${table.slug}`}
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
            <Button onClick={() => setShowNewTableDialog(true)}>
              New Table
            </Button>
          </NewTableDialog>
        </div>
      </div>
    </main>
  );
}
