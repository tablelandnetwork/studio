import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { schema } from "@tableland/studio-store";
import { BoxSelect, CheckSquare } from "lucide-react";
import Link from "next/link";

interface SidebarProps extends React.HTMLAttributes<HTMLDivElement> {
  environments: schema.Environment[];
  selectedEnvironment?: schema.Environment;
  tables: schema.Table[];
  selectedTable?: schema.Table;
  deployments: schema.Deployment[];
  teamSlug: string;
  projectSlug: string;
}

export function Sidebar({
  className,
  environments,
  selectedEnvironment,
  tables,
  selectedTable,
  deployments,
  teamSlug,
  projectSlug,
}: SidebarProps) {
  const depolymentsMap = deployments.reduce((acc, deployment) => {
    if (!acc.has(deployment.environmentId)) {
      acc.set(deployment.environmentId, new Map<string, schema.Deployment>());
    }
    return acc;
  }, new Map<string, Map<string, schema.Deployment>>());

  return (
    <div className={cn("pb-12", className)}>
      <div className="px-3 py-2">
        <div className="flex flex-col space-y-1">
          <Link href={`/${teamSlug}/${projectSlug}/deployments`}>
            <Button
              variant={selectedTable ? "ghost" : "secondary"}
              className="w-full justify-start"
            >
              Overview
            </Button>
          </Link>
        </div>
      </div>
      {environments.map((environment) => (
        <div key={environment.id} className="px-3 py-2">
          <h2 className="mb-2 px-4 text-lg font-semibold tracking-tight">
            {/* TODO: Swap these once we unhide environments */}
            Tables
            {/* {environment.name} */}
          </h2>
          <div className="flex flex-col space-y-1">
            {tables.map((table) => (
              <Link
                key={table.id}
                href={`/${teamSlug}/${projectSlug}/deployments/${environment.name}/${table.name}`}
              >
                <Button
                  variant={
                    environment.id === selectedEnvironment?.id &&
                    table.id === selectedTable?.id
                      ? "secondary"
                      : "ghost"
                  }
                  className="w-full"
                >
                  <span>{table.name}</span>
                  {depolymentsMap.get(environment.id)?.get(table.id) ? (
                    <CheckSquare className="ml-auto text-green-400" />
                  ) : (
                    <BoxSelect className="ml-auto text-red-400" />
                  )}
                </Button>
              </Link>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
