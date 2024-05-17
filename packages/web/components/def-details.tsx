import { type schema } from "@tableland/studio-store";
import { type RouterOutputs } from "@tableland/studio-api";
import { AlertCircle } from "lucide-react";
import DeployButton from "./deploy-button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import DefColumns from "@/components/def-columns";
import DefConstraints from "@/components/def-constraints";
import { cn } from "@/lib/utils";

export default async function DefDetails({
  def,
  env,
  isAuthorized,
}: {
  def: Pick<schema.Def, "id" | "name" | "schema">;
  env?: schema.Environment;
  isAuthorized?: RouterOutputs["teams"]["isAuthorized"];
}) {
  return (
    <div className="container max-w-2xl space-y-5">
      {env && (
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2 text-destructive">
              <AlertCircle
                className={cn(!isAuthorized && "text-muted-foreground")}
              />
              <CardTitle className={cn(!isAuthorized && "text-foreground")}>
                Table undeployed
              </CardTitle>
            </div>
            <CardDescription>
              Table definition {def.name} has has not yet been deployed to
              Tableland.
            </CardDescription>
          </CardHeader>
          {!!isAuthorized && env && (
            <CardContent className="text-center">
              <DeployButton env={env} def={def} />
            </CardContent>
          )}
        </Card>
      )}
      <Card>
        <CardHeader>
          <CardTitle>Columns</CardTitle>
          <CardDescription>
            Table definition {def.name} has the following columns:
          </CardDescription>
        </CardHeader>
        <CardContent>
          <DefColumns columns={def.schema.columns} />
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Table-wide constraints</CardTitle>
          <CardDescription>
            {def.schema.tableConstraints
              ? `Table definition ${def.name} includes the following table-wide constraints
            that apply to one or more columns:`
              : `Table definition ${def.name} doesn't have any table-wide constraints.`}
          </CardDescription>
        </CardHeader>
        {def.schema.tableConstraints && (
          <CardContent>
            <DefConstraints tableConstraints={def.schema.tableConstraints} />
          </CardContent>
        )}
      </Card>
    </div>
  );
}
