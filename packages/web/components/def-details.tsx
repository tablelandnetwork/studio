import { type Schema } from "@tableland/studio-store";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import DefColumns from "@/components/def-columns";
import DefConstraints from "@/components/def-constraints";

export default function DefDetails({
  name,
  schema,
}: {
  name: string;
  schema: Schema;
}) {
  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Columns</CardTitle>
          <CardDescription>{name} has the following columns:</CardDescription>
        </CardHeader>
        <CardContent>
          <DefColumns columns={schema.columns} />
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Table-wide constraints</CardTitle>
          <CardDescription>
            {schema.tableConstraints
              ? `${name} includes the following table-wide constraints
            that apply to one or more columns:`
              : `${name} doesn't have any table-wide constraints.`}
          </CardDescription>
        </CardHeader>
        {schema.tableConstraints && (
          <CardContent>
            <DefConstraints tableConstraints={schema.tableConstraints} />
          </CardContent>
        )}
      </Card>
    </>
  );
}
