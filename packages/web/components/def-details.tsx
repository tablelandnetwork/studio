import { type schema } from "@tableland/studio-store";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import DefColumns from "@/components/def-columns";
import DefConstraints from "@/components/def-constraints";

export default async function DefDetails({
  def,
}: {
  def: Pick<schema.Def, "name" | "description" | "schema">;
}) {
  return (
    <div className="container max-w-2xl space-y-5">
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
        <CardContent>
          <DefConstraints tableConstraints={def.schema.tableConstraints} />
        </CardContent>
      </Card>
    </div>
  );
}
