import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { selectedProjectAtom } from "@/store/projects";
import { selectedTeamAtom } from "@/store/teams";
import { useSetAtom } from "jotai";

import { Project, Table, Team } from "@/db/schema";
import { DialogProps } from "@radix-ui/react-dialog";
import React from "react";

interface TablePageProps extends DialogProps {
  project: Project;
  team: Team;
  personalTeam: Team;
  table: Table;
}

export default function Body(props: TablePageProps) {
  const { project, team, table } = props;

  const setSelectedTeam = useSetAtom(selectedTeamAtom);
  const setSelectedProject = useSetAtom(selectedProjectAtom);

  React.useEffect(() => {
    setSelectedTeam(team);
    setSelectedProject(project);
  }, [setSelectedTeam, team, setSelectedProject, project]);

  return (
    <main className="sticky top-0 flex flex-col space-y-4 border-b bg-white px-4 py-3">
      <div className="container mx-auto px-4 py-8">
        <div className="mx-auto flex w-full max-w-3xl flex-col space-y-4 p-4">
          <div className="flex w-full max-w-3xl flex-col space-y-4">
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
          </div>
        </div>
      </div>
    </main>
  );
}
