import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { schema } from "@tableland/studio-store";
import { Table2 } from "lucide-react";
import Link from "next/link";

interface SidebarProps extends React.HTMLAttributes<HTMLDivElement> {
  environments: schema.Environment[];
  selectedEnvironment?: schema.Environment;
  tables: schema.Table[];
  selectedTable?: schema.Table;
  deploymentsMap: Map<string, Map<string, schema.Deployment>>;
  teamSlug: string;
  projectSlug: string;
  isAuthorized: boolean;
}

export function Sidebar({
  className,
  environments,
  selectedEnvironment,
  tables,
  selectedTable,
  deploymentsMap,
  teamSlug,
  projectSlug,
  isAuthorized,
}: SidebarProps) {
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
            {tables.map((table) => {
              const deployment = deploymentsMap
                .get(environment.id)
                ?.get(table.id);
              const button = (
                <Button
                  variant={
                    environment.id === selectedEnvironment?.id &&
                    table.id === selectedTable?.id
                      ? "secondary"
                      : "ghost"
                  }
                  className="w-full justify-start"
                  disabled={!isAuthorized && !deployment}
                >
                  <Table2
                    className={cn(
                      "mr-2",
                      !deployment && "text-red-400 opacity-40",
                    )}
                  />
                  <span>{table.name}</span>
                </Button>
              );
              return isAuthorized || deployment ? (
                <Link
                  key={table.id}
                  href={`/${teamSlug}/${projectSlug}/deployments/${environment.slug}/${table.name}`}
                >
                  {button}
                </Link>
              ) : (
                button
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}
