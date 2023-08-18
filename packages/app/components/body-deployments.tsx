"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";

import { Deployment, Project, Table, Team } from "@/db/schema";
import { DialogProps } from "@radix-ui/react-dialog";
// import { helpers } from "@tableland/sdk";
import { Plus } from "lucide-react";
import { Button } from "./ui/button";

interface TableDialogProps extends DialogProps {
  project: Project;
  team: Team;
  tables: Table[];
  deployments: Deployment[];
}

export default function BodyDeployments(props: TableDialogProps) {
  const { project, team, tables, deployments } = props;

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col space-y-4 p-4">
      <div className="flex w-full max-w-3xl flex-col space-y-4">
        {deployments.map((deployment) => (
          <Link
            key={deployment.id}
            href={`/${team.slug}/${project.slug}/deployment/${deployment.id}`}
          >
            <Card>
              <CardHeader>
                <CardTitle>Deployment: {deployment.tableUuName}</CardTitle>
              </CardHeader>
              <CardContent>
                <strong>{deployment.tableUuName}</strong>:{" "}
                <em>{deployment.tableUuName}</em>
                <p>{deployment.schema}</p>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
      <Card className="">
        <CardHeader className="items-center">
          <CardTitle>New Deployment</CardTitle>
        </CardHeader>
        <CardContent className="flex items-center justify-center">
          <Link href={`/${team.slug}/${project.slug}/new-deployment`}>
            <Button variant={"ghost"}>
              <Plus />
            </Button>
          </Link>
        </CardContent>
      </Card>
    </div>
  );
}
