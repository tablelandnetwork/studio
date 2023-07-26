"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";

import { DeploymentsWithTables } from "@/db/api/deployments";
import { Project, Table, Team } from "@/db/schema";
import { DialogProps } from "@radix-ui/react-dialog";
// import { helpers } from "@tableland/sdk";
import { Plus } from "lucide-react";
import { Button } from "./ui/button";

interface TableDialogProps extends DialogProps {
  project: Project;
  team: Team;
  tables: Table[];
  deployments: DeploymentsWithTables[];
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
                <CardTitle>
                  Deployment on{" "}
                  {/* helpers.getChainInfo(deployment.chain).chainName */} at
                  block {deployment.block}
                </CardTitle>
                {/* <CardDescription>{table.description}</CardDescription> */}
              </CardHeader>
              <CardContent>
                <ul>
                  {deployment.tables.map((table: any) => {
                    return (
                      <li key={table.id}>
                        <strong>{table.tableName}</strong>
                        <p>{table.schema}</p>
                      </li>
                    );
                  })}
                </ul>
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
