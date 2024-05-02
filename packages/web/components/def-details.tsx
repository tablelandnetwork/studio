import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import DefColumns from "@/components/def-columns";
import DefConstraints from "@/components/def-constraints";
import { schema } from "@tableland/studio-store";

export default async function DefDetails({
  def,
}: {
  def: Pick<schema.Def, "name" | "description" | "schema">;
}) {
  return (
    <div className="container max-w-2xl space-y-5">
      <Card>
        <CardHeader>
          <CardTitle>Description</CardTitle>
          <CardDescription>{def.description}</CardDescription>
        </CardHeader>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Columns</CardTitle>
          <CardDescription>
            Definition {def.name} has the following columns:
          </CardDescription>
        </CardHeader>
        <CardContent>
          <DefColumns columns={def.schema.columns} />
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Definition constraints</CardTitle>
          <CardDescription>
            {def.schema.tableConstraints
              ? `Definition ${def.name} includes the following table-wide constraints
            that apply to one or more columns:`
              : `Definition ${def.name} doesn't have any table-wide constraints.`}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <DefConstraints tableConstraints={def.schema.tableConstraints} />
        </CardContent>
      </Card>
    </div>
  );
}
