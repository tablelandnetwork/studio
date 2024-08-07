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

export default async function NeedsDeploy({
  def,
  env,
  isAuthorized,
}: {
  def: Pick<schema.Def, "id" | "name" | "schema">;
  env: schema.Environment;
  isAuthorized?: RouterOutputs["orgs"]["isAuthorized"];
}) {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <AlertCircle />
          <CardTitle>Table undeployed</CardTitle>
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
  );
}
